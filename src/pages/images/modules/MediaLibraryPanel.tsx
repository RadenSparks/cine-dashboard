import type { Dispatch, SetStateAction } from "react";
import type { Image } from "../../../entities/type";
import Breadcrumbs from "../Breadcrumbs";
import ImagesGrid from "../ImagesGrid";
import ImageSelectionToolbar from "../components/ImageSelectionToolbar";
import { SectionCard } from "../../../components/UI/DashboardPrimitives";

interface MediaLibraryPanelProps {
  currentImages: Image[];
  selectedImages: number[];
  setSelectedImages: Dispatch<SetStateAction<number[]>>;
  folderPath: string[];
  setFolderPath: (path: string[]) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  folderTree: any;
  onSelectionChange: (selected: number[]) => void;
  toastRef: any;
}

export function MediaLibraryPanel({
  currentImages,
  selectedImages,
  setSelectedImages,
  folderPath,
  setFolderPath,
  previewUrl,
  setPreviewUrl,
  folderTree,
  onSelectionChange,
  toastRef,
}: MediaLibraryPanelProps) {
  return (
    <SectionCard title="Library contents" description="Browse folder contents, preview images, and perform bulk actions against the current folder.">
      <div className="space-y-4">
        <Breadcrumbs folderPath={folderPath} setFolderPath={setFolderPath} />
        <ImageSelectionToolbar
          selectedImages={selectedImages}
          currentImages={currentImages}
          folderTree={folderTree}
          onSelectionChange={onSelectionChange}
          toastRef={toastRef}
        />
        <div className="rounded-[24px] border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/72">
          <ImagesGrid
            media={currentImages}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            handlePreview={(url) => setPreviewUrl(url)}
            setDeleteTarget={() => {}}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
          />
        </div>
      </div>
    </SectionCard>
  );
}
