import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { FolderKanban } from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import { deleteFolderAsync, fetchFolderListAsync, fetchFoldersAsync } from "@/store/slices";
import type { Image } from "@/shared/types/entities";
import DeleteFolderModal from "./DeleteFolderModal";
import { SatelliteToast, type ToastNotification } from "@/shared/components/ui/SatelliteToast";
import Loading from "@/shared/components/ui/Loading";
import { buildFolderTree, createFolderIdMap } from "@/shared/utils/folderTreeUtils";
import { PageIntro } from "@/shared/components/ui/DashboardPrimitives";
import { FolderPanel } from "./modules/FolderPanel";
import { MediaLibraryPanel } from "./modules/MediaLibraryPanel";
import { UploadSection } from "./modules/UploadSection";
import { MediaPreviewModal } from "./modules/MediaPreviewModal";

const ImagesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: images, folderList, loading } = useSelector((state: RootState) => state.images);
  const [folderPath, setFolderPath] = useState<string[]>(["root"]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<{ name: string; id: number } | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void } | null>(null);

  useEffect(() => {
    dispatch(fetchFoldersAsync());
    dispatch(fetchFolderListAsync());
  }, [dispatch]);

  const folderIds = createFolderIdMap(folderList);
  const folderTree = useMemo(() => buildFolderTree(images, folderList), [images, folderList]);
  const currentNode = useMemo(() => {
    let node = folderTree;
    for (const piece of folderPath) node = node.children[piece] ?? { children: {} };
    return node;
  }, [folderTree, folderPath]);
  const currentImages: Image[] = currentNode.items || [];

  const confirmDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    setDeletingFolder(true);
    try {
      await dispatch(deleteFolderAsync({ folderId: deleteFolderTarget.id, deleteItems: false })).unwrap();
      setDeleteFolderTarget(null);
      if (folderPath.includes(deleteFolderTarget.name)) setFolderPath(["root"]);
      toastRef.current?.showNotification({ title: "Folder deleted", content: `Folder "${deleteFolderTarget.name}" deleted and images moved to root.`, accentColor: "#ef4444", position: "bottom-right", longevity: 2000 });
      await dispatch(fetchFoldersAsync());
      await dispatch(fetchFolderListAsync());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toastRef.current?.showNotification({ title: "Delete failed", content: `${msg || "Failed to delete folder."}`, accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
    } finally {
      setDeletingFolder(false);
    }
  };

  const handleUploadComplete = () => {
    dispatch(fetchFoldersAsync());
    dispatch(fetchFolderListAsync());
  };

  return (
    <div className="w-full space-y-6">
      <SatelliteToast ref={toastRef} />
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <Loading fullscreen={false} />
          </motion.div>
        )}
      </AnimatePresence>

      <PageIntro
        eyebrow="Media operations"
        title="Image manager"
        description="Keep posters, galleries, and supporting artwork organized with a calmer folder-first media workspace."
        icon={FolderKanban}
        showEvervault={true}
      />

      <UploadSection
        folderPath={folderPath}
        folderTree={folderTree}
        toastRef={toastRef}
        onUploadComplete={handleUploadComplete}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <FolderPanel
          folderTree={folderTree}
          folderPath={folderPath}
          setFolderPath={setFolderPath}
          expanded={expanded}
          setExpanded={setExpanded}
          folderIds={folderIds}
          onDeleteFolder={(folderName, folderId) => setDeleteFolderTarget({ name: folderName, id: folderId })}
          toastRef={toastRef}
        />

        <MediaLibraryPanel
          currentImages={currentImages}
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          folderPath={folderPath}
          setFolderPath={setFolderPath}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          folderTree={folderTree}
          onSelectionChange={setSelectedImages}
          toastRef={toastRef}
        />
      </div>

      <DeleteFolderModal show={!!deleteFolderTarget} deleting={deletingFolder} onCancel={() => setDeleteFolderTarget(null)} onDelete={confirmDeleteFolder} />

      <MediaPreviewModal previewUrl={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
};

export default ImagesManager;
