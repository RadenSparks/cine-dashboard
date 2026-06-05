import type { ToastNotification } from "@/shared/components/ui/SatelliteToast";
import type { FolderTreeNode } from "@/shared/types/folderTree";
import ImageUploader from "../components/ImageUploader";
import { SectionCard } from "@/shared/components/ui/DashboardPrimitives";

interface UploadSectionProps {
  folderPath: string[];
  folderTree: FolderTreeNode;
  toastRef: React.RefObject<{ showNotification: (options: Omit<ToastNotification, "id">) => void } | null>;
  onUploadComplete: () => void;
}

export function UploadSection({ folderPath, folderTree, toastRef, onUploadComplete }: UploadSectionProps) {
  return (
    <SectionCard title="Upload and organize" description="Upload images directly into the currently selected folder and keep the media tree in sync.">
      <ImageUploader
        folderPath={folderPath}
        folderTree={folderTree}
        toastRef={toastRef}
        onUploadComplete={onUploadComplete}
      />
    </SectionCard>
  );
}
