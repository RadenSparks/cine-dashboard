import React, { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchFoldersAsync,
  fetchFolderListAsync,
  deleteFolderAsync,
} from "../../store/imagesSlice";
import type { Image } from "../../entities/type";
import Breadcrumbs from "./Breadcrumbs";
import FolderTree from "./FolderTree";
import ImagesGrid from "./ImagesGrid";
import DeleteFolderModal from "./DeleteFolderModal";
import ImageUploader from "./components/ImageUploader";
import FolderCreator from "./components/FolderCreator";
import ImageSelectionToolbar from "./components/ImageSelectionToolbar";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import Loading from "../../components/UI/Loading";
import { buildFolderTree, createFolderIdMap } from "../../utils/folderTreeUtils";

const ImagesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: images, folderList, loading } = useSelector((s: RootState) => s.images);

  // Folder navigation state
  const [folderPath, setFolderPath] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Image selection & preview state
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<{ name: string; id: number } | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);

  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void } | null>(null);

  useEffect(() => {
    dispatch(fetchFoldersAsync());
    dispatch(fetchFolderListAsync());
    // eslint-disable-next-line
  }, []);

  const folderIds = createFolderIdMap(folderList);
  const folderTree = useMemo(() => buildFolderTree(images, folderList), [images, folderList]);
  const currentNode = useMemo(() => {
    let node = folderTree;
    for (const p of folderPath) {
      node = node.children[p] ?? { children: {} };
    }
    return node;
  }, [folderTree, folderPath]);
  const currentImages: Image[] = currentNode.items || [];

  const handleDeleteFolder = (folderName: string, folderId: number) => {
    setDeleteFolderTarget({ name: folderName, id: folderId });
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    setDeletingFolder(true);
    try {
      const deleteItems = false;
      await dispatch(deleteFolderAsync({ folderId: deleteFolderTarget.id, deleteItems })).unwrap();

      setDeleteFolderTarget(null);
      if (folderPath.includes(deleteFolderTarget.name)) {
        setFolderPath([]);
      }

      toastRef.current?.showNotification({
        title: "Folder deleted",
        content: `Folder "${deleteFolderTarget.name}" deleted and images moved to root.`,
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 2000,
      });

      await dispatch(fetchFoldersAsync());
      await dispatch(fetchFolderListAsync());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toastRef.current?.showNotification({
        title: "Delete Failed",
        content: `${msg || "Failed to delete folder."}`,
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    } finally {
      setDeletingFolder(false);
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16 py-8">
      <SatelliteToast ref={toastRef} />
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <Loading />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-2xl p-6 border border-blue-100 dark:border-zinc-800">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-200 mb-2 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>🖼️ Image Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Organize and manage movie images with folder structure</p>
          <ImageUploader
            folderPath={folderPath}
            folderTree={folderTree}
            toastRef={toastRef}
            onUploadComplete={() => {
              dispatch(fetchFoldersAsync());
              dispatch(fetchFolderListAsync());
            }}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-80">
            <div className="sticky top-6 bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-100 shadow-sm h-[calc(100vh-140px)] overflow-y-auto space-y-4">
              <div>
                <div className="text-sm font-semibold text-blue-700 mb-3">Folders</div>
                <FolderCreator
                  onFolderCreated={(name) => {
                    setExpanded((e) => ({ ...e, [name]: true }));
                    setFolderPath([name]);
                  }}
                  toastRef={toastRef}
                />
              </div>

              <FolderTree
                node={folderTree}
                path={[]}
                expanded={expanded}
                setExpanded={setExpanded}
                selectedPath={folderPath}
                setSelectedPath={setFolderPath}
                onDeleteFolder={handleDeleteFolder}
                folderIds={folderIds}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-4">
            <Breadcrumbs folderPath={folderPath} setFolderPath={setFolderPath} />

            <ImageSelectionToolbar
              selectedImages={selectedImages}
              currentImages={currentImages}
              folderTree={folderTree}
              onSelectionChange={setSelectedImages}
              toastRef={toastRef}
            />

            <div className="rounded-2xl p-4 bg-white/90 dark:bg-zinc-900/90 border border-blue-100 dark:border-zinc-800 shadow-sm">
              <ImagesGrid
                media={currentImages}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                handlePreview={(url) => setPreviewUrl(url)}
                setDeleteTarget={() => {}} // Handled by toolbar now
                previewUrl={previewUrl}
                setPreviewUrl={setPreviewUrl}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Delete folder confirmation modal */}
      <DeleteFolderModal
        show={!!deleteFolderTarget}
        deleting={deletingFolder}
        onCancel={() => setDeleteFolderTarget(null)}
        onDelete={confirmDeleteFolder}
      />

      {/* Image preview modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="max-w-[92vw] max-h-[92vh] bg-transparent outline-none"
            >
              <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 p-4">
                <button
                  aria-label="Close preview"
                  onClick={() => setPreviewUrl(null)}
                  className="absolute right-3 top-3 z-20 rounded-full p-2 bg-white/80 dark:bg-zinc-800/80 hover:bg-white transition"
                  type="button"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center justify-center" style={{ width: "88vw", height: "80vh", maxWidth: "1200px", maxHeight: "86vh" }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded"
                    draggable={false}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImagesManager;