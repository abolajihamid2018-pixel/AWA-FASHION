/**
 * Plain facts about a submission that can be read directly from the text,
 * with no judgement attached. Stage 1 shows these for real content instead of
 * a made-up verdict. Stages 2 and 3 will use them as inputs to scoring.
 */

export interface Fact {
  label: string;
  value: string;
}

const URL_IN_TEXT = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;

export function messageFacts(text: string): Fact[] {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const links = text.match(URL_IN_TEXT) ?? [];
  const phoneLike = text.match(/(?:\+?234|0)[789][01]\d[\s-]?\d{3}[\s-]?\d{4}\b/g) ?? [];
  return [
    { label: 'Length', value: `${text.length.toLocaleString()} characters, ${words.toLocaleString()} words` },
    { label: 'Links found', value: links.length ? `${links.length}` : 'None' },
    { label: 'Nigerian phone numbers found', value: phoneLike.length ? `${phoneLike.length}` : 'None' },
  ];
}

export function extractLinks(text: string): string[] {
  return Array.from(new Set(text.match(URL_IN_TEXT) ?? [])).slice(0, 5);
}

export function urlFacts(url: URL): Fact[] {
  const host = url.hostname;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[');
  const labels = host.split('.').filter(Boolean);
  return [
    { label: 'Protocol', value: url.protocol === 'https:' ? 'HTTPS (encrypted connection)' : 'HTTP (not encrypted)' },
    { label: 'Host', value: host },
    { label: 'Host type', value: isIp ? 'IP address, not a name' : `${labels.length}-part domain name` },
    { label: 'Contains punycode (xn--)', value: host.includes('xn--') ? 'Yes' : 'No' },
    { label: 'Contains "user@" before the host', value: url.username ? 'Yes' : 'No' },
    { label: 'Custom port', value: url.port || 'None' },
    { label: 'Path', value: url.pathname === '/' ? '/' : url.pathname.slice(0, 80) + (url.pathname.length > 80 ? '…' : '') },
    { label: 'Query parameters', value: `${Array.from(url.searchParams.keys()).length}` },
    { label: 'Total length', value: `${url.href.length} characters` },
  ];
}
