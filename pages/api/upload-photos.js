import formidable from "formidable";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "intake-photos";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const form = formidable({ multiples: true });

    const [fields, files] = await form.parse(req);

    const submissionId = fields.submissionId?.[0];

    if (!submissionId) {
      return res.status(400).json({
        success: false,
        error: "Missing submissionId",
      });
    }

    const uploadedFiles = Array.isArray(files.photos)
      ? files.photos
      : [files.photos];

    let uploadedCount = 0;

    for (const file of uploadedFiles) {
      if (!file) continue;

      const fileBuffer = fs.readFileSync(file.filepath);

      const ext = file.originalFilename.split(".").pop();

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const storagePath = `drafts/${submissionId}/${fileName}`;

      // upload to storage
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: file.mimetype,
        });

      if (uploadErr) {
        console.error(uploadErr);
        continue;
      }

      // insert db row
      const { error: insertErr } = await supabase
        .from("intake_photos")
        .insert({
          submission_id: submissionId,
          storage_bucket: BUCKET,
          storage_path: storagePath,
          original_filename: file.originalFilename,
          mime_type: file.mimetype,
          size_bytes: file.size,
          status: "uploaded",
        });

      if (insertErr) {
        console.error(insertErr);
        continue;
      }

      uploadedCount++;
    }

    // update counts
    await supabase
      .from("intake_submissions")
      .update({
        uploaded_photo_count: uploadedCount,
      })
      .eq("id", submissionId);

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}