export default async function handler(req, res) {
  const CHANNEL_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw"; // cambia esto

  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  const response = await fetch(url);
  const xml = await response.text();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(xml);
}
