import type { GiftData } from './types';

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(fragment: string): Uint8Array {
  const bin = atob(fragment.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const buf = await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(buf);
}

// Payload is deflate-compressed so the share link (and its QR code) stays short.
export async function encodeGift(data: GiftData): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (typeof CompressionStream === 'undefined') return toBase64Url(bytes);
  return toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')));
}

function validate(text: string): GiftData | null {
  const parsed: unknown = JSON.parse(text);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const out: GiftData = {};
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

export async function decodeGift(fragment: string): Promise<GiftData | null> {
  let bytes: Uint8Array;
  try {
    bytes = fromBase64Url(fragment);
  } catch {
    return null;
  }
  // Try compressed first, then the legacy plain-JSON format (pre-compression links).
  if (typeof DecompressionStream !== 'undefined') {
    try {
      return validate(new TextDecoder().decode(await pipe(bytes, new DecompressionStream('deflate-raw'))));
    } catch {
      /* not a compressed payload */
    }
  }
  try {
    return validate(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
