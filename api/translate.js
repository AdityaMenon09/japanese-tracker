// Vercel serverless function: translation via DeepL.
//
// Two shapes, so the same endpoint serves both callers:
//   {text: "…"}                                  -> {translation: "…"}
//   {text: ["…","…"], source:"JA", target:"EN"}  -> {translations: ["…","…"]}
//
// The array form is what the Songs tab uses for per-line English: DeepL takes
// many `text` params in one request, which is far cheaper than a call per line.
//
// The DeepL key lives only here, in the DEEPL_API_KEY environment variable —
// it is never sent to the browser. DeepL Free keys end in ":fx" and use the
// api-free host; paid keys use the api host.

const MAX_ITEMS = 50;        // DeepL's own per-request limit
const MAX_CHARS_EACH = 1000;
const MAX_CHARS_TOTAL = 12000;

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
    const batch = Array.isArray(body.text);
    const items = (batch ? body.text : [body.text]).map((t) =>
      (t == null ? "" : String(t)).slice(0, MAX_CHARS_EACH).trim());

    if (items.length > MAX_ITEMS) {
      res.status(400).json({ error: `Too many lines at once: ${items.length} (max ${MAX_ITEMS}).` });
      return;
    }
    // Blank lines are kept in the response but never sent — DeepL rejects an
    // empty text param, and a lyric sheet is full of stanza breaks.
    const sendIdx = [];
    let total = 0;
    items.forEach((t, i) => { if (t) { sendIdx.push(i); total += t.length; } });
    if (!sendIdx.length) {
      res.status(400).json({ error: "No text provided." });
      return;
    }
    if (total > MAX_CHARS_TOTAL) {
      res.status(400).json({ error: `Too much text at once: ${total} characters (max ${MAX_CHARS_TOTAL}).` });
      return;
    }

    // DeepL wants a bare language for source ("EN"), but a regional variant for
    // an English target ("EN" on its own is deprecated there).
    const source = String(body.source || "EN").toUpperCase().split("-")[0];
    let target = String(body.target || "JA").toUpperCase();
    if (target === "EN") target = "EN-US";

    const host = key.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
    const params = new URLSearchParams();
    sendIdx.forEach((i) => params.append("text", items[i]));
    params.append("target_lang", target);
    if (source && source !== "AUTO") params.append("source_lang", source);
    // Each array element is already one lyric line — a fragment, usually with no
    // punctuation — so tell DeepL to translate it whole rather than resplitting.
    if (batch) params.append("split_sentences", "0");

    const r = await fetch(host + "/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": "DeepL-Auth-Key " + key,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const data = await r.json();
    const got = (data && data.translations) || [];
    if (!got.length) {
      res.status(502).json({ error: "Translation failed.", detail: data });
      return;
    }
    if (!batch) {
      res.status(200).json({ translation: got[0].text });
      return;
    }
    // Put the translations back where their lines were; blanks stay blank.
    const out = items.map(() => "");
    sendIdx.forEach((i, n) => { out[i] = (got[n] && got[n].text) || ""; });
    res.status(200).json({ translations: out });
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
}
