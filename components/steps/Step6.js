import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Text from "../text";
import { getSubmissionId } from "@/lib/draftSession";

export default function Step6({ content }) {
  const { watch, setValue } = useFormContext();
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const photos = watch("photos") || [];

  // LOAD SAVED PHOTOS ON REFRESH
  useEffect(() => {
    const loadPhotos = async () => {
      const submissionId = getSubmissionId();
      if (!submissionId) return;
      try {
        const res = await fetch(`/api/get-photos?submissionId=${submissionId}`);
        const result = await res.json();
        if (!result.success) return;
        const formatted = result.photos.map((p) => ({
          id: p.id,
          url: p.preview_url,
          name: p.original_filename,
          uploaded: true,
          progress: 100,
          storage_path: p.storage_path,
          dbId: p.id,
        }));
        setValue("photos", formatted);
      } catch (err) {
        console.error(err);
      }
    };
    loadPhotos();
  }, []);

  // INSTANT UPLOAD
  const addFiles = async (files) => {
    const submissionId = getSubmissionId();
    if (!submissionId) {
      alert("Please complete Step 1 first.");
      return;
    }
    const incoming = Array.from(files).map((file) => ({
      localId: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
      progress: 0,
      uploading: true,
      uploaded: false,
    }));
    const updatedPhotos = [...photos, ...incoming].slice(0, 30);
    setValue("photos", updatedPhotos);

    for (const photo of incoming) {
      const formData = new FormData();

      formData.append("submissionId", submissionId);
      formData.append("photos", photo.file);

      // fake progress animation
      let progress = 0;

      const interval = setInterval(() => {
        progress += 10;

        setValue(
          "photos",
          (watch("photos") || []).map((p) =>
            p.localId === photo.localId
              ? {
                  ...p,
                  progress: Math.min(progress, 90),
                }
              : p,
          ),
        );
      }, 200);

      try {
        const res = await fetch("/api/upload-photos", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        clearInterval(interval);

        if (!result.success || !result.photos?.length) {
          throw new Error("Upload failed");
        }

        const uploaded = result.photos[0];

        setValue(
          "photos",
          (watch("photos") || []).map((p) =>
            p.localId === photo.localId
              ? {
                  ...p,
                  progress: 100,
                  uploading: false,
                  uploaded: true,
                  dbId: uploaded.id,
                  storage_path: uploaded.storage_path,
                  url: uploaded.preview_url,
                }
              : p,
          ),
        );
      } catch (err) {
        clearInterval(interval);

        setValue(
          "photos",
          (watch("photos") || []).map((p) =>
            p.localId === photo.localId
              ? {
                  ...p,
                  uploading: false,
                  failed: true,
                }
              : p,
          ),
        );

        console.error(err);
      }
    }
  };

  // REMOVE PHOTO
  const removePhoto = async (photo) => {
    try {
      if (photo.dbId) {
        await fetch("/api/delete-photo", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photoId: photo.dbId,
            storagePath: photo.storage_path,
          }),
        });
      }

      setValue(
        "photos",
        photos.filter((p) => p !== photo),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="steps__section">
      <h1 className="steps__title">{content?.step5b_heading}</h1>
      <p className="steps__subtitle">
        <Text string={content?.step5b_txt} />
      </p>

      <div className="steps__single-col">
        <div
          className={`steps__upload-zone${dragging ? " steps__upload-zone--drag" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="steps__upload-header">
            <span className="steps__upload-icon">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path
                  d="M12 16V4M12 4l-4 4M12 4l4 4"
                  stroke="var(--color-red)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <p className="steps__upload-title">{content?.step5b_heading2}</p>
              <p className="steps__upload-title steps__upload-title-mobile">
                Choose photos
              </p>
              <p className="steps__upload-hint">{content?.step5b_txt2}</p>
              <p className="steps__upload-hint steps__upload-hint-mobile">
                Upload from your library, or open the camera for a fresh shot.
              </p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="steps__upload-input"
            onChange={(e) => addFiles(e.target.files)}
          />
          {/* Camera input (NEW) */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="steps__btn-wrap">
            <button
              type="button"
              className="steps__btn-continue steps__upload-btn"
              onClick={() => inputRef.current?.click()}
            >
              Upload photos
            </button>
          </div>
          <div className="steps__btn-wrap steps__btn-wrap-mobile">
            <button
              type="button"
              className="steps__btn-continue steps__upload-btn"
              onClick={() => inputRef.current?.click()}
            >
              Choose photos
            </button>
            <button
              type="button"
              className="steps__btn-continue steps__btn-continue-2 steps__upload-btn"
              onClick={() => cameraRef.current?.click()}
            >
              Take Photo
            </button>
          </div>
        </div>

        <div className="steps__upload-meta">
          <span>Up to 30 photos</span>
          <span>Uploads saved with your draft automatically.</span>
        </div>

        {photos.length > 0 && (
          <div className="steps__upload-thumbs">
            {photos.map((p) => (
              <div key={p.localId || p.id} className="steps__upload-thumb">
               <img src={p.url} alt={p.name} />

                <button
                  type="button"
                  className="steps__upload-thumb-remove"
                  onClick={() => removePhoto(p)}
                  aria-label="Remove photo"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
