// api/pcloud-tracks.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN = process.env.PCLOUD_TOKEN!;
const FOLDER_PATH = process.env.PCLOUD_FOLDER_PATH;     // e.g. "/Public/music"
const FOLDER_ID = process.env.PCLOUD_FOLDERID;          // alternative to path
const PUBLIC_BASE = process.env.PCLOUD_PUBLIC_BASE;     // e.g. "https://filedn.com/.../music/"

async function pcloud(method: string, params: Record<string, string | number | boolean>) {
  const url = new URL(`https://api.pcloud.com/${method}`);
  if (!TOKEN) throw new Error('Missing PCLOUD_TOKEN');
  url.searchParams.set('access_token', TOKEN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const r = await fetch(url);
  const data = await r.json();
  if (data.result !== 0) throw new Error(data.error || `pCloud error (${method})`);
  return data;
}

function toTrack(entry: any, url: string | null) {
  return {
    id: entry.fileid,
    title: entry.name.replace(/\.[^.]+$/, ''),
    artist: 'PulseNexis',
    url,
    size: entry.size,
    modified: entry.modified,
    mime: entry.contenttype || null,
    cover: null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1) list the folder by path OR id
    const list = await pcloud(
      'listfolder',
      FOLDER_PATH ? { path: FOLDER_PATH, nofiles: 0 } :
      FOLDER_ID   ? { folderid: FOLDER_ID, nofiles: 0 } :
      { folderid: 0, nofiles: 0 } // root fallback
    );

    const items = list?.metadata?.contents ?? [];

    // 2) filter audio files
    const audio = items.filter((x: any) => !x.isfolder && /\.(mp3|m4a|wav|flac)$/i.test(x.name));

    // 3) resolve a streamable URL for each file
    const tracks = await Promise.all(audio.map(async (x: any) => {
      try {
        const link = await pcloud('getfilelink', { fileid: x.fileid });
        const host = link.hosts?.[0];
        const path = link.path;
        const url = host && path ? `https://${host}${path}` : null;
        return toTrack(x, url);
      } catch {
        // fallback for public folders mirrored on filedn.com
        const fallback = PUBLIC_BASE ? new URL(encodeURIComponent(x.name), PUBLIC_BASE).toString() : null;
        return toTrack(x, fallback);
      }
    }));

    res.setHeader('Cache-Control', 'public, max-age=120');
    res.status(200).json({ tracks });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal error' });
  }
}
