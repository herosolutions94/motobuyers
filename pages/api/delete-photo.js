import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { photoId, storagePath } = req.body;

    if (!photoId || !storagePath) {
      return res.status(400).json({
        success: false,
        error: "Missing photoId or storagePath",
      });
    }

    // ── 1. Delete from Supabase Storage bucket
    const { error: storageErr } = await supabase.storage
      .from("intake-photos")
      .remove([storagePath]);

    if (storageErr) {
      console.error("[delete-photo] Storage removal error:", storageErr);
    }

    const { error: dbErr } = await supabase
      .from("intake_photos")
      .delete()
      .eq("id", photoId);

    if (dbErr) {
      console.error("[delete-photo] DB delete error:", dbErr);
      return res.status(500).json({
        success: false,
        error: dbErr.message,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[delete-photo] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}