const { execFile } = require("child_process");
const { path: ytDlpPath } = require("yt-dlp-static");

module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ ok: false, msg: "URL missing" });

  execFile(
    ytDlpPath,
    [
      "--dump-json",
      "--no-warnings",
      "--no-call-home",
      "--skip-download",
      url
    ],
    { maxBuffer: 1024 * 1024 * 20 },
    (err, stdout) => {
      if (err) {
        return res.status(500).json({ ok: false, msg: err.message });
      }

      try {
        const info = JSON.parse(stdout);

        res.json({
          ok: true,
          data: {
            original_url: url,
            title: info.title,
            thumbnail: info.thumbnail,
            uploader: info.uploader,
            duration: info.duration,
            formats: (info.formats || []).map(f => ({
              format_id: f.format_id,
              quality: f.format_note || f.qualityLabel || "",
              ext: f.ext || "",
              filesize: f.filesize || null
            }))
          }
        });

      } catch (e) {
        res.status(500).json({ ok: false, msg: "JSON parse fail" });
      }
    }
  );
};
