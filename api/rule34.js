export default async function handler(req, res) {
  const { tags = "rem_(re:zero)", page = 0, limit = 20 } = req.query;

  const USER_ID = process.env.R34_USER_ID;
  const API_KEY = process.env.R34_API_KEY;

  const url =
    `https://api.rule34.xxx/index.php` +
    `?page=dapi&s=post&q=index` +
    `&json=1` +
    `&limit=${limit}` +
    `&pid=${page}` +
    `&tags=${encodeURIComponent(tags)}` +
    `&user_id=${USER_ID}` +
    `&api_key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      error: "Rule34 API error",
      details: err.message
    });
  }
}
