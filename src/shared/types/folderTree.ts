import type { Image } from "@/shared/types/entities";

export interface FolderTreeNode {
  children: Record<string, FolderTreeNode>;
  items?: Image[];
}

export interface FolderInfo {
  id: number;
  name: string;
  parentId?: number | null;
}
