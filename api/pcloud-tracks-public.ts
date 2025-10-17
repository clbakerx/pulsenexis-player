import type { VercelRequest, VercelResponse } from '@vercel/node';

const PUBLIC_BASE = process.env.PCLOUD_PUBLIC_BASE; // e.g. https://filedn.com/ldxHrdHcf3tV7YntUkvw8R0/

function basename(u: string) {
  try {
    const url = new URL(u, PUBLIC_BASE);
    const parts = url.pathname.split('/');
    return decodeURIComponent(parts[parts.length - 1] || '');
  } catch { return u; }
}

function toTrack(href: string) {
  const abs = new URL(href, PUBLIC_BASE).toString();
  const title = basename(abs).replace(/\.[^.]+$/, '');
  return {
    id: abs,
    title,
    artist: 'PulseNexis',
    url: abs,
    size: undefined,
    modified: undefined,
    mime: 'audio/mpeg',
    cover: null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!PUBLIC_BASE) throw new Error('Missing PCLOUD_PUBLIC_BASE (must end with a /)');

    const r = await fetch(PUBLIC_BASE, { headers: { 'User-Agent': 'pulsenexis-player' } });
    if (!r.ok) throw new Error(`Public base fetch failed: HTTP ${r.status}`);
    const html = await r.text();

    // Grab any href that ends with an audio extension (handles relative links, ./, encoded spaces, etc.)
    const hrefMatches = Array.from(
      html.matchAll(/href="([^"]+\.(?:mp3|m4a|wav|flac))(?:\?[^"]*)?"/gi)
    );

    const tracks = hrefMatches
      .map((m) => m[1])
      .filter(Boolean)
      // de-dup in case index has multiple anchors to the same file
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(toTrack)
      // nice predictable order
      .sort((a, b) => a.title.localeCompare(b.title));

    res.setHeader('Cache-Control', 'public, max-age=120');
    res.status(200).json({ tracks, _debug: { found: tracks.length } });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to read public folder' });
  }
}
