/**
 * Input checks that run in the browser before anything is "submitted".
 *
 * These give users fast, friendly feedback. They are NOT a security boundary:
 * anyone can bypass browser code, so the server will repeat every check in
 * Stages 2 and 3.
 */

export const MESSAGE_MIN_CHARS = 10;
export const MESSAGE_MAX_CHARS = 5000;
export const URL_MAX_CHARS = 2048;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateMessage(raw: string): ValidationResult<string> {
  // Remove invisible control characters (keep normal line breaks and tabs).
  const cleaned = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (cleaned.length === 0) return { ok: false, error: 'Paste the message you want to check.' };
  if (cleaned.length < MESSAGE_MIN_CHARS)
    return { ok: false, error: `That is too short to assess. Paste at least ${MESSAGE_MIN_CHARS} characters.` };
  if (cleaned.length > MESSAGE_MAX_CHARS)
    return {
      ok: false,
      error: `That message is ${cleaned.length.toLocaleString()} characters. The limit is ${MESSAGE_MAX_CHARS.toLocaleString()}. Paste the most suspicious part.`,
    };
  return { ok: true, value: cleaned };
}

/**
 * Accepts what people actually paste ("example.com", " https://x.y/z ")
 * and returns a normalised http(s) URL, or a clear error.
 */
export function validateUrl(raw: string): ValidationResult<URL> {
  let input = raw.trim();
  if (input.length === 0) return { ok: false, error: 'Paste the link you want to check.' };
  if (input.length > URL_MAX_CHARS)
    return { ok: false, error: `That link is too long (limit ${URL_MAX_CHARS.toLocaleString()} characters).` };
  if (/\s/.test(input)) return { ok: false, error: 'A link cannot contain spaces. Check you copied only the link.' };

  // Reject other schemes explicitly before we add "https://".
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(input)?.[1]?.toLowerCase();
  if (scheme && scheme !== 'http' && scheme !== 'https') {
    // "example.com:8080" looks like a scheme but is a host and port.
    if (!/^[a-z0-9.-]+:\d+/i.test(input)) {
      return { ok: false, error: `Only web links (http or https) can be checked, not "${scheme}:" links.` };
    }
  }
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, error: 'That does not look like a valid web link.' };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    return { ok: false, error: 'Only web links (http or https) can be checked.' };
  if (!url.hostname || (!url.hostname.includes('.') && !url.hostname.startsWith('[')))
    return { ok: false, error: 'That link has no valid website name (for example, example.com).' };
  // Links with "user@" in them are valid but a known trick; detection flags them later.
  return { ok: true, value: url };
}
