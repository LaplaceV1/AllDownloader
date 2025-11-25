// api/getformat.js
import { execFile } from "child_process";
import ytDlpPath from "yt-dlp-static";

export default function handler(req, res) {
  const url = req.query.url;
  const format_id = req.query.format_id;

  if (!url || !format_id)
    return res.status(400).json({ ok:false, msg:"Missing url/format" });

  execFile(
    ytDlpPath,
    [
      "-f", format_id,
      "-g",          // get direct link
      url
    ],
    { maxBuffer: 1024 * 1024 * 10 },
    (err, stdout) => {
      if (err) {
        return res.status(500).json({ ok:false, msg: err.message });
      }

      const direct = stdout.trim();
      if (!direct.startsWith("http")) {
        return res.status(500).json({ ok:false, msg:"Invalid URL" });
      }

      res.redirect(302, direct);
    }
  );
}
