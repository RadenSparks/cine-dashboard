import React from "react";
import type { Image } from "../../entities/type"; 

interface DeleteImagesModalProps {
  show: boolean;
  deleting: boolean;
  targets: number[];
  currentImages: Image[];
  onCancel: () => void;
  onDelete: () => void;
}

const DeleteImagesModal: React.FC<DeleteImagesModalProps> = ({
  show,
  deleting,
  targets,
  currentImages,
  onCancel,
  onDelete,
}) => {
  if (!show || targets.length === 0) return null;

  const targetImages = currentImages.filter((img) => targets.includes(img.id));
  const isSingle = targets.length === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-8 relative">
        <h3 className="text-lg font-bold mb-4 text-red-600 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
          Delete {isSingle ? "Image" : "Images"}
        </h3>
        <p className="mb-4 text-sm font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
          Are you sure you want to delete {targets.length} image{targets.length !== 1 ? "s" : ""}?
          {isSingle && targetImages.length > 0 && (
            <span className="font-semibold block break-words overflow-hidden text-ellipsis mt-2 p-2 bg-gray-50 rounded" title={targetImages[0].name}>
              {targetImages[0].name}
            </span>
          )}
          {!isSingle && targetImages.length > 0 && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {targetImages.slice(0, 5).map((img) => (
                <div key={img.id} className="p-1 bg-gray-50 rounded text-xs truncate" title={img.name}>
                  • {img.name}
                </div>
              ))}
              {targetImages.length > 5 && (
                <div className="p-1 text-xs text-gray-500">
                  +{targetImages.length - 5} more
                </div>
              )}
            </div>
          )}
          <span className="text-xs text-gray-500 block mt-2">
            This action cannot be undone.
          </span>
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-200 px-6 py-2 rounded font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
            type="button"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
            type="button"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteImagesModal;