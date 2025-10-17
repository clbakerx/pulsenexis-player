const TOKEN = process.env.PCLOUD_TOKEN;
const FOLDER_PATH = process.env.PCLOUD_FOLDER_PATH;
const FOLDER_ID = process.env.PCLOUD_FOLDERID;
const PUBLIC_BASE = process.env.PCLOUD_PUBLIC_BASE;

async function pcloud(method, params) {
  if (!TOKEN) throw new Error("Missing PCLOUD_TOKEN");
  const url = new URL(`https://api.pcloud.com/${method}`);
  url.searchParams.set("access_token", TOKEN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const r = await fetch(url);
  const data = await r.json();
  if (data.result !== 0) throw new Error(data.error || `pCloud error (${method})`);
  return data;
}

const toTrack = (x, url) => ({
  id: x.fileid,
  title: x.name.replace(/\.[^.]+$/, ""),
  artist: "PulseNexis",
  url,
  size: x.size,
  modified: x.modified,
  mime: x.contenttype || null,
  cover: null,
});

export default async function handler(req, res) {
  try {
    const listed = await pcloud(
      "listfolder",
      FOLDER_PATH ? { path: FOLDER_PATH, nofiles: 0 } :
      FOLDER_ID   ? { folderid: FOLDER_ID, nofiles: 0 } :
                    { folderid: 0, nofiles: 0 }
    );

    const items = listed?.metadata?.contents || [];
    const audio = items.filter((x) => !x.isfolder && /\.(mp3|m4a|wav|flac)$/i.test(x.name));

    const tracks = await Promise.all(
      audio.map(async (x) => {
        try {
          const link = await pcloud("getfilelink", { fileid: x.fileid });
          const host = link.hosts?.[0];
          const path = link.path;
          const url = host && path ? `https://${host}${path}` : null;
          return toTrack(x, url);
        } catch {
          const fallback = PUBLIC_BASE ? new URL(encodeURIComponent(x.name), PUBLIC_BASE).toString() : null;
          return toTrack(x, fallback);
        }
      })
    );

    res.setHeader("Cache-Control", "public, max-age=120");
    res.status(200).json({ tracks });
  } catch (e) {
    res.status(500).json({ error: e.message || "Internal error" });
  }
}
