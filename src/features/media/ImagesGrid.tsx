import React, { useMemo } from "react";
import type { Image } from "@/shared/types/entities";
import CustomCheckbox from "@/shared/components/ui/CustomCheckbox";

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
}) => {
  // Memoize the media list so we don't re-render all items unnecessarily
  const memoizedMedia = useMemo(() => media, [media]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 ">
      {memoizedMedia.map((item, idx) => (
        <div
          key={item.id || idx}
          className={`overflow-hidden border border-slate-200/90 ring-1 ring-slate-200/60 bg-white shadow-lg shadow-slate-200/40 transition duration-300 hover:-translate-y-0.5 hover:ring-blue-300/70 hover:shadow-2xl hover:shadow-slate-300/30 group relative flex flex-col dark:border-slate-700/90 dark:ring-1 dark:ring-slate-700/60 dark:bg-slate-900 dark:shadow-none dark:hover:ring-blue-500/40 dark:hover:shadow-[0_30px_60px_rgba(15,23,42,0.55)]`}
        >
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-44 object-cover cursor-pointer border-b border-slate-300 transition hover:brightness-95 dark:border-slate-700"
            onClick={() => item.url && handlePreview(item.url)}
          />
          <div className="text-sm text-slate-900 mt-4 font-semibold break-words line-clamp-2 flex-shrink-0 font-red-rose dark:text-slate-100" style={{ fontFamily: 'Red Rose, sans-serif' }} title={item.name}>{item.name}</div>
          {/* --- File size display --- */}
          {typeof item.size === "number" && (
            <div className="text-sm text-slate-500 mt-2 flex-shrink-0 font-red-rose dark:text-slate-400" style={{ fontFamily: 'Red Rose, sans-serif' }}>
              {(item.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-5 justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <a
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 hover:text-slate-950 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white font-red-rose"
                style={{ fontFamily: 'Red Rose, sans-serif' }}
                title="View Original Image"
              >
                View
              </a>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 hover:text-red-800 transition cursor-pointer dark:bg-slate-800 dark:text-rose-200 dark:hover:bg-red-700 dark:hover:text-white font-red-rose"
                style={{ fontFamily: 'Red Rose, sans-serif' }}
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
              size={24}
              borderRadius={6}
              borderWidth={3}
            />
          </div>
          {/* Full-screen preview is handled by MediaPreviewModal to avoid duplicate overlays */}
        </div>
      ))}
    </div>
  );
}

export default ImagesGrid;
