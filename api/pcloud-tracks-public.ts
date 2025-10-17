// Vercel serverless function: tokenless public-folder scraper
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PUBLIC_BASE = process.env.PCLOUD_PUBLIC_BASE; // e.g. https://filedn.com/ldxHrdHcf3tV7YntUkvw8R0/

function toTrack(name: string, href: string) {
  return {
    id: href,
    title: name.replace(/\.[^.]+$/, ''),
    artist: 'PulseNexis',
    url: href,        // direct public link
    size: undefined,  // unknown in public listing
    modified: undefined,
    mime: 'audio/mpeg',
    cover: null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!PUBLIC_BASE) throw new Error('Missing PCLOUD_PUBLIC_BASE');

    // Fetch the simple HTML listing at your filedn base URL
    const htmlRes = await fetch(PUBLIC_BASE, { headers: { 'User-Agent': 'pulsenexis-player' } });
    const html = await htmlRes.text();

    // Very lightweight anchor parser (robust enough for the Public index)
    const anchors = Array.from(html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi))
      .map((m) => ({ href: m[1], text: m[2].trim() }))
      .filter((a) => a.text && a.text !== 'Parent directory');

    // Keep audio files only
    const audio = anchors.filter((a) => /\.(mp3|m4a|wav|flac)$/i.test(a.text));

    // Build absolute URLs
    const tracks = audio.map((a) => {
      const abs = new URL(a.href, PUBLIC_BASE).toString();
      return toTrack(a.text, abs);
    });

    // Optional: sort by name
    tracks.sort((a, b) => a.title.localeCompare(b.title));

    res.setHeader('Cache-Control', 'public, max-age=120');
    res.status(200).json({ tracks });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to read public folder' });
  }
}
