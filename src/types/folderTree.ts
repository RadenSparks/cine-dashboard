import type { Image } from "../entities/type";

export interface FolderTreeNode {
  children: Record<string, FolderTreeNode>;
  items?: Image[];
}

export interface FolderInfo {
  id: number;
  name: string;
  parentId?: number | null;
}
