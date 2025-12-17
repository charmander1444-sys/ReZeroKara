export async function handler(event) {
  const params = event.queryStringParameters;

  const tags = params.tags || "rem_(re:zero)";
  const page = params.page || 0;
  const limit = params.limit || 20;

  // 🔐 TUS CREDENCIALES
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

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Rule34 API error",
        details: err.message
      })
    };
  }
}
