// api/extract.js
import { execFile } from "child_process";
import ytDlpPath from "yt-dlp-static";
import path from "path";

export default function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).json({ ok:false, msg:"URL missing" });

  execFile(
    ytDlpPath,
    [
      "--dump-json",
      "--no-warnings",
      "--no-call-home",
      "--skip-download",
      url
    ],
    { maxBuffer: 1024 * 1024 * 10 },
    (err, stdout) => {
      if (err) {
        return res.status(500).json({ ok:false, msg: err.message });
      }

      try {
        const info = JSON.parse(stdout);

        res.json({
          ok: true,
          data: {
            title: info.title,
            original_url: url,
            thumbnail: info.thumbnail,
            duration: info.duration,
            uploader: info.uploader,
            formats: info.formats.map(f => ({
              format_id: f.format_id,
              quality: f.format_note || f.qualityLabel || "",
              ext: f.ext,
              filesize: f.filesize || null
            }))
          }
        });

      } catch (e) {
        res.status(500).json({ ok:false, msg:"JSON parse error" });
      }
    }
  );
}
