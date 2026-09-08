import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { buildPleadingPdf, EMPTY_CAPTION, type CaseCaption, type FactEntry } from "./src/utils/pleading";

/**
 * Server-authoritative price list. The browser never gets to say what a thing
 * costs -- it only names a SKU.
 */
const CATALOG: Record<string, { amount: string; description: string }> = {
  SINGLE_FORM: { amount: "35.00", description: "WA Pro Se Builder - Single Form Unlock" },
  FULL_PACKET: { amount: "99.00", description: "WA Pro Se Builder - Full County Package" },
};

const ENTITLEMENT_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function entitlementSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret !== "YOUR_SESSION_SECRET") return secret;
  // Ephemeral secret: tokens stop verifying on restart, which is the safe
  // failure direction. Configure SESSION_SECRET in production.
  console.warn("SESSION_SECRET is not set; entitlement tokens will not survive a restart.");
  return (globalThis as any).__ephemeralSecret ||= crypto.randomBytes(32).toString("hex");
}

function signEntitlement(payload: { sku: string; orderId: string; captureId: string }): string {
  const body = { ...payload, exp: Date.now() + ENTITLEMENT_TTL_MS };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = crypto.createHmac("sha256", entitlementSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

function verifyEntitlement(token: unknown): { sku: string; orderId: string; exp: number } | null {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expected = crypto.createHmac("sha256", entitlementSecret()).update(encoded).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (typeof body.exp !== "number" || body.exp < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}

function paypalConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || "sandbox";
  const configured = Boolean(
    clientId && clientSecret && clientId !== "sb" && clientSecret !== "YOUR_PAYPAL_CLIENT_SECRET",
  );
  return {
    clientId,
    clientSecret,
    mode,
    configured,
    baseUrl: mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
  };
}

async function paypalToken(): Promise<string> {
  const { clientId, clientSecret, baseUrl } = paypalConfig();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data: any = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`PayPal token request failed (${res.status})`);
  }
  return data.access_token;
}

/** Rolling-window limiter. Single-process only; use a shared store behind >1 instance. */
function rateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      res.status(429).json({ error: "Too many requests. Please wait and try again." });
      return;
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

const MAX_CHAT_MESSAGES = 30;
const MAX_CHAT_CHARS = 4000;

function normalizeChatHistory(history: unknown): { role: "user" | "model"; parts: { text: string }[] }[] {
  if (!Array.isArray(history)) throw new Error("history must be an array");
  const cleaned = history
    .slice(-MAX_CHAT_MESSAGES)
    .map((m: any) => {
      const text = String(m?.parts?.[0]?.text ?? "").slice(0, MAX_CHAT_CHARS);
      return { role: m?.role === "user" ? ("user" as const) : ("model" as const), parts: [{ text }] };
    })
    .filter((m) => m.parts[0].text.length > 0);
  // Gemini rejects a conversation that opens on a model turn (the canned greeting).
  while (cleaned.length && cleaned[0].role === "model") cleaned.shift();
  if (!cleaned.length) throw new Error("history contains no user message");
  return cleaned;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const appUrl = process.env.APP_URL;

  app.use(
    cors({
      origin: appUrl && appUrl !== "MY_APP_URL" ? appUrl : true,
    }),
  );

  // The webhook needs the exact bytes PayPal signed, so it is mounted with a raw
  // body parser BEFORE the JSON parser claims the route.
  const webhookHandler = async (req: express.Request, res: express.Response) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    try {
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      const { configured, baseUrl } = paypalConfig();
      if (!webhookId || webhookId === "YOUR_PAYPAL_WEBHOOK_ID" || !configured) {
        console.error("Webhook rejected: PAYPAL_WEBHOOK_ID / PayPal credentials not configured.");
        res.status(503).send("Webhook verification not configured");
        return;
      }

      const token = await paypalToken();
      const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        // webhook_event must be the untouched payload; it is spliced in as raw text.
        body:
          `{"auth_algo":${JSON.stringify(req.header("paypal-auth-algo"))},` +
          `"cert_url":${JSON.stringify(req.header("paypal-cert-url"))},` +
          `"transmission_id":${JSON.stringify(req.header("paypal-transmission-id"))},` +
          `"transmission_sig":${JSON.stringify(req.header("paypal-transmission-sig"))},` +
          `"transmission_time":${JSON.stringify(req.header("paypal-transmission-time"))},` +
          `"webhook_id":${JSON.stringify(webhookId)},` +
          `"webhook_event":${rawBody}}`,
      });
      const verification: any = await verifyRes.json();
      if (verification.verification_status !== "SUCCESS") {
        console.error("Webhook signature verification failed:", verification.verification_status);
        res.status(400).send("Invalid signature");
        return;
      }

      const event = JSON.parse(rawBody);
      if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const capture = event.resource;
        // custom_id is attacker-controllable at order-creation time. Treat it as a
        // hint for reconciliation, never as proof of who owns the entitlement.
        console.log(
          `Verified capture ${capture?.id} (custom_id hint: ${capture?.custom_id ?? "none"}). ` +
            "No durable store is wired up; see AUDIT.md.",
        );
      }
      res.status(200).send("Webhook received");
    } catch (err: any) {
      console.error("Webhook error:", err?.message);
      res.status(500).send("Webhook processing error");
    }
  };

  app.post("/api/paypal-webhook", express.raw({ type: "*/*", limit: "1mb" }), webhookHandler);
  app.post("/api/webhooks/paypal", express.raw({ type: "*/*", limit: "1mb" }), webhookHandler);

  app.use(express.json({ limit: "256kb" }));

  app.post("/api/chat", rateLimiter(20, 60_000), async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        res.status(503).json({ error: "Assistant is not configured." });
        return;
      }
      const contents = normalizeChatHistory(req.body?.history);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are a procedural information assistant for Washington State family law.
Explain court procedure, rule names, and where to find official forms.
Do NOT apply law to the user's specific facts, predict outcomes, recommend a
course of action, or tell the user whether they have a valid case -- that is the
practice of law under Washington GR 24. When asked for such a conclusion, say so
and point the user to the county family law facilitator or a licensed attorney.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: { systemInstruction },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat error:", error?.message);
      res.status(500).json({ error: "The assistant could not answer that request." });
    }
  });

  app.get("/api/config", (_req, res) => {
    const { clientId, mode, configured } = paypalConfig();
    res.json({ paypalClientId: configured ? clientId : null, mode, paymentsEnabled: configured });
  });

  app.post("/api/paypal/create-order", rateLimiter(20, 60_000), async (req, res) => {
    try {
      const { sku, custom_id } = req.body ?? {};
      const item = CATALOG[String(sku)];
      if (!item) {
        res.status(400).json({ error: "Unknown SKU" });
        return;
      }
      const { configured, baseUrl } = paypalConfig();
      if (!configured) {
        res.status(503).json({ error: "Payments are not configured on this server." });
        return;
      }

      const token = await paypalToken();
      const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: sku,
              description: item.description,
              amount: { currency_code: "USD", value: item.amount },
              custom_id: typeof custom_id === "string" ? custom_id.slice(0, 127) : undefined,
            },
          ],
        }),
      });
      const orderData: any = await orderRes.json();
      if (!orderRes.ok || !orderData.id) {
        console.error("PayPal order creation failed:", orderRes.status, orderData?.name);
        res.status(502).json({ error: "Could not create the PayPal order." });
        return;
      }
      res.json({ id: orderData.id });
    } catch (err: any) {
      console.error("Create order error:", err?.message);
      res.status(500).json({ error: "Could not create the PayPal order." });
    }
  });

  app.post("/api/checkout/confirm", rateLimiter(20, 60_000), async (req, res) => {
    try {
      const { orderId, sku } = req.body ?? {};
      const item = CATALOG[String(sku)];
      if (!item || typeof orderId !== "string" || !orderId.trim()) {
        res.status(400).json({ error: "orderId and a known sku are required." });
        return;
      }
      const { configured, baseUrl } = paypalConfig();
      if (!configured) {
        // Fail closed. A server that cannot verify a payment must not grant access.
        res.status(503).json({ error: "Payments are not configured on this server." });
        return;
      }

      const token = await paypalToken();
      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const capture: any = await captureRes.json();

      if (capture.status !== "COMPLETED") {
        res.status(402).json({ error: "Payment was not completed.", status: capture.status ?? "UNKNOWN" });
        return;
      }

      // Confirm the buyer actually paid this SKU's price, not an amount of their choosing.
      const unit = capture.purchase_units?.[0];
      const paid = unit?.payments?.captures?.[0];
      const paidValue = paid?.amount?.value;
      const paidCurrency = paid?.amount?.currency_code;
      if (paidValue !== item.amount || paidCurrency !== "USD") {
        console.error(`Amount mismatch on order ${orderId}: expected ${item.amount} USD, got ${paidValue} ${paidCurrency}`);
        res.status(402).json({ error: "Payment amount did not match the purchased item." });
        return;
      }

      res.json({
        token: signEntitlement({ sku: String(sku), orderId, captureId: paid?.id ?? "" }),
        status: "COMPLETED",
        sku,
      });
    } catch (err: any) {
      console.error("Checkout confirm error:", err?.message);
      res.status(500).json({ error: "Payment confirmation failed." });
    }
  });

  app.post("/api/entitlement/verify", (req, res) => {
    const claims = verifyEntitlement(req.body?.token);
    res.json(claims ? { valid: true, sku: claims.sku, expiresAt: claims.exp } : { valid: false });
  });

  app.get("/api/paypal/status/:orderId", async (req, res) => {
    try {
      const { configured, baseUrl } = paypalConfig();
      if (!configured) {
        res.status(503).json({ error: "Payments are not configured on this server." });
        return;
      }
      const token = await paypalToken();
      const statusRes = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(req.params.orderId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: any = await statusRes.json();
      if (!statusRes.ok) {
        res.status(502).json({ error: "Could not read order status." });
        return;
      }
      res.json({ status: data.status, orderId: data.id });
    } catch (err: any) {
      console.error("Order status error:", err?.message);
      res.status(500).json({ error: "Could not read order status." });
    }
  });

  /**
   * The clean, un-watermarked pleading is rendered here and nowhere else. The
   * browser can only produce the watermarked draft, so removing the watermark
   * client-side gets an attacker nothing.
   */
  app.post("/api/packet/pdf", rateLimiter(30, 60_000), async (req, res) => {
    try {
      const claims = verifyEntitlement(req.body?.token);
      if (!claims) {
        res.status(402).json({ error: "A valid purchase token is required." });
        return;
      }
      const caption: CaseCaption = { ...EMPTY_CAPTION, ...(req.body?.caption ?? {}) };
      const facts: FactEntry[] = Array.isArray(req.body?.facts) ? req.body.facts.slice(0, 200) : [];
      const bytes = await buildPleadingPdf(caption, facts, { watermark: false });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="WA_ProSe_Packet.pdf"');
      res.send(Buffer.from(bytes));
    } catch (err: any) {
      console.error("Packet render error:", err?.message);
      res.status(500).json({ error: "Could not render the packet." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
