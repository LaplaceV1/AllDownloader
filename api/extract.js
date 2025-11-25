export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).json({ ok:false, msg:"No URL provided" });

  const lower = url.toLowerCase();

  // ==============================
  // 1) DETECT PLATFORM
  // ==============================
  let platform = "unknown";
  if (lower.includes("tiktok.com")) platform = "tiktok";
  else if (lower.includes("instagram.com")) platform = "instagram";
  else if (lower.includes("facebook.com") || lower.includes("fb.watch")) platform = "facebook";
  else if (lower.includes("youtu.be") || lower.includes("youtube.com")) platform = "youtube";

  // ==============================
  // 2) HANDLE PLATFORM
  // ==============================

  // ==== TIKTOK ====
  if (platform === "tiktok") {
    const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const r = await fetch(api);
    const j = await r.json();

    if (!j || !j.data) return res.json({ ok:false });

    return res.json({
      ok: true,
      platform: "tiktok",
      title: j.data.title,
      thumbnail: j.data.cover,
      formats: [
        { quality: "no_watermark", url: j.data.play },
        { quality: "watermark", url: j.data.wmplay },
        { quality: "music", url: j.data.music }
      ]
    });
  }

  // ==== INSTAGRAM ====
  if (platform === "instagram") {
    const api = `https://instagramdownloader.io/api/v1/instagram?url=${encodeURIComponent(url)}`;
    const r = await fetch(api);
    const j = await r.json();

    if (!j || !j.download_url) return res.json({ ok:false });

    return res.json({
      ok: true,
      platform: "instagram",
      title: j.title || "Instagram Media",
      thumbnail: j.thumbnail || null,
      formats: [
        { quality: "default", url: j.download_url }
      ]
    });
  }

  // ==== FACEBOOK ====
  if (platform === "facebook") {

    const r = await fetch("https://snapsave.app/api/ajaxSearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: `q=${encodeURIComponent(url)}`
    });

    const j = await r.json();

    if (!j || !j.data) return res.json({ ok:false });

    const formats = [];

    if (j.data[0]?.url) formats.push({ quality: "hd", url: j.data[0].url });
    if (j.data[1]?.url) formats.push({ quality: "sd", url: j.data[1].url });

    return res.json({
      ok: true,
      platform: "facebook",
      title: j.title || "Facebook Video",
      thumbnail: j.thumbnail || null,
      formats
    });
  }

  // ==== YOUTUBE ====
  if (platform === "youtube") {

    const r = await fetch("https://yt1s.com/api/ajaxSearch/index", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `q=${encodeURIComponent(url)}&vt=home`
    });

    const j = await r.json();

    if (!j || !j.links) return res.json({ ok:false });

    const formats = [];

    // video downloads
    for (const key in j.links.mp4) {
      formats.push({
        quality: j.links.mp4[key].q,
        url: j.links.mp4[key].k
      });
    }

    // audio optional
    for (const key in j.links.mp3) {
      formats.push({
        quality: j.links.mp3[key].q,
        url: j.links.mp3[key].k
      });
    }

    return res.json({
      ok: true,
      platform: "youtube",
      title: j.title,
      thumbnail: j.thumb,
      formats
    });
  }

  // ==============================
  // IF NOT SUPPORTED
  // ==============================
  return res.json({ ok:false, msg:"Platform not supported" });
}
