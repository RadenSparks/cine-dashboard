import React, { useState, useEffect, useRef } from 'react';

type GalleryImage = string | { url: string; size?: number };
type GallerySliderProps = {
  images: GalleryImage[];
  renderAction?: (url: string) => React.ReactNode;
};

function getUrl(img: GalleryImage) {
  return typeof img === "string" ? img : img.url;
}
function getSize(img: GalleryImage) {
  return typeof img === "object" && img.size ? img.size : undefined;
}

const GallerySlider = ({ images, renderAction }: GallerySliderProps) => {
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!sliderRef.current) return;
      if (document.activeElement && !sliderRef.current.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") setCurrent(c => (c - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setCurrent(c => (c + 1) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length]);

  if (!images.length)
    return (
      <div className="w-full h-20 bg-gray-100 flex items-center justify-center rounded-xl mt-2 border border-gray-200 shadow-sm">
        <span className="text-gray-400 text-xs">Không có ảnh nào</span>
      </div>
    );

  return (
    <div
      className="w-full flex flex-col items-center mt-2"
      ref={sliderRef}
      tabIndex={0}
      aria-label="Image slideshow, use arrow keys to navigate images"
    >
      {/* Main image preview */}
      <div className="relative w-full max-w-md h-56 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg border border-blue-100 group transition-all duration-300">
        <img
          src={getUrl(images[current])}
          alt={`Ảnh ${current + 1}`}
          className="w-full h-full object-cover rounded-2xl border border-gray-200 transition-all duration-300 shadow"
          draggable={false}
          style={{ boxShadow: "0 4px 24px 0 rgba(30,64,175,0.10)" }}
        />
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full px-3 py-2 text-2xl shadow hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 transition border border-blue-200"
              onClick={() => setCurrent((current - 1 + images.length) % images.length)}
              type="button"
              aria-label="Trước"
              tabIndex={0}
            >
              <span className="font-bold text-blue-600">&lt;</span>
            </button>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full px-3 py-2 text-2xl shadow hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 transition border border-blue-200"
              onClick={() => setCurrent((current + 1) % images.length)}
              type="button"
              aria-label="Sau"
              tabIndex={0}
            >
              <span className="font-bold text-blue-600">&gt;</span>
            </button>
          </>
        )}
        {/* Image counter */}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-3 py-1 rounded-full shadow">
          {current + 1} / {images.length}
        </span>
        {/* File size display (if available) */}
        {getSize(images[current]) && (
          <span className="absolute top-3 right-3 bg-white bg-opacity-80 text-gray-700 text-xs px-2 py-0.5 rounded shadow border border-gray-200">
            {(getSize(images[current])! / (1024 * 1024)).toFixed(2)} MB
          </span>
        )}
      </div>
      {/* Action button (e.g. insert to content) */}
      {renderAction && (
        <div className="mt-2">{renderAction(getUrl(images[current]))}</div>
      )}
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {images.map((img, idx) => (
            <button
              key={getUrl(img) + idx}
              className={`w-14 h-14 rounded-xl border-2 transition
                ${idx === current ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-200'}
                bg-white p-0.5 shadow-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-400`}
              onClick={() => setCurrent(idx)}
              aria-label={`Chuyển đến ảnh ${idx + 1}`}
              type="button"
              tabIndex={0}
            >
              <img
                src={getUrl(img)}
                alt={`Ảnh nhỏ ${idx + 1}`}
                className={`w-full h-full object-cover rounded-xl transition-all duration-200 ${idx === current ? "scale-105" : ""}`}
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
      {/* Keyboard navigation hint */}
      <div className="text-xs text-gray-400 mt-2">
        Use  <span className="font-semibold text-blue-600">←</span> / <span className="font-semibold text-blue-600">→</span> to navigate images
      </div>
    </div>
  );
};

export default GallerySlider;