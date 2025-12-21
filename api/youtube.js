export default async function handler(req, res) {
  const CHANNEL_ID = "UCkaHtuBIU0JvmAxN5Qn6Ftw";

  const rssRes = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
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

  res.status(200).json({
    channel: "Conejo Tako",
    videos: entries
  });
}
