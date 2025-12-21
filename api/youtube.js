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

  // 3️⃣ Extraer estadísticas (scraping)
  const subsMatch = html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
  const viewsMatch = html.match(/"viewCountText":\{"simpleText":"([^"]+)"/);
  const videosMatch = html.match(/"videoCountText":\{"simpleText":"([^"]+)"/);

  const subscribers = subsMatch ? subsMatch[1] : "No disponible";
  const views = viewsMatch ? viewsMatch[1] : "No disponible";
  const videoCount = videosMatch ? videosMatch[1] : "No disponible";

  // 4️⃣ RSS (videos)
  const rssRes = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  );
  const rss = await rssRes.text();

  // 5️⃣ Parsear RSS
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

  res.status(200).json({
    channel: HANDLE,
    subscribers,
    views,
    videoCount,
    videos: entries
  });
}
