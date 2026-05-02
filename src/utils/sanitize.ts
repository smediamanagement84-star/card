/**
 * Tiny defence-in-depth helpers used across the card UI.
 * Untrusted user input lands in <a href>, <img src>, and exported vCards.
 * These helpers prevent javascript:/vbscript:/data: tricks and vCard injection.
 */

const SAFE_HTTP = /^https?:/i;
const BARE_DOMAIN = /^[a-z0-9][a-z0-9-]{0,62}(?:\.[a-z0-9][a-z0-9-]{0,62})+(?:\/.*)?$/i;
const DATA_IMAGE = /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;

/** Returns the URL only if it's safe to drop into an href / link target. */
export function safeLink(input?: string): string | undefined {
  if (!input) return undefined;
  const url = input.trim();
  if (!url) return undefined;
  if (SAFE_HTTP.test(url)) return url;
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return url;
  if (BARE_DOMAIN.test(url)) return `https://${url}`;
  return undefined;
}

/** Returns the URL only if it's safe to drop into an <img src>. */
export function safeImageSrc(input?: string): string | undefined {
  if (!input) return undefined;
  const url = input.trim();
  if (!url) return undefined;
  if (SAFE_HTTP.test(url)) return url;
  if (DATA_IMAGE.test(url)) return url;
  if (BARE_DOMAIN.test(url)) return `https://${url}`;
  return undefined;
}

// Strip ASCII control characters (0x00–0x1F and 0x7F).
// eslint-disable-next-line no-control-regex
const CTRL_CHARS = /[\x00-\x1F\x7F]/g;

/** RFC 6350 escape for a vCard property value. Strips control chars and CRLF. */
export function vCardEscape(value: string): string {
  return String(value)
    .replace(CTRL_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .trim();
}
