export async function onRequestGet({ env }) {
  if (!env.DB) return Response.json({ error: "Database binding DB is not configured." }, { status: 503 });
  const { results } = await env.DB.prepare(
    "SELECT id, english AS en, vietnamese AS vi, ipa, category, image_url FROM vocabulary ORDER BY id DESC"
  ).all();
  return Response.json({ words: results || [] }, {
    headers: { "Cache-Control": "no-store" }
  });
}
