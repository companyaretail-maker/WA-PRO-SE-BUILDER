import watermarkUrl from '../assets/download.jpg';
import { buildPleadingPdf, todayLongForm, type CaseCaption, type FactEntry } from './pleading';

let cachedWatermark: Uint8Array | null | undefined;

async function loadWatermark(): Promise<Uint8Array | undefined> {
  if (cachedWatermark !== undefined) return cachedWatermark ?? undefined;
  try {
    const res = await fetch(watermarkUrl);
    cachedWatermark = res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
  } catch {
    cachedWatermark = null;
  }
  return cachedWatermark ?? undefined;
}

/**
 * Renders the WATERMARKED preview only.
 *
 * The clean, filable PDF is produced by the server at /api/packet/pdf against a
 * signed entitlement token. Keeping the un-watermarked path out of the bundle is
 * the whole point: a paywall the browser can flip is not a paywall.
 */
export async function generateDraftPleading(
  caption: CaseCaption,
  facts: FactEntry[],
): Promise<Uint8Array> {
  return buildPleadingPdf(caption, facts, {
    watermark: true,
    watermarkImage: await loadWatermark(),
    signedOn: todayLongForm(),
  });
}

/** Fetches the clean packet from the server. Throws if the token is not valid. */
export async function fetchPaidPacket(
  token: string,
  caption: CaseCaption,
  facts: FactEntry[],
): Promise<Blob> {
  const res = await fetch('/api/packet/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, caption, facts }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || 'Could not download the packet.');
  }
  return res.blob();
}
