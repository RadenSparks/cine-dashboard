import {
  TagIcon, RocketIcon, LaughIcon, VenetianMaskIcon, SwordIcon, ActivityIcon,
  FilmIcon as LucideFilmIcon, StarIcon, HeartIcon, GhostIcon, MusicIcon
} from "lucide-react";
import type { JSX } from "react";

export const genreIconMap: Record<string, JSX.Element> = {
  Tag: <TagIcon className="w-6 h-6 mr-2 inline" />,
  Rocket: <RocketIcon className="w-6 h-6 mr-2 inline text-blue-500" />,
  Laugh: <LaughIcon className="w-6 h-6 mr-2 inline text-yellow-500" />,
  VenetianMask: <VenetianMaskIcon className="w-6 h-6 mr-2 inline text-purple-500" />,
  Sword: <SwordIcon className="w-6 h-6 mr-2 inline text-green-500" />,
  Activity: <ActivityIcon className="w-6 h-6 mr-2 inline text-red-500" />,
  Film: <LucideFilmIcon className="w-6 h-6 mr-2 inline text-gray-500" />,
  Star: <StarIcon className="w-6 h-6 mr-2 inline text-yellow-400" />,
  Heart: <HeartIcon className="w-6 h-6 mr-2 inline text-pink-500" />,
  Ghost: <GhostIcon className="w-6 h-6 mr-2 inline text-indigo-500" />,
  Music: <MusicIcon className="w-6 h-6 mr-2 inline text-blue-400" />,
};

export function getGenreIcon(iconName?: string) {
  return genreIconMap[iconName ?? "Film"] || genreIconMap["Film"];
}