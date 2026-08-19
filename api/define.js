// Vercel serverless function: look up a Japanese word's English meaning via
// Jisho's public API. Runs server-side, so it isn't subject to the browser's
// CORS restriction (Jisho doesn't send CORS headers) and isn't affected by the
// user's own network blocking. Returns a trimmed shape: { word, reading, senses }
// where senses is an array of arrays of English definitions.
export default async function handler(req, res) {
  const word = ((req.query && req.query.word) || "").toString().slice(0, 60).trim();
  if (!word) {
    res.status(400).json({ error: "No word provided." });
    return;
  }
  try {
    const r = await fetch(
      "https://jisho.org/api/v1/search/words?keyword=" + encodeURIComponent(word),
      { headers: { "Accept": "application/json" } }
    );
    const data = await r.json();
    const first = data && data.data && data.data[0];
    if (!first) {
      res.status(200).json({ word: word, reading: "", senses: [] });
      return;
    }
    const jp = (first.japanese && first.japanese[0]) || {};
    const reading = jp.reading || jp.word || "";
    const senses = (first.senses || [])
      .map((s) => s.english_definitions || [])
      .filter((d) => d.length);
    // Cache at the edge for a day — dictionary entries don't change.
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).json({ word: word, reading: reading, senses: senses });
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || e) });
  }
}
