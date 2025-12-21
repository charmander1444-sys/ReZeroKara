export default async function handler(req, res) {
  const HANDLE = "conejotako";

  // 1️⃣ Pedimos el canal por @handle
  const channelPage = await fetch(`https://www.youtube.com/@${HANDLE}`, {
    redirect: "follow"
  });

  // 2️⃣ Obtenemos la URL final (contiene el channel ID)
  const finalUrl = channelPage.url;
  const match = finalUrl.match(/channel\/(UC[a-zA-Z0-9_-]+)/);

  if (!match) {
    return res.status(500).json({ error: "No se pudo obtener el channel ID" });
  }

  const channelId = match[1];

  // 3️⃣ RSS del canal
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const response = await fetch(rssUrl);
  const xml = await response.text();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(xml);
}
