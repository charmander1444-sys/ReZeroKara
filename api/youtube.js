export default async function handler(req, res) {
  const HANDLE = "conejotako";

  // 1️⃣ HTML del canal
  const pageRes = await fetch(`https://www.youtube.com/@${HANDLE}`);
  const html = await pageRes.text();

  // 2️⃣ Extraer channelId
  const channelIdMatch = html.match(/"channelId":"(UC[a-zA-Z0-9_-]+)"/);
  if (!channelIdMatch) {
    return res.status(500).json({ error: "No se pudo obtener el channelId" });
  }
  const channelId = channelIdMatch[1];

  // ============================
  // 3️⃣ SUSCRIPTORES (simpleText o runs)
  // ============================
  let subscribers = "No disponible";

  const subsSimple = html.match(
    /"subscriberCountText":\{"simpleText":"([^"]+)"/
  );

  const subsRuns = html.match(
    /"subscriberCountText":\{"runs":\[\{"text":"([^"]+)"/
  );

  if (subsSimple) {
    subscribers = subsSimple[1];
  } else if (subsRuns) {
    subscribers = subsRuns[1] + " suscriptores";
  }

  // ============================
  // 4️⃣ TOTAL DE VIDEOS
  // ============================
  let videoCount = "No disponible";

  const videosSimple = html.match(
    /"videoCountText":\{"simpleText":"([^"]+)"/
  );

  const videosRuns = html.match(
    /"videoCountText":\{"runs":\[\{"text":"([^"]+)"/
  );

  if (videosSimple) {
    videoCount = videosSimple[1];
  } else if (videosRuns) {
    videoCount = videosRuns[1];
  }

  // ============================
  // 5️⃣ RSS (últimos 3 videos)
  // ============================
  const rssRes = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  );
  const rss = await rssRes.text();

  const entries = [...rss.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .slice(0, 3)
    .map(e => {
      const block = e[1];
      return {
        title: block.match(/<title>(.*?)<\/title>/)?.[1],
        link: block.match(/<link rel="alternate" href="(.*?)"/)?.[1],
        thumbnail: block.match(/<media:thumbnail url="(.*?)"/)?.[1]
      };
    });

  // ============================
  // RESPUESTA FINAL
  // ============================
  res.status(200).json({
    channel: HANDLE,
    subscribers,
    videoCount,
    videos: entries
  });
}
