import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

export default function Step5b() {
  const { watch, setValue } = useFormContext();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const photos = watch("photos") || [];

  const addFiles = (files) => {
    const incoming = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      url: URL.createObjectURL(file),
      name: file.name,
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
    <section className="steps__section">
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
              <p className="steps__upload-hint">
                Drag photos here or browse your computer. Uploads start
                immediately in the background.
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

          <button
            type="button"
            className="steps__btn-continue steps__upload-btn"
            onClick={() => inputRef.current?.click()}
          >
            Upload photos
          </button>
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
    </section>
  );
}
