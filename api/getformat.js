// api/getformat.js
import youtubedl from 'youtube-dl-exec';

export default async function handler(req, res) {
  const url = req.query.url;
  const format_id = req.query.format_id;

  if (!url || !format_id) return res.status(400).json({ ok:false, msg: 'missing url or format_id' });

  try {
    // get formats metadata (skipDownload true)
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      youtubeSkipDashManifest: true,
      preferFreeFormats: true
    });

    const formats = info.formats || [];
    const f = formats.find(x => (x.format_id == format_id) || (x.format == format_id) || (String(x.itag) == String(format_id)));
    if (!f) return res.status(404).json({ ok:false, msg:'format not found' });

    // If direct url present, redirect there
    if (f.url) {
      // Redirect to the provider's direct URL so the browser downloads directly from source
      return res.redirect(302, f.url);
    }

    // If direct URL not present, we can try to stream via yt-dlp but streaming large files on serverless can be problematic.
    // For production you'd implement a streaming approach with Range support on a dedicated server / VPS.
    return res.status(501).json({ ok:false, msg: 'Format has no direct url; streaming via server not implemented on serverless.'});
  } catch (e) {
    console.error('getformat error', e);
    return res.status(500).json({ ok:false, msg: e.message || 'failed' });
  }
}
