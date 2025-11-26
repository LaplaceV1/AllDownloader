import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ ok:false, msg:"No URL provided" });

    const lower = url.toLowerCase();
    let platform = "unknown";
    if (lower.includes("tiktok.com")) platform = "tiktok";
    else if (lower.includes("instagram.com")) platform = "instagram";
    else if (lower.includes("facebook.com") || lower.includes("fb.watch")) platform = "facebook";
    else if (lower.includes("youtu")) platform = "youtube";

    // TIKTOK
    if (platform === "tiktok") {
      const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const j = await r.json();
      if (!j?.data) return res.json({ ok:false });

      return res.json({
        ok: true,
        platform,
        title: j.data.title,
        thumbnail: j.data.cover,
        formats: [
          { quality: "nowm", url: j.data.play },
          { quality: "wm", url: j.data.wmplay },
          { quality: "music", url: j.data.music }
        ]
      });
    }

    // INSTAGRAM
    if (platform === "instagram") {
      const r = await fetch(`https://instagramdownloader.io/api/v1/instagram?url=${encodeURIComponent(url)}`);
      const j = await r.json();
      if (!j?.download_url) return res.json({ ok:false });

      return res.json({
        ok: true,
        platform,
        title: j.title || "Instagram Media",
        formats: [
          { quality: "default", url: j.download_url }
        ]
      });
    }

    // FACEBOOK
    if (platform === "facebook") {
      const r = await fetch("https://snapsave.app/api/ajaxSearch", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `q=${encodeURIComponent(url)}`
      });

      const j = await r.json();
      if (!j?.data) return res.json({ ok:false });

      const formats = [];
      if (j.data[0]?.url) formats.push({ quality: "hd", url: j.data[0].url });
      if (j.data[1]?.url) formats.push({ quality: "sd", url: j.data[1].url });

      return res.json({
        ok: true,
        platform,
        title: j.title,
        thumbnail: j.thumbnail,
        formats
      });
    }

    // YOUTUBE
    if (platform === "youtube") {
      const r = await fetch("https://yt1s.com/api/ajaxSearch/index", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `q=${encodeURIComponent(url)}&vt=home`
      });

      const j = await r.json();
      if (!j?.links) return res.json({ ok:false });

      const formats = [];

      for (const key in j.links.mp4) {
        formats.push({
          quality: j.links.mp4[key].q,
          url: j.links.mp4[key].k
        });
      }

      for (const key in j.links.mp3) {
        formats.push({
          quality: j.links.mp3[key].q,
          url: j.links.mp3[key].k
        });
      }

      return res.json({
        ok: true,
        platform,
        title: j.title,
        thumbnail: j.thumb,
        formats
      });
    }

    return res.json({ ok:false, msg:"Platform not supported" });

  } catch (err) {
    return res.status(500).json({ ok:false, msg:"Internal Error", err: String(err) });
  }
}        url: j.links.mp3[key].k
      });
    }

    return res.json({
      ok: true,
      platform,
      title: j.title,
      thumbnail: j.thumb,
      formats
    });
  }

  return res.json({ ok:false, msg:"Platform not supported" });
}
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
