import React, { useMemo } from "react";
import type { Image } from "../../entities/type";
import CustomCheckbox from "../../components/UI/CustomCheckbox";

interface ImagesGridProps {
  media: Image[];
  selectedImages: number[];
  setSelectedImages: React.Dispatch<React.SetStateAction<number[]>>;
  handlePreview: (url: string) => void;
  setDeleteTarget: (item: Image) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}
// c
const ImagesGrid: React.FC<ImagesGridProps> = ({
  media,
  selectedImages,
  setSelectedImages,
  handlePreview,
  setDeleteTarget,
  previewUrl,
  setPreviewUrl,
}) => {
  // Memoize the media list so we don't re-render all items unnecessarily
  const memoizedMedia = useMemo(() => media, [media]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 ">
      {memoizedMedia.map((item, idx) => (
        <div
          key={item.id || idx}
          className={`border rounded-2xl p-4 bg-white shadow hover:shadow-lg transition group relative flex flex-col`}
        >
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-40 object-cover rounded-xl cursor-pointer border border-gray-100 hover:border-blue-400 transition"
            onClick={() => item.url && handlePreview(item.url)}
          />
          <div className="text-xs text-gray-700 mt-4 font-medium break-words line-clamp-2 flex-shrink-0" title={item.name}>{item.name}</div>
          {/* --- File size display --- */}
          {typeof item.size === "number" && (
            <div className="text-xs text-gray-500 mt-1 flex-shrink-0">
              {(item.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4 justify-between items-center">
            <div className="flex gap-2">
              <a
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-50 text-gray-700 text-xs font-semibold hover:bg-gray-100 hover:text-blue-700 transition"
                title="View Original Image"
              >
                View
              </a>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 hover:text-red-800 transition cursor-pointer"
                onClick={() => setDeleteTarget(item)}
                title="Delete"
              >
                Delete
              </button>
            </div>
            <CustomCheckbox
              checked={item.id !== undefined && selectedImages.includes(item.id)}
              onChange={e => {
                setSelectedImages(sel => {
                  if (item.id === undefined) return sel;
                  return e
                    ? [...sel, item.id]
                    : sel.filter(id => id !== item.id);
                });
              }}
              accentColor="#3b82f6"
              backgroundColor="#ffffff"
              borderColor="#93c5fd"
              checkmarkColor="#ffffffff"
              size={20}
              borderRadius={4}
              borderWidth={2}
            />
          </div>
          {previewUrl === item.url && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={() => setPreviewUrl(null)}
            >
              <img
                src={item.url}
                alt={item.name}
                className="max-h-[80vh] max-w-[90vw] rounded-2xl shadow-2xl border-4 border-white"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ImagesGrid;