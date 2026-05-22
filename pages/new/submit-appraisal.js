import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  // ── POST: create a new row (Step 1) ────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const body = req.body;

      const { data, error } = await supabase
        .from("intake_submissions")
        .insert(body)
        .select("id")
        .single();

      if (error) {
        console.error("Supabase Error (insert):", error);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── PATCH: update existing row (Steps 2-8) ─────────────────────────────────
  if (req.method === "PATCH") {
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing submission id in query string." });
    }

    try {
      const body = req.body;

      const { data, error } = await supabase
        .from("intake_submissions")
        .update(body)
        .eq("id", id)
        .select("id")
        .single();

      if (error) {
        console.error("Supabase Error (update):", error);
        return res.status(500).json({ success: false, error: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── Other methods ───────────────────────────────────────────────────────────
  return res.status(405).json({ success: false, message: "Method not allowed" });
}