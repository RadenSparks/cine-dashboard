import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GenreCard from "./GenreCard";
import { type Genre } from "@/shared/types/entities";

type IconOption = { name: string; icon: React.ReactNode };

type HoverRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

interface GenreGridProps {
  genres: Genre[];
  availableIcons: IconOption[];
  editingGenreId: number | null;
  setEditingGenreId: (id: number | null) => void;
  editingGenreName: string;
  setEditingGenreName: (name: string) => void;
  editingGenreIcon: string;
  setEditingGenreIcon: (icon: string) => void;
  onEdit: (id: number) => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onUpdateIcon: (id: number, icon: string) => void;
}

export default function GenreGrid({
  genres,
  availableIcons,
  editingGenreId,
  setEditingGenreId,
  editingGenreName,
  setEditingGenreName,
  editingGenreIcon,
  setEditingGenreIcon,
  onEdit,
  onUpdate,
  onDelete,
  onRestore,
  onUpdateIcon,
}: GenreGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [hoverRect, setHoverRect] = useState<HoverRect | null>(null);

  const updateHoverRect = (index: number) => {
    const card = cardRefs.current[index];
    const grid = gridRef.current;

    if (!card || !grid) {
      setHoverRect(null);
      return;
    }

    const cardRect = card.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();

    setHoverRect({
      top: cardRect.top - gridRect.top,
      left: cardRect.left - gridRect.left,
      width: cardRect.width,
      height: cardRect.height,
    });
  };

  return (
    <div ref={gridRef} className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      <AnimatePresence>
        {hoverRect && (
          <motion.span
            key="genre-hover-overlay"
            className="pointer-events-none absolute rounded-3xl -z-10 bg-neutral-200 dark:bg-slate-800/[0.8]"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: hoverRect.top,
              left: hoverRect.left,
              width: hoverRect.width,
              height: hoverRect.height,
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.15 },
              top: { duration: 0.18, ease: "easeOut" },
              left: { duration: 0.18, ease: "easeOut" },
              width: { duration: 0.18, ease: "easeOut" },
              height: { duration: 0.18, ease: "easeOut" },
            }}
            style={{ position: "absolute" }}
          />
        )}
      </AnimatePresence>
      {genres.map((genre, index) => (
        <div
          key={genre.genre_id}
          ref={(element) => {
            cardRefs.current[index] = element;
          }}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => updateHoverRect(index)}
          onMouseLeave={() => setHoverRect(null)}
        >
          <GenreCard
            genre={genre}
            availableIcons={availableIcons}
            editingGenreId={editingGenreId}
            setEditingGenreId={setEditingGenreId}
            editingGenreName={editingGenreName}
            setEditingGenreName={setEditingGenreName}
            editingGenreIcon={editingGenreIcon}
            setEditingGenreIcon={setEditingGenreIcon}
            onEdit={onEdit}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onRestore={onRestore}
            onUpdateIcon={onUpdateIcon}
          />
        </div>
      ))}
    </div>
  );
}