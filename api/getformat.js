const { execFile } = require("child_process");
const { path: ytDlpPath } = require("yt-dlp-static");

module.exports = async (req, res) => {
  const url = req.query.url;
  const format_id = req.query.format_id;

  if (!url || !format_id)
    return res.status(400).json({ ok:false, msg:"Missing url or format_id" });

  execFile(
    ytDlpPath,
    ["-f", format_id, "-g", url],
    { maxBuffer: 1024 * 1024 * 30 },
    (err, stdout) => {
      if (err) {
        return res.status(500).json({ ok:false, msg: err.message });
      }

      const direct = stdout.trim();
      if (!direct.startsWith("http")) {
        return res.status(500).json({ ok:false, msg:"Invalid URL returned" });
      }

      res.redirect(302, direct);
    }
  );
};
