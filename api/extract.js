// api/extract.js
import youtubedl from 'youtube-dl-exec';

export default async function handler(req, res) {
  const url = req.query.url || (req.body && req.body.url);
  if (!url) return res.status(400).json({ ok:false, msg: 'missing url' });

  try {
    // dumpSingleJson mengembalikan metadata + formats (resolutions)
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      // increase timeouts / retries if perlu (tweak)
    });

    // Normalisasi sedikit: pilih fields penting
    const out = {
      id: info.id,
      title: info.title,
      thumbnail: info.thumbnail || info.thumbnails && info.thumbnails[0] && info.thumbnails[0].url,
      uploader: info.uploader,
      duration: info.duration,
      formats: (info.formats || []).map(f => ({
        format_id: f.format_id || f.itag || f.format,
        ext: f.ext || f.container || '',
        quality: f.qualityLabel || f.quality || f.format_note || '',
        filesize: f.filesize || f.filesize_approx || 0,
        abr: f.abr || f.audioBitrate || null,
        url: f.url || f.http_headers && f.http_headers.Referer ? null : f.url // some formats already have url
      }))
    };

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.json({ ok:true, data: out });
  } catch (e) {
    console.error('extract error', e);
    return res.status(500).json({ ok:false, msg: e.message || 'extract failed' });
  }
}
