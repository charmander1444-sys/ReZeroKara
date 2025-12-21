export default async function handler(req, res) {
  const HANDLE = "conejotako";

  // 1️⃣ Obtener HTML del canal
  const responsePage = await fetch(`https://www.youtube.com/@${HANDLE}`);
  const html = await responsePage.text();

  // 2️⃣ Extraer channelId del HTML
  const match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]+)"/);

  if (!match) {
    return res.status(500).json({ error: "No se pudo obtener el channel ID" });
  }

  const channelId = match[1];

  // 3️⃣ Obtener RSS
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const rssResponse = await fetch(rssUrl);
  const xml = await rssResponse.text();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(xml);
}
