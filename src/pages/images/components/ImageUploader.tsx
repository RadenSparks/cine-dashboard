import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import {
  uploadImageToFolderAsync,
  fetchFoldersAsync,
  fetchFolderListAsync,
} from "../../../store/imagesSlice";
import type { FolderTreeNode } from "../../../types/folderTree";
import { getCurrentNode } from "../../../utils/folderTreeUtils";
import type { ToastNotification } from "../../../components/UI/SatelliteToast";

interface ImageUploaderProps {
  folderPath: string[];
  folderTree: FolderTreeNode;
  disabled?: boolean;
  toastRef: React.RefObject<{
    showNotification: (options: Omit<ToastNotification, "id">) => void;
  } | null>;
  onUploadComplete?: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  folderPath,
  folderTree,
  disabled,
  toastRef,
  onUploadComplete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
  }>({ current: 0, total: 0, fileName: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES_PER_FOLDER = 10;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const folderName =
      folderPath.length > 0 ? folderPath[folderPath.length - 1] : "root";
    const isRootFolder = folderPath.length === 0;

    // Check if folder is at capacity
    const currentFolderNode = getCurrentNode(folderTree, folderPath);
    const currentImageCount = currentFolderNode.items?.length || 0;

    if (!isRootFolder && currentImageCount >= MAX_IMAGES_PER_FOLDER) {
      toastRef.current?.showNotification({
        title: "Folder Full",
        content: `Cannot upload more images. Folder "${folderName}" has reached the maximum limit of ${MAX_IMAGES_PER_FOLDER} images.`,
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3500,
      });
      setUploading(false);
      e.currentTarget.value = "";
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const failedFiles: string[] = [];
    let uploadCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        setUploadProgress({ current: i, total: files.length, fileName: file.name });

        // Check if adding this file would exceed limit
        if (
          !isRootFolder &&
          currentImageCount + uploadCount + 1 > MAX_IMAGES_PER_FOLDER
        ) {
          toastRef.current?.showNotification({
            title: "Limit Reached",
            content: `Can only upload ${
              MAX_IMAGES_PER_FOLDER - currentImageCount - uploadCount
            } more image(s). Folder is at capacity.`,
            accentColor: "#f59e0b",
            position: "bottom-right",
            longevity: 3500,
          });
          failureCount++;
          failedFiles.push(file.name);
          continue;
        }

        try {
          console.log(
            `Uploading file ${i + 1}/${files.length}:`,
            file.name,
            "to folder:",
            folderName
          );
          await dispatch(
            uploadImageToFolderAsync({ file, folderName })
          ).unwrap();
          successCount++;
          uploadCount++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`Failed to upload ${file.name}:`, msg);

          if (msg.includes("413")) {
            toastRef.current?.showNotification({
              title: "File Too Large",
              content: `File "${file.name}" exceeds the maximum size limit. Please upload a smaller file.`,
              accentColor: "#ef4444",
              position: "bottom-right",
              longevity: 3500,
            });
          }

          failureCount++;
          failedFiles.push(file.name);
        }
      }

      if (successCount > 0) {
        let content = `${successCount} image(s) uploaded to ${
          folderName || "root"
        }.`;
        if (!isRootFolder) {
          content += ` (${currentImageCount + successCount}/${MAX_IMAGES_PER_FOLDER})`;
        }
        if (failureCount > 0) {
          content += ` ${failureCount} failed: ${failedFiles.join(", ")}`;
        }
        toastRef.current?.showNotification({
          title: "Upload Complete",
          content,
          accentColor: failureCount > 0 ? "#f59e0b" : "#22c55e",
          position: "bottom-right",
          longevity: failureCount > 0 ? 4000 : 2500,
        });
      } else {
        toastRef.current?.showNotification({
          title: "Upload Failed",
          content: `Failed to upload ${failureCount} image(s).`,
          accentColor: "#ef4444",
          position: "bottom-right",
          longevity: 3500,
        });
      }

      if (successCount > 0) {
        await dispatch(fetchFoldersAsync());
        await dispatch(fetchFolderListAsync());
        onUploadComplete?.();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toastRef.current?.showNotification({
        title: "Upload Error",
        content: `${msg || "An error occurred during upload."}`,
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3500,
      });
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0, fileName: "" });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isUploadInProgress = uploading && uploadProgress.total > 0;

  return (
    <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          disabled={uploading || disabled}
          multiple
          accept="image/*"
          className="hidden"
          id="image-upload-input"
        />
        <label htmlFor="image-upload-input">
          <button
            disabled={uploading || disabled}
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            type="button"
          >
            {uploading ? "Uploading..." : "Choose Images"}
          </button>
        </label>
      </div>

      {isUploadInProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              {uploadProgress.current + 1} / {uploadProgress.total}
            </span>
            <span className="truncate ml-2 text-gray-500">
              {uploadProgress.fileName}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((uploadProgress.current + 1) / uploadProgress.total) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
