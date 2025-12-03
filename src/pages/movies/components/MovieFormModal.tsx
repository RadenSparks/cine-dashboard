import { AnimatePresence, motion } from "framer-motion";
import { type Movie, type Image } from "../../../entities/type";
import { Select, SelectItem } from "@heroui/react";
import { useMemo, useRef, useState, useEffect } from "react";
import AppButton from "../../../components/UI/AppButton";
import { type Genre } from "../../../entities/type";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../store/store";
import { fetchFoldersAsync, fetchFolderListAsync } from "../../../store/imagesSlice";
import { buildFolderTree } from "../../../utils/folderTreeUtils";
import type { FolderTreeNode } from "../../../types/folderTree";

interface MovieFormModalProps {
  show: boolean;
  editing: Movie | null;
  newMovie: Movie;
  genres: Genre[];
  onClose: () => void;
  onChange: (movie: Movie) => void;
  onSubmit: () => void;
}

export default function MovieFormModal({
  show,
  editing,
  newMovie,
  genres,
  onClose,
  onChange,
  onSubmit,
}: MovieFormModalProps) {
  const current = editing ?? newMovie;
  const genreIds = useMemo(
    () => (Array.isArray(current.genre_ids) ? current.genre_ids : []),
    [current.genre_ids]
  );

  const selectedGenreNames = useMemo(
    () =>
      genres
        .filter(g => genreIds.includes(g.genre_id))
        .map(g => g.genre_name)
        .join(", ") || "Select genres",
    [genreIds, genres]
  );

  const [dateInput, setDateInput] = useState(
    current.premiere_date && /^\d{4}-\d{2}-\d{2}$/.test(current.premiere_date)
      ? current.premiere_date
      : ""
  );

  if (
    current.premiere_date !== dateInput &&
    /^\d{4}-\d{2}-\d{2}$/.test(current.premiere_date)
  ) {
    setDateInput(current.premiere_date);
  }

  const modalRef = useRef<HTMLDivElement>(null);

  // poster is set only via media manager; do not require URL format
  const formValid =
    current.title.length >= 2 &&
    genreIds.length > 0 &&
    current.duration >= 1 &&
    !!current.premiere_date &&
    (typeof current.rating === "undefined" || (current.rating >= 0 && current.rating <= 10));

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string[]>(["root"]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    return { "root": true };
  });
  const { items: images, folderList } = useSelector((s: RootState) => s.images);
  const dispatch = useDispatch<AppDispatch>();

  // Gallery selection state
  const [galleryImages, setGalleryImages] = useState<Image[]>(current.images && Array.isArray(current.images) ? current.images : []);
  const [showPosterSelector, setShowPosterSelector] = useState(false);

  // Fetch images and folders when media picker is opened
  useEffect(() => {
    if (showMediaPicker && images.length === 0) {
      dispatch(fetchFoldersAsync());
      dispatch(fetchFolderListAsync());
    }
  }, [showMediaPicker, images.length, dispatch]);

  // Build folder tree from images with hierarchical parent-child relationships
  const folderTree = useMemo(() => buildFolderTree(images, folderList), [images, folderList]);

  // Helper to get node by path
  const getNodeByPath = (path: string[]): FolderTreeNode | null => {
    let node = folderTree.children["root"];
    for (let i = 1; i < path.length; i++) {
      node = node?.children[path[i]];
      if (!node) return null;
    }
    return node;
  };

  // Multi-select for gallery
  const handleMediaSelect = (img: Image) => {
    setGalleryImages(prev => {
      const exists = prev.some(i => i.id === img.id);
      if (exists) {
        return prev.filter(i => i.id !== img.id);
      } else {
        return [...prev, img];
      }
    });
  };

  const removeGalleryImage = (imgId: number) => {
    setGalleryImages(prev => prev.filter(i => i.id !== imgId));
  };

  const confirmGallerySelection = () => {
    onChange({ ...current, images: galleryImages });
    setShowMediaPicker(false);
    setExpandedFolders({ "root": true });
  };

  const confirmPosterSelect = (img: Image) => {
    onChange({ ...current, poster: img.url ?? "" });
    setShowPosterSelector(false);
  };

  return show && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100/60 to-white/80 dark:from-zinc-900/80 dark:to-zinc-800/80"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="relative bg-white/90 dark:bg-zinc-900/90 border border-blue-100 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-6xl p-0 overflow-hidden hide-scrollbar"
          style={{
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <style>{`.modal-scrollbar::-webkit-scrollbar{display:none;}`}</style>
          <div className="modal-scrollbar">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-900 dark:to-blue-700">
              <span className="text-lg font-bold text-white">
                {editing ? "Edit Movie" : "Add Movie"}
              </span>
              <button
                className="rounded-full p-2 hover:bg-blue-600/30 transition"
                onClick={onClose}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Layout: sticky larger poster on left, form on right */}
            <div className="flex flex-col md:flex-row gap-8 p-8">
              <div className="md:w-1/3 w-full mb-4 md:mb-0">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-blue-100 dark:border-zinc-800 p-4 flex flex-col items-center w-full box-border">
                  <div className="text-base font-semibold text-blue-700 dark:text-blue-200 mb-3 text-center tracking-wide font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
                    Poster Preview
                  </div>
                  {(() => {
                    const posterSrc = current.poster ?? current.images?.[0]?.url;
                    return posterSrc ? (
                      <div
                        className="w-[360px] h-[540px] flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded-xl overflow-hidden border-2 border-blue-100 dark:border-zinc-800 box-border"
                        style={{ minWidth: 0 }}
                      >
                        <img
                          src={posterSrc}
                          alt={current.title}
                          className="w-full h-full object-contain transition-all duration-300"
                          style={{ display: "block" }}
                        />
                      </div>
                    ) : (
                      <div className="w-[360px] h-[540px] flex items-center justify-center bg-gray-200 rounded-xl text-gray-400">
                        No Image
                      </div>
                    );
                  })()}
                </div>

                {/* Gallery Selection Preview */}
                {galleryImages.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-green-100 dark:border-green-900/50 p-4 flex flex-col items-center w-full box-border">
                    <div className="text-sm font-semibold text-green-700 dark:text-green-200 mb-3 text-center tracking-wide flex items-center gap-2 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Gallery Selected ({galleryImages.length})
                    </div>
                    <div className="flex gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-900/50 overflow-x-auto w-full" style={{ scrollbarWidth: "thin" }}>
                      {galleryImages.map((img, idx) => (
                        <div key={img.id} className="relative group flex-shrink-0">
                          <div className="w-12 h-16 rounded-lg overflow-hidden border-2 border-green-300 dark:border-green-600 shadow-sm hover:shadow-md transition">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                          </div>
                          <div className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 bg-green-600 text-white text-xs font-bold rounded-full text-[10px]">{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  
                  </div>
                )}
              </div>

              <form
                className="flex-1 space-y-5 font-red-rose"
                style={{ fontFamily: 'Red Rose, sans-serif' }}
                onSubmit={e => {
                  e.preventDefault();
                  if (formValid) onSubmit();
                }}
              >
                <div>
                  <label htmlFor="movie-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="movie-title"
                    type="text"
                    value={current.title}
                    onChange={e => onChange({ ...current, title: e.target.value })}
                    placeholder="Enter movie title"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    required
                    minLength={2}
                  />
                  {current.title.length < 2 && (
                    <p className="text-xs text-red-500 mt-1">Title must be at least 2 characters.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Genres <span className="text-red-500">*</span>
                  </label>
                  <Select
                    selectionMode="multiple"
                    selectedKeys={genreIds.map(String)}
                    onSelectionChange={keys => {
                      const selected = Array.from(keys as Set<string>).map(Number);
                      onChange({ ...current, genre_ids: selected });
                    }}
                    placeholder="Select genres"
                    classNames={{
                      base: "w-full",
                      trigger: "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-200 font-semibold pr-3",
                      listbox: "max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 z-[100]",
                      listboxWrapper: "z-[100]",
                    }}
                    aria-label="Select genres"
                    renderValue={() => (
                      <span>{selectedGenreNames}</span>
                    )
                    }
                  >
                    {genres.map(genre => {
                      const isSelected = genreIds.includes(genre.genre_id);
                      return (
                        <SelectItem key={genre.genre_id.toString()} textValue={genre.genre_name}>
                          <span className="flex items-center">
                            <span
                              className={`inline-block w-2.5 h-2.5 rounded-full mr-2 border border-blue-400 ${
                                isSelected ? "bg-blue-500 dark:bg-blue-400" : "bg-transparent"
                              }`}
                            />
                            {genre.genre_name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </Select>
                  {genreIds.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Select at least one genre.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="movie-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="movie-duration"
                    type="number"
                    value={current.duration}
                    onChange={e => onChange({ ...current, duration: Number(e.target.value) })}
                    placeholder="e.g. 120"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    min={1}
                    required
                  />
                  {(!current.duration || current.duration < 1) && (
                    <p className="text-xs text-red-500 mt-1">Duration must be at least 1 minute.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="movie-premiere" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Premiere Date <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 pointer-events-none">
                        <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" className="stroke-current" />
                          <path d="M16 2v4M8 2v4M3 10h18" className="stroke-current" />
                        </svg>
                      </span>
                      <input
                        id="movie-premiere"
                        type="date"
                        value={dateInput}
                        onChange={e => {
                          setDateInput(e.target.value);
                          onChange({ ...current, premiere_date: e.target.value });
                        }}
                        required
                        className="border border-blue-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none text-blue-700 dark:text-blue-200 font-semibold transition-all shadow-sm"
                        style={{ minWidth: 0, fontSize: "1rem", height: "44px", WebkitAppearance: "none", MozAppearance: "textfield" }}
                      />
                    </div>
                  </div>
                  {!current.premiere_date && (
                    <p className="text-xs text-red-500 mt-1">Premiere date is required.</p>
                  )}
                </div>

                {/* Poster selection via Media Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Poster (select from media manager)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Open media manager to pick poster. Poster preview on the left will update.</p>
                  <button
                    type="button"
                    className="mt-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                    onClick={() => setShowMediaPicker(true)}
                  >
                    Open Media Manager
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="movie-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Description
                  </label>
                  <textarea
                    id="movie-description"
                    value={current.description || ""}
                    onChange={e => onChange({ ...current, description: e.target.value })}
                    placeholder="Enter a brief description (optional)"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    rows={8}
                    maxLength={500}
                    style={{ minHeight: "160px" }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(current.description || "").length}/500 characters
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <label htmlFor="movie-rating" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Rating (0.0–10.0)
                  </label>
                  <input
                    id="movie-rating"
                    type="number"
                    step="0.1"
                    min={0}
                    max={10}
                    value={typeof current.rating === "number" ? current.rating : ""}
                    onChange={e => onChange({ ...current, rating: e.target.value === "" ? undefined : Math.max(0, Math.min(10, Number(e.target.value))) })}
                    placeholder="e.g. 8.5"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  {(typeof current.rating === "number" && (current.rating < 0 || current.rating > 10)) && (
                    <p className="text-xs text-red-500 mt-1">Rating must be between 0 and 10.</p>
                  )}
                </div>

                <div> 
                  <label htmlFor="movie-trailer-url" className="block text-sm font medium text-gray-700 dark:text-gray-200 mb-1">
                    Trailer URL
                  </label>
                  <input
                    id="movie-trailer-url"
                    type="url"
                    value={current.teaser || ""}
                    onChange={e => onChange({ ...current, teaser: e.target.value })}
                    placeholder="Enter teaser trailer URL (optional)"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <AppButton color="danger" type="button" onClick={onClose}>
                    Cancel
                  </AppButton>
                  <AppButton color="success" type="submit" disabled={!formValid}>
                    {editing ? "Update" : "Add"}
                  </AppButton>
                </div>
              </form>
            </div>

            {/* Media Picker Modal for Gallery Selection */}
            {showMediaPicker && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-zinc-700 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-6 border-b border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-blue-50 via-blue-25 to-transparent dark:from-blue-950/40 dark:via-blue-900/30 dark:to-transparent">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Build Movie Gallery</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Select multiple images to create a gallery for this movie</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 ml-13">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            Step 1 of 2
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                            {galleryImages.length} selected
                          </span>
                        </div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg mt-1"
                        onClick={() => {
                          setShowMediaPicker(false);
                          setSelectedFolderPath(["root"]);
                          setExpandedFolders({ "root": true });
                        }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-zinc-800/30">
                    {/* Folder Tree */}
                    <div className="w-64 border-r border-gray-200 dark:border-zinc-700 overflow-y-auto bg-white dark:bg-zinc-900/50 p-4 flex flex-col">
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">🗂️ Image Library</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Browse and select images below</p>
                      </div>
                      {images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                          <div className="text-gray-300 dark:text-gray-600 mb-2">
                            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">No images uploaded yet</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Images are being fetched...</p>
                          <div className="mt-3 flex justify-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      ) : (
                        <FolderTreeSelector
                          node={folderTree}
                          path={[]}
                          expanded={expandedFolders}
                          setExpanded={setExpandedFolders}
                          selectedPath={selectedFolderPath}
                          onSelectFolder={setSelectedFolderPath}
                        />
                      )}
                    </div>

                    {/* Image Grid - Multi-select */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-6 border-b border-gray-200 dark:border-zinc-700">
                        {(() => {
                          const folderNode = getNodeByPath(selectedFolderPath);
                          const folderImages = folderNode?.items || [];
                          return folderImages.length > 0 ? (
                            <div>
                              <div className="flex items-center justify-between mb-5">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Available Images <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 ml-2">{folderImages.length}</span></h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Click to select</p>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                {folderImages.map(img => {
                                  const selected = galleryImages.some(i => i.id === img.id);
                                  return (
                                    <button
                                      key={img.id}
                                      type="button"
                                      className={`group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl transition ${
                                        selected ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900" : ""
                                      }`}
                                      onClick={() => handleMediaSelect(img)}
                                    >
                                      <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-700">
                                        <img
                                          src={img.url}
                                          alt={img.name}
                                          className="w-full h-40 object-cover transition group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                                        {selected && (
                                          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 rounded-xl">
                                            <div className="bg-blue-500 text-white rounded-full p-2">
                                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-2 truncate text-left">{img.name}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <div className="text-gray-300 dark:text-gray-600 mb-3">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">No images in this folder</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload images to this folder to select them</p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Selected Gallery Images Preview & Confirm */}
                      <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-blue-25 dark:from-blue-950/20 dark:to-blue-900/10 border-t border-gray-200 dark:border-zinc-700 px-6 py-3">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              ✓ Selected
                              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold bg-blue-600 text-white">{galleryImages.length}</span>
                            </h4>
                            {galleryImages.length > 0 && (
                              <button
                                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                                onClick={() => setGalleryImages([])}
                                type="button"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          {galleryImages.length > 0 ? (
                            <div className="flex gap-2 bg-white dark:bg-zinc-800/50 rounded-lg p-2 border border-blue-100 dark:border-blue-900/50 overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: "thin" }}>
                              {galleryImages.map((img, idx) => (
                                <div key={img.id} className="relative group flex-shrink-0">
                                  <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-600 shadow-sm hover:shadow-md transition">
                                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                                  </div>
                                  <div className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full">{idx + 1}</div>
                                  <button
                                    className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md"
                                    onClick={() => removeGalleryImage(img.id)}
                                    type="button"
                                    title="Remove"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Select images above
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 justify-between">
                          <button
                            className="px-3 py-2 rounded-lg font-medium text-xs transition border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                            onClick={() => {
                              setShowMediaPicker(false);
                              setSelectedFolderPath(["root"]);
                              setExpandedFolders({ "root": true });
                            }}
                            type="button"
                          >
                            Cancel
                          </button>
                          <div className="flex gap-2">
                            <button
                              className="px-4 py-2 rounded-lg font-semibold text-xs transition bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={confirmGallerySelection}
                              disabled={galleryImages.length === 0}
                              type="button"
                            >
                              Confirm
                            </button>
                            <button
                              className="px-4 py-2 rounded-lg font-semibold text-xs transition bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              type="button"
                              onClick={() => {
                                setShowMediaPicker(false);
                                setShowPosterSelector(true);
                              }}
                              disabled={galleryImages.length === 0}
                            >
                              <span>Poster</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Poster Selector Modal */}
            {showPosterSelector && (
              <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-zinc-700 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-6 border-b border-gray-200 dark:border-zinc-700 bg-gradient-to-r from-purple-50 via-purple-25 to-transparent dark:from-purple-950/40 dark:via-purple-900/30 dark:to-transparent">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">Set Movie Poster</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Choose one image from your gallery to use as the poster</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mt-3">
                          Step 2 of 2
                        </span>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg mt-1"
                        onClick={() => setShowPosterSelector(false)}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-zinc-800/30">
                    <div className="grid grid-cols-3 gap-5">
                      {galleryImages.map(img => (
                        <button
                          key={img.id}
                          type="button"
                          className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl transition transform hover:scale-105"
                          onClick={() => confirmPosterSelect(img)}
                        >
                          <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-700 shadow-md group-hover:shadow-xl transition">
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-56 object-cover transition"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <div className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-2 truncate text-center px-1" title={img.name}>{img.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-purple-25 dark:from-purple-950/20 dark:to-purple-900/10 border-t border-gray-200 dark:border-zinc-700 px-6 py-5 flex justify-between items-center">
                    <button
                      className="px-4 py-2 rounded-lg font-medium text-sm transition border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                      onClick={() => setShowPosterSelector(false)}
                      type="button"
                    >
                      Back
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Click any image to set as poster</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Folder Tree Selector Component for Media Picker
interface FolderTreeSelectorProps {
  node: FolderTreeNode;
  path?: string[];
  expanded?: Record<string, boolean>;
  setExpanded?: (exp: Record<string, boolean>) => void;
  selectedPath?: string[];
  onSelectFolder?: (path: string[]) => void;
}

function FolderTreeSelector({
  node,
  path = [],
  expanded = {},
  setExpanded = () => {},
  selectedPath = ["root"],
  onSelectFolder = () => {},
}: FolderTreeSelectorProps) {
  const hasChildrenAtAll = node && node.children && Object.keys(node.children).length > 0;
  if (!hasChildrenAtAll) return null;

  const mergedChildren: Record<string, FolderTreeNode> = { ...(node.children || {}) };

  return (
    <ul className="pl-2 border-l border-gray-200">
      {Object.keys(mergedChildren)
        .sort((a, b) => {
          if (a === "root") return -1;
          if (b === "root") return 1;
          return a.localeCompare(b);
        })
        .map((folder) => {
          const thisPath = [...path, folder];
          const pathKey = thisPath.join("/");
          const childNode = mergedChildren[folder] || { children: {} };
          const hasChildren =
            !!childNode.children && Object.keys(childNode.children).length > 0;
          // Gradual expansion: root always expanded, others collapsed by default
          const shouldRenderAsExpanded = folder === "root" ? (expanded[pathKey] ?? true) : (expanded[pathKey] ?? false);
          const isSelected = pathKey === (selectedPath?.join("/") ?? "root");
          const displayName = folder === "root" ? "Root" : folder;
          const imageCount = childNode.items?.length || 0;

          return (
            <li key={folder} className="relative group mb-1">
              <div
                className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2.5 transition ${
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-900/30 font-semibold text-blue-700 dark:text-blue-300 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-zinc-700/50 text-gray-700 dark:text-gray-300"
                }`}
                style={{ minHeight: 36 }}
                onClick={() => onSelectFolder(thisPath)}
              >
                {hasChildren ? (
                  <button
                    className={`flex items-center justify-center w-5 h-5 rounded transition flex-shrink-0 ${
                      isSelected
                        ? "hover:bg-blue-200 dark:hover:bg-blue-800"
                        : "hover:bg-gray-200 dark:hover:bg-zinc-600"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded({
                        ...expanded,
                        [pathKey]: !shouldRenderAsExpanded,
                      });
                    }}
                    tabIndex={-1}
                    type="button"
                  >
                    {shouldRenderAsExpanded ? (
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                ) : (
                  <span className="w-5 inline-block flex-shrink-0" />
                )}

                <span className="flex items-center gap-2 truncate flex-1">
                  <svg
                    className={`w-4 h-4 shrink-0 ${
                      isSelected
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className={`truncate text-sm font-medium ${
                    isSelected ? "font-semibold" : ""
                  }`}>{displayName}</span>
                </span>

                {imageCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-blue-500 text-white dark:bg-blue-600 flex-shrink-0">
                    {imageCount}
                  </span>
                )}
              </div>

              {hasChildren && shouldRenderAsExpanded && (
                <div className="ml-3">
                  <FolderTreeSelector
                    node={childNode}
                    path={thisPath}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    selectedPath={selectedPath}
                    onSelectFolder={onSelectFolder}
                  />
                </div>
              )}
            </li>
          );
        })}
    </ul>
  );
}