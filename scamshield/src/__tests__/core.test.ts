import { describe, expect, it } from 'vitest';
import { SAMPLES } from '../data/samples';
import { levelFromScore, clampScore } from '../lib/risk';
import { validateMessage, validateUrl, MESSAGE_MAX_CHARS } from '../lib/validation';
import { messageFacts, urlFacts } from '../lib/facts';
import { matchSample } from '../services/analysisService';

describe('risk bands', () => {
  it.each([
    [0, 'LOW'], [24, 'LOW'], [25, 'MEDIUM'], [49, 'MEDIUM'],
    [50, 'HIGH'], [74, 'HIGH'], [75, 'CRITICAL'], [100, 'CRITICAL'],
  ])('score %i → %s', (score, level) => expect(levelFromScore(score)).toBe(level));

  it('clamps out-of-range and invalid scores', () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(150)).toBe(100);
    expect(clampScore(Number.NaN)).toBe(0);
  });
});

describe('demo samples are internally consistent', () => {
  it.each(SAMPLES.map((s) => [s.id, s]))('%s: points add up to the score and level matches', (_id, s) => {
    const total = s.report.indicators.reduce((sum, i) => sum + i.points, 0);
    expect(total).toBe(s.report.score);
    expect(levelFromScore(s.report.score)).toBe(s.report.level);
    expect(s.report.limitations.some((l) => l.toLowerCase().includes('simulated'))).toBe(true);
  });

  it('covers every risk level for review', () => {
    expect(new Set(SAMPLES.map((s) => s.report.level))).toEqual(new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']));
  });
});

describe('real content is never matched to a demo report', () => {
  it('only exact example text matches', () => {
    expect(matchSample('message', SAMPLES[0].content)).toBeDefined();
    expect(matchSample('message', 'Your account is restricted, send OTP now')).toBeUndefined();
    expect(matchSample('url', 'https://www.wikipedia.org')).toBeDefined();
    expect(matchSample('url', 'https://www.wikipedia.org/wiki/Scam')).toBeUndefined();
  });
});

describe('validateMessage', () => {
  it('rejects empty and whitespace-only input', () => {
    expect(validateMessage('').ok).toBe(false);
    expect(validateMessage('   \n\t ').ok).toBe(false);
  });
  it('rejects very short input', () => expect(validateMessage('hi').ok).toBe(false));
  it('rejects input over the limit', () => expect(validateMessage('a'.repeat(MESSAGE_MAX_CHARS + 1)).ok).toBe(false));
  it('accepts input exactly at the limit', () => expect(validateMessage('a'.repeat(MESSAGE_MAX_CHARS)).ok).toBe(true));
  it('strips control characters but keeps line breaks', () => {
    const r = validateMessage('Hello\u0000 there\nfriend, how are you?');
    expect(r.ok && r.value).toBe('Hello there\nfriend, how are you?');
  });
});

describe('validateUrl', () => {
  const ok = (s: string) => {
    const r = validateUrl(s);
    return r.ok ? r.value.href : null;
  };
  it('adds https:// when missing', () => expect(ok('example.com/login')).toBe('https://example.com/login'));
  it('trims whitespace', () => expect(ok('  https://example.com  ')).toBe('https://example.com/'));
  it('accepts host:port without a scheme', () => expect(ok('example.com:8080')).toBe('https://example.com:8080/'));
  it.each(['javascript:alert(1)', 'file:///etc/passwd', 'ftp://example.com', 'data:text/html,hi', 'mailto:a@b.com'])(
    'rejects non-web scheme %s',
    (s) => expect(validateUrl(s).ok).toBe(false),
  );
  it.each(['', '   ', 'not a url', 'https://', 'localhost', 'http://exa mple.com'])('rejects invalid input %j', (s) =>
    expect(validateUrl(s).ok).toBe(false),
  );
  it('rejects overlong links', () => expect(validateUrl(`https://a.com/${'x'.repeat(2100)}`).ok).toBe(false));
  it('allows user@host links through so they can be flagged later', () =>
    expect(ok('https://bank.com@evil.example/')).toBe('https://bank.com@evil.example/'));
});

describe('facts', () => {
  it('counts links and Nigerian phone numbers in a message', () => {
    const f = Object.fromEntries(messageFacts('Call 0812 345 6789 or visit https://x.example/a now').map((x) => [x.label, x.value]));
    expect(f['Links found']).toBe('1');
    expect(f['Nigerian phone numbers found']).toBe('1');
  });
  it('reports plain URL facts without judgement', () => {
    const f = Object.fromEntries(urlFacts(new URL('http://192.168.0.1:8080/a?x=1&y=2')).map((x) => [x.label, x.value]));
    expect(f['Protocol']).toMatch(/^HTTP /);
    expect(f['Host type']).toMatch(/IP address/);
    expect(f['Custom port']).toBe('8080');
    expect(f['Query parameters']).toBe('2');
  });
});
