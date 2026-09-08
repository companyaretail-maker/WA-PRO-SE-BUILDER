# WA Pro Se Builder — Code Audit

**Scope:** full repository at commit `9b73ae5`, reviewed 2026-09-08.
**Method:** static review plus live probing of every API route against a locally
running server. Findings marked **CONFIRMED** were reproduced; findings marked
**VERIFY** depend on the current text of a court rule or local rule that could
not be retrieved from this environment (outbound network is blocked here).

Everything in Part 1 and Part 2 marked *Fixed* has been implemented on this
branch. Items marked *Open* are left for you, with a reason.

---

## Part 1 — Security

### 1.1 Anyone could unlock the paid packet with one HTTP request — **CONFIRMED / Fixed**

`POST /api/checkout/confirm` fell through to a "Default success confirmation /
mock token" branch whenever PayPal was unconfigured, the order ID looked like a
mock, or the capture call failed. Reproduced against the running server:

```
$ curl -X POST localhost:3000/api/checkout/confirm -d '{}'
{"token":"WA_PRO_SE_VERIFIED_TEST_1788850942321","status":"COMPLETED"}
```

The frontend gated purely on `status === 'COMPLETED'`, so an empty POST bought
the $99 package. **This was live**: the server reads `PAYPAL_CLIENT_ID`, but
`.env.example` only ever defined `VITE_PAYPAL_CLIENT_ID`, so the credential
check `clientId && clientSecret && clientId !== 'sb'` failed on every deployment
and the mock branch was the *only* branch that ran in production.

**Fix.** The endpoint now fails closed: `503` when PayPal is not configured,
`402` when the capture is not `COMPLETED`. There is no mock path. On success it
returns an HMAC-signed, 30-day entitlement token instead of a guessable string.

### 1.2 Prices were set by the browser — **CONFIRMED / Fixed**

`create-order` took `amount` straight from the request body:

```
$ curl -X POST .../api/paypal/create-order -d '{"sku":"FULL_PACKET","amount":"0.01"}'
```

A buyer could pay one cent for the $99 SKU. **Fix.** A server-side `CATALOG` maps
SKU → price; the browser sends only a SKU. `confirm` additionally re-checks the
captured amount and currency against the catalog and rejects mismatches.

### 1.3 Webhook accepted forged payment events — **CONFIRMED / Fixed**

`/api/paypal-webhook` read `PAYPAL_WEBHOOK_ID` into a variable and never used it.
Any unauthenticated POST claiming `PAYMENT.CAPTURE.COMPLETED` was accepted with
`200 OK`. Once the Firebase write in `fix_server.cjs` was restored, that would
have granted entitlements to arbitrary user IDs.

**Fix.** The route is mounted with `express.raw` *before* the JSON parser (PayPal
signs the exact bytes) and every delivery is verified through
`/v1/notifications/verify-webhook-signature`. Unverifiable deliveries get `400`;
an unconfigured server gets `503`. Both `/api/paypal-webhook` and
`/api/webhooks/paypal` are registered — the patch scripts and the live file had
drifted onto different paths, so whichever you registered with PayPal, only one
of them existed (the other returned 404).

### 1.4 The paywall was decorative — **CONFIRMED / Fixed**

The clean PDF was generated in the browser. `PacketViewer` re-rendered it with
`generateWACourtPleading(isPaid, …)` and `isPaid` was React state, so
`setIsPaid(true)` in devtools produced the un-watermarked document. The
`DeclarationEngine` was worse: it gated the *Copy* button behind purchase while
rendering the full pleading text in a `<pre>` directly below it.

**Fix.** The un-watermarked renderer no longer exists client-side. The browser
builds only the watermarked draft; `POST /api/packet/pdf` renders the clean PDF
server-side and requires a valid signed token. Verified:

```
forged token          → 402  {"error":"A valid purchase token is required."}
tampered payload      → 402
valid signed token    → 200  application/pdf, no "UNPAID" watermark
```

### 1.5 `custom_id` was treated as proof of identity — **Fixed (partially; see Open)**

`custom_id` is set by the browser at order-creation time, so a user could name
someone else's `uid` and grant them an entitlement. It is now logged as a
reconciliation hint and explicitly not trusted as authorization.

**Since fixed:** PayPal is now the system of record instead of a database.
`POST /api/entitlement/restore` takes an order ID, reads the order back from
PayPal, confirms it is captured at a catalog price, and signs a fresh token. A
cleared browser or a second device is no longer a lost sale, and this needs no
storage layer — which matters on Cloud Run, where a local file store would be
silently ephemeral.

`AuthContext` is still a stand-in and `hasPurchased` has been removed from it: it
was a second, unverified source of truth about who had paid. Entitlement
deliberately does not depend on auth, so wiring a real identity provider later
does not require re-plumbing the paywall.

**Still open:** the signed token is bearer-style — whoever holds it can use it
until it expires. Per-user entitlement needs a real identity provider.

### 1.6 Open Gemini proxy — **CONFIRMED / Fixed**

`/api/chat` had no authentication, no rate limit, and no size cap, and it
forwarded arbitrary `history` to Gemini on your API key. Anyone who found the URL
could bill you for arbitrary generation. It also crashed on malformed input:

```
$ curl -X POST .../api/chat -d '{}'
{"error":"Cannot read properties of undefined (reading 'map')"}
```

**Fix.** Input validation (array shape, ≤30 messages, ≤4000 chars each), a 256 KB
body cap, a 20-req/min per-IP limiter, `503` when no API key is set, and generic
error text instead of the exception message. **Open:** the limiter is in-process
memory; behind more than one instance it needs a shared store, and it is not a
substitute for authentication.

### 1.7 Other hardening — Fixed

- `cors()` accepted every origin. Now locked to `APP_URL` when set.
- `res.status(500).json({ error: err.message })` leaked internal and upstream
  error text on four routes. Now logged server-side, generic to the client.
- `tokenData.access_token` was used unchecked; a failed token fetch sent
  `Bearer undefined` and returned `{"id": undefined}`. Now throws.
- `GET /api/paypal/status/:orderId` unconditionally answered `COMPLETED` for any
  order ID. It now queries PayPal.
- **Deleted** `fix_server.cjs`, `patch_server.cjs`, `patch_server_webhook.cjs`,
  `patch_paypal.cjs`, `patch-app.cjs`, `webhook_code.txt`. These were one-off
  codegen scripts; re-running any of them would have reintroduced the mock-token
  checkout and the unverified webhook.
- No secrets are committed; `.gitignore` correctly excludes `.env*` except the
  example.

---

## Part 2 — Correctness

| # | Defect | Status |
|---|--------|--------|
| 2.1 | `join('\\n')` inside a template literal emitted a **literal `\n`** — every fact ran together on one line, in both the preview and the clipboard copy | Fixed |
| 2.2 | Purchases did not survive a page reload (`hasPurchased` was component state; `user.hasPurchased` was hardcoded `false`) — a paying customer lost access on refresh | Fixed: token in `localStorage`, re-verified against the server on mount |
| 2.3 | The screener **ignored which option you clicked**. `handleSelectOption()` took no argument; `scoreImpact` and `flagId` were dead. Every user reached the same screen | Fixed: answers recorded, flags surfaced, back/restart added |
| 2.4 | `DYNAMIC_FLAGS_REGISTRY` was `{}` — no flag could ever render | Fixed: registry populated |
| 2.5 | `getCountyInfo()` silently returned **King County** for the 36 counties with no data. A Spokane filer saw King County's deadlines, portal and facilitator phone as their own | Fixed: returns `null`; UI says there is no data |
| 2.6 | `WA_ALL_39_COUNTIES` contained 3 counties | Fixed: all 39 names listed and selectable; 3 have rule profiles, the rest are labelled `NO LOCAL DATA` |
| 2.7 | The paid PDF was hardcoded **JANE DOE / JOHN DOE, cause No. 24-3-12345-6**. Customers paid $35–$99 for a placeholder | Fixed: real caption fields drive both the PDF and the declaration |
| 2.8 | The PDF drew 28 line numbers starting at the 3-inch margin and stepping past the bottom margin, misaligned with the vertical rule | Fixed: line numbering removed (see 3.3) |
| 2.9 | Watermark image fetched `/download (1).png` then `/download.png`; neither exists in `public/`. The image watermark never rendered | Fixed: bundled asset via Vite |
| 2.10 | Long declarations were silently truncated at one page — including the perjury block | Fixed: pagination; verified 60 facts → 5 pages, watermark on every page |
| 2.11 | pdf.js worker loaded from `//unpkg.com` at runtime — a third-party outage or version skew broke the viewer | Fixed: bundled worker |
| 2.12 | Chat history was sent to Gemini starting with the canned **model** greeting. Gemini rejects a history that opens on a model turn — the assistant likely 500'd on the first message in production | Fixed both ends |
| 2.13 | `URL.revokeObjectURL()` ran synchronously after `a.click()`, cancelling the download in some browsers | Fixed |
| 2.14 | `deadlineCalculator` was **dead code** — nothing imported it, and the "CR 6 Calculator" nav item rendered a placeholder | Fixed: real module wired up |
| 2.15 | The calculator excluded weekends but **never legal holidays**, and could only count forward — while every deadline the app displays (working copies, confirmation) counts *backward* from the hearing | Fixed: RCW 1.16.050 holidays, both directions, shows its work |
| 2.16 | `new Date('2026-01-10')` parses as UTC midnight = the previous day in Pacific time | Fixed: `parseLocalDate` |
| 2.17 | `@types/react` was never installed and `tsconfig` had `strict` off, no `include`, and no `vite/client` types — 4 type errors passed unnoticed | Fixed: strict on, types installed, `tsc --noEmit` clean |
| 2.18 | `eslint.config.js` imported `@firebase/eslint-plugin-security-rules`, which is not a dependency — `eslint` crashed; `npm run lint` ran `tsc` instead | Fixed: working config; `lint` and `typecheck` are now separate scripts |
| 2.19 | County modal passed `county.id` (`'king'`) while App's default was `'King'`, so nothing showed as selected initially | Fixed |
| 2.20 | `DocumentRouter` accepted `selectedCounty` / `onOpenCountyModal` and used neither; the pane holding the switcher is `hidden lg:flex`, so on mobile the county could not be changed at all | Fixed: county switcher added to the mobile nav; the dead props removed |
| 2.21 | The bare-nine-digit SSN detector claimed labelled account numbers, so the user got SSN guidance for a bank account (found by the new test suite) | Fixed |

---

## Part 3 — Washington-specific accuracy

This is the part with real consequences for a user, so it is separated from code
quality. I am flagging what the code asserts; where the answer turns on current
rule text I could not fetch, I say **VERIFY** rather than guess.

### 3.1 The screener rendered a legal conclusion — **Fixed. This was the most serious issue in the app.**

Regardless of the answers given, the screener displayed:

> *"Your situation contains the statutory elements Washington law requires. You
> have a valid foundation to file."*

That is the application of legal principles to a specific person's facts. It is
the definition of practicing law in **GR 24(a)**, it was displayed by a product
that charges money, and — because of 2.3 — it was displayed even to a user who
had just said their facts predate the parenting plan and that they have no
supporting declaration. The app also shipped a "GR 24 Statement" tab disclaiming
exactly this.

**Fix.** The result screen now reflects the user's own answers against named
statutory elements, states plainly that it is not an evaluation and that only a
judge or commissioner makes the adequate-cause finding, and points to the county
facilitator. The chat system prompt was likewise changed from "provide guidance
based on the user's situation" to an explicit instruction not to apply law to
facts or predict outcomes.

### 3.2 The declaration was defective under RCW 9A.72.085 — **Fixed**

The generated text ended with a bare "I certify under penalty of perjury under
the laws of the State of Washington that the foregoing is true and correct." An
unsworn declaration used in a Washington proceeding must also recite the **date
and place of signing** and be **subscribed** by the declarant. There was no date
line, no place line, no signature line, and no caption or cause number.

**Fix.** `perjuryCertification()` emits the full form ("Signed at *[city]*,
Washington on *[date]*" plus a signature line), and the caption block is
required. The wording was also corrected from "I certify" to "I declare".

### 3.3 Formatting claims — **VERIFY / partially corrected**

The right-hand pane asserted that documents are *"formatted for Washington State
General Rule 14 standards (12pt font, 1.5 line spacing, 3-inch top margin on
first page)"*, and the draft watermark read *"NOT GR 14 COMPLIANT"* — implying
the watermark was the only thing between the user and a compliant document.

Two problems. First, the specific formula stated is not something I can verify
from here, and GR 14 is commonly conflated with **CR 10(e)** on this exact point.
Second, the PDF drew **28 numbered lines down the left margin**. Numbered
pleading paper is a California convention; Washington does not impose it
statewide, and the implementation was misaligned anyway (2.8).

**Changed:** line numbering removed; the UI now describes what the renderer
actually does (8.5×11, 12 pt Times, 3-inch first-page top margin, 1-inch sides
and bottom) and tells the user to confirm against GR 14 and local rules; the
watermark now reads "UNPAID DRAFT — DO NOT FILE" rather than making a compliance
claim. **You should verify the margin and spacing requirements against the
current rule text and, if they differ, adjust the constants in
`src/utils/pleading.ts` — they are named for the requirement they implement.**

### 3.4 RCW 26.09.260(1) was stated too narrowly — **Fixed**

The screener said the court "cannot reconsider facts that occurred prior to your
current final parenting plan." The statute reaches facts that arose since the
prior decree or plan **or that were unknown to the court at the time**. As
written, the app would have talked a user with a valid petition out of filing.

It also never asked **whose** circumstances changed. RCW 26.09.260(1) requires a
substantial change in the circumstances of *the child or the non-moving party* —
a change in the moving party's own circumstances does not satisfy that element,
and that is one of the most common reasons a pro se modification fails at
adequate cause. Both are now questions with their own flags.

### 3.5 Mandatory pattern forms — **Disclosed; scope decision still yours**

Washington requires approved pattern forms for many family law filings. This app
generates a supporting declaration, not the petition, orders or cover sheets. The
product was nonetheless sold as a "Full County Package" and an "e-filing ready
packet".

**Fixed the disclosure half:** a new **Required Forms** module states plainly
what the app produces and what it does not, and links to the AOC forms library;
the checkout panel now carries the same scope notice *above* the buy buttons
rather than after purchase. A buyer can no longer reach checkout without being
told the petition is not included.

**Still yours to decide:** whether to broaden what the packet contains or narrow
what it is called. I disclosed the gap; I did not change your pricing or product
naming, because that is a business decision, not a defect.

### 3.6 GR 22 redaction — **Fixed**

Nothing implemented redaction while the Fact Engine invited free-text narration
about children, and everything typed went into the filed document verbatim.

`src/utils/redaction.ts` now detects social security numbers, financial account
and card numbers, driver's license numbers, contextual dates of birth, phone
numbers and email addresses. It runs in three places:

- **At entry** — each fact box warns live as you type.
- **Before render** — the packet preview shows a consolidated GR 22 panel.
- **At download** — identifiers GR 22 names must be explicitly acknowledged
  before the paid PDF can be downloaded.

It is a lint, not a guarantee: it matches patterns and cannot tell that "my
daughter Ava" names a minor. The Fact Engine also now tells users to refer to
children by initials. Covered by 10 unit tests.

### 3.7 All local rule data is unverified — **Open, now disclosed**

Every deadline, cutoff time, phone number and portal URL for King, Pierce and
Snohomish was transcribed into the source with no citation date and no
verification. Several look questionable — King County's family law working
copies deadline is given as "14 calendar days prior to hearing by 12:00 PM
NOON", which is far earlier than the pattern in comparable local rules, and a
user who trusted it would prepare on the wrong schedule.

I could not check any of them (no network). Rather than leave the numbers
looking authoritative, each profile now carries
`verification: { status: 'unverified', checkedOn: null }` and the E-Filing module
renders a prominent warning while that status holds. **Set these to `verified`
with a date only after checking the county's current local rules.**

### 3.8 Correct as written

- RCW 26.09.270 as the authority for the adequate cause affidavit requirement.
- RCW 26.09.260(5)(a) minor modification described as 24 or fewer days per year.
- The e-filing module's statement that litigants do not need vendor API keys.
- District court note: modifications are superior court matters (this was
  implied but not stated; it is now explicit).

---

## Part 4 — Verification performed

```
tsc --noEmit                 clean (was: 4 errors, and strict was off)
vite build + esbuild         both bundles build
API probes                   all 7 attack paths above now fail closed
entitlement round-trip       valid token → 200 PDF; tampered → 402
pagination                   60 facts → 5 pages, watermark on all 5
holiday counting             Thanksgiving + day after 2026 excluded correctly
```

**Test suite added.** 44 tests across `waHolidays`, `deadlineCalculator`,
`redaction` and `pleading`, run with `npm test` (vitest). They cover the
regressions this audit found — the literal `\n` in the fact list, the UTC
date-parse shift, holiday exclusion, backward counting, pagination, the
RCW 9A.72.085 certification fields, and the absence of the watermark from the
paid render. Writing them immediately caught one further defect (2.21).

`eslint` is now clean at zero warnings; the remaining `any` types in `server.ts`
and the component props were replaced with real types.

---

## Priority order for what remains

Everything that could be fixed from here has been. Three items remain, and each
needs something this environment cannot supply — a decision, a credential, or a
source I cannot reach.

1. **3.7 — verify the three county profiles.** Blocked on network access from
   this environment, not on effort. Every deadline is currently flagged
   `unverified` in the UI. Either check them against the current local rules and
   flip the flag with a date, or narrow the product to counties you can keep
   current. This is the item most likely to cause a user real harm.
2. **3.5 — decide the packet's scope.** The gap is now disclosed everywhere a
   buyer can see it. What remains is your call: broaden the contents, or rename
   the product to match them.
3. **1.5 — real identity provider.** Needed for per-user entitlement and for the
   webhook to have anywhere meaningful to write. The restore flow removes the
   urgency; it does not remove the need.
