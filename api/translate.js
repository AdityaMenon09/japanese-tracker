// Vercel serverless function: English → Japanese via DeepL.
// The DeepL key lives only here, in the DEEPL_API_KEY environment variable —
// it is never sent to the browser. DeepL Free keys end in ":fx" and use the
// api-free host; paid keys use the api host.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }
  const key = process.env.DEEPL_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Translator not configured: DEEPL_API_KEY is missing." });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const text = (body.text || "").toString().slice(0, 1000).trim();
    const target = (body.target || "JA").toString();
    if (!text) {
      res.status(400).json({ error: "No text provided." });
      return;
    }
    const host = key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
    const params = new URLSearchParams();
    params.append("text", text);
    params.append("target_lang", target);
    params.append("source_lang", "EN");

    const r = await fetch(host + "/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": "DeepL-Auth-Key " + key,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const data = await r.json();
    if (data && data.translations && data.translations[0]) {
      res.status(200).json({ translation: data.translations[0].text });
    } else {
      res.status(502).json({ error: "Translation failed.", detail: data });
    }
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
