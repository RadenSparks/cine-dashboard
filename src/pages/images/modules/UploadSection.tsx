import type { ToastNotification } from "../../../components/UI/SatelliteToast";
import ImageUploader from "../components/ImageUploader";
import { SectionCard } from "../../../components/UI/DashboardPrimitives";

interface UploadSectionProps {
  folderPath: string[];
  folderTree: any;
  toastRef: React.RefObject<{ showNotification: (options: Omit<ToastNotification, "id">) => void } | null>;
  onUploadComplete: () => void;
}

export function UploadSection({ folderPath, folderTree, toastRef, onUploadComplete }: UploadSectionProps) {
  return (
    <SectionCard title="Upload and organize" description="Upload new images, create folders, and navigate the media tree without changing the underlying file behavior.">
      <ImageUploader
        folderPath={folderPath}
        folderTree={folderTree}
        toastRef={toastRef}
        onUploadComplete={onUploadComplete}
      />
    </SectionCard>
  );
}
