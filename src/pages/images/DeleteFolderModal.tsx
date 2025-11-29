import React from "react";

interface DeleteFolderModalProps {
  show: boolean;
  deleting: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  show,
  deleting,
  onCancel,
  onDelete,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-8 relative">
        <h3 className="text-lg font-bold mb-4 text-red-600 break-words">Delete Folder</h3>
        <p className="mb-4 break-words text-sm">
          Are you sure you want to delete this folder and all images inside?
          <br />
          <span className="text-xs text-gray-500">This action cannot be undone.</span>
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-200 px-6 py-2 rounded"
            type="button"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
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

export default DeleteFolderModal;