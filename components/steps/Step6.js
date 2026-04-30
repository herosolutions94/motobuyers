import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

export default function Step6() {
  const { watch, setValue } = useFormContext();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const photos = watch("photos") || [];

  const addFiles = (files) => {
    const incoming = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      url: URL.createObjectURL(file),
      name: file.name,
      file, // ← keep the real File object for Supabase Storage upload
    }));
    setValue("photos", [...photos, ...incoming].slice(0, 30));
  };

  const removePhoto = (id) => {
    setValue(
      "photos",
      photos.filter((p) => p.id !== id),
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="steps__section">
      <h1 className="steps__title">Add photos of your motorcycle</h1>
      <p className="steps__subtitle">
        Our data shows that photos improve offer accuracy by up to 25%.
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
              <p className="steps__upload-title">Upload photos</p>
              <p className="steps__upload-title steps__upload-title-mobile">
                Choose photos
              </p>
              <p className="steps__upload-hint">
                Drag photos here or browse your computer. Uploads start
                immediately in the background.
              </p>
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
              <div key={p.id} className="steps__upload-thumb">
                <img src={p.url} alt={p.name} />
                <button
                  type="button"
                  className="steps__upload-thumb-remove"
                  onClick={() => removePhoto(p.id)}
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
