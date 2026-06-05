import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { deleteImageAsync, fetchFolderListAsync, fetchFoldersAsync, moveImagesToFolderAsync } from "@/store/slices";
import type { Image } from "@/shared/types/entities";
import type { FolderTreeNode } from "@/shared/types/folderTree";
import MoveModal from "../MoveModal";
import DeleteImagesModal from "../DeleteImagesModal";
import type { ToastNotification } from "@/shared/components/ui/SatelliteToast";
import AppButton from "@/shared/components/ui/AppButton";

interface ImageSelectionToolbarProps {
  selectedImages: number[];
  currentImages: Image[];
  folderTree: FolderTreeNode;
  disabled?: boolean;
  onSelectionChange?: (images: number[]) => void;
  toastRef: React.RefObject<{
    showNotification: (options: Omit<ToastNotification, "id">) => void;
  } | null>;
}

const ImageSelectionToolbar: React.FC<ImageSelectionToolbarProps> = ({
  selectedImages,
  currentImages,
  folderTree,
  disabled,
  onSelectionChange,
  toastRef,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [deleteTargets, setDeleteTargets] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetFolder, setMoveTargetFolder] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const handleDeleteClick = () => {
    if (selectedImages.length === 0) {
      toastRef.current?.showNotification({ title: "No images selected", content: "Please select at least one image to delete.", accentColor: "#f59e0b", position: "bottom-right", longevity: 2500 });
      return;
    }
    setDeleteTargets(selectedImages);
  };

  const confirmDelete = async () => {
    if (deleteTargets.length === 0) return;
    setDeleting(true);
    try {
      for (const imageId of deleteTargets) {
        await dispatch(deleteImageAsync(imageId)).unwrap();
      }
      setDeleteTargets([]);
      onSelectionChange?.([]);
      toastRef.current?.showNotification({ title: "Deleted", content: `${deleteTargets.length} image(s) removed.`, accentColor: "#ef4444", position: "bottom-right", longevity: 2000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toastRef.current?.showNotification({ title: "Delete failed", content: `${msg || "Failed to delete image(s)."}`, accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
    } finally {
      setDeleting(false);
    }
  };

  const handleMoveClick = () => {
    if (selectedImages.length === 0) {
      toastRef.current?.showNotification({ title: "No images selected", content: "Please select at least one image to move.", accentColor: "#f59e0b", position: "bottom-right", longevity: 2500 });
      return;
    }
    setShowMoveModal(true);
  };

  const confirmMove = async () => {
    if (selectedImages.length === 0) return;
    const targetFolder = moveTargetFolder === null ? "root" : moveTargetFolder || "root";
    setMoving(true);
    try {
      await dispatch(moveImagesToFolderAsync({ imageIds: selectedImages, targetFolderName: targetFolder })).unwrap();
      setShowMoveModal(false);
      setMoveTargetFolder(null);
      onSelectionChange?.([]);
      toastRef.current?.showNotification({ title: "Moved", content: `${selectedImages.length} image(s) moved to ${targetFolder}.`, accentColor: "#22c55e", position: "bottom-right", longevity: 2500 });
      await dispatch(fetchFoldersAsync());
      await dispatch(fetchFolderListAsync());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toastRef.current?.showNotification({ title: "Move failed", content: `${msg || "Failed to move images."}`, accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
    } finally {
      setMoving(false);
    }
  };

  const hasSelection = selectedImages.length > 0;

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/78 md:flex-row md:items-center">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">
          {selectedImages.length > 0 ? `${selectedImages.length} image${selectedImages.length !== 1 ? "s" : ""} selected` : "No images selected"}
        </span>

        <div className="ml-auto flex gap-2">
          <AppButton onClick={handleMoveClick} disabled={!hasSelection || disabled || moving} color="primary" variant="soft" size="sm">
            {moving ? "Moving..." : "Move"}
          </AppButton>
          <AppButton onClick={handleDeleteClick} disabled={!hasSelection || disabled || deleting} color="danger" variant="soft" size="sm">
            {deleting ? "Deleting..." : "Delete"}
          </AppButton>
        </div>
      </div>

      <MoveModal
        show={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={confirmMove}
        moveTargetFolder={moveTargetFolder}
        setMoveTargetFolder={setMoveTargetFolder}
        folderTree={folderTree}
        disabled={moving}
      />

      <DeleteImagesModal
        show={deleteTargets.length > 0}
        deleting={deleting}
        targets={deleteTargets}
        currentImages={currentImages}
        onCancel={() => setDeleteTargets([])}
        onDelete={confirmDelete}
      />
    </>
  );
};

export default ImageSelectionToolbar;
