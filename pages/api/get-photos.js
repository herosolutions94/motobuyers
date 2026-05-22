import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  try {
    const { submissionId } = req.query;

    if (!submissionId) {
      return res.status(400).json({
        success: false,
      });
    }

    const { data, error } = await supabase
      .from("intake_photos")
      .select("*")
      .eq("submission_id", submissionId)
      .neq("status", "deleted")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    // generate signed urls
    const photosWithUrls = await Promise.all(
      (data || []).map(async (photo) => {
        const { data: signedData, error: signedErr } = await supabase.storage
          .from(photo.storage_bucket)
          .createSignedUrl(photo.storage_path, 60 * 60); // 1 hour

        return {
          ...photo,
          preview_url: signedData?.signedUrl || null,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      photos: photosWithUrls,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
