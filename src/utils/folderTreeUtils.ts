import type { Image } from "../entities/type";
import type { FolderTreeNode, FolderInfo } from "../types/folderTree";

/**
 * Builds a hierarchical folder tree from a list of images and folder metadata
 */
export function buildFolderTree(
  images: Image[],
  folderList: FolderInfo[]
): FolderTreeNode {
  const root: FolderTreeNode = { children: {} };

  // Always add 'root' folder first
  root.children["root"] = { children: {}, items: [] };

  // Create a map for quick lookup by folder name
  const folderMap: Record<string, FolderInfo> = {};
  folderList.forEach((f) => {
    folderMap[f.name] = f;
  });

  // Build hierarchical tree structure based on parent-child relationships
  const buildSubtree = (parentName: string | null): FolderTreeNode => {
    const node: FolderTreeNode = { children: {}, items: [] };

    // Find all folders that have this folder as parent
    folderList.forEach((folder) => {
      // For root level: folders with no parent or parentId = null
      if (parentName === null && !folder.parentId) {
        if (folder.name !== "root") {
          node.children[folder.name] = buildSubtree(folder.name);
        }
      }
      // For nested levels: folders with matching parent name
      else if (parentName && folderMap[parentName]?.id === folder.parentId) {
        node.children[folder.name] = buildSubtree(folder.name);
      }
    });

    return node;
  };

  // Build root's children (top-level folders under root)
  root.children["root"].children = buildSubtree(null).children;

  // Add images to their respective folders
  images.forEach((img) => {
    const folder = img.folderName ?? "root";
    const folderPath =
      folder === "root"
        ? ["root"]
        : buildFolderPath(folder, folderList, folderMap);

    let currentNode = root.children["root"];
    for (let i = 1; i < folderPath.length; i++) {
      if (!currentNode.children[folderPath[i]]) {
        currentNode.children[folderPath[i]] = { children: {}, items: [] };
      }
      currentNode = currentNode.children[folderPath[i]];
    }

    currentNode.items = currentNode.items ?? [];
    currentNode.items.push(img);
  });

  return root;
}

/**
 * Builds the full path to a folder by tracing parent relationships
 */
export function buildFolderPath(
  folderName: string,
  folderList: FolderInfo[],
  folderMap: Record<string, FolderInfo>
): string[] {
  const path: string[] = [];
  let currentName = folderName;

  while (currentName) {
    path.unshift(currentName);
    const folder = folderMap[currentName];
    if (!folder || !folder.parentId) break;

    const parentFolder = folderList.find((f) => f.id === folder.parentId);
    if (!parentFolder) break;
    currentName = parentFolder.name;
  }

  return ["root", ...path];
}

/**
 * Gets the folder node at a specific path in the tree
 */
export function getCurrentNode(
  tree: FolderTreeNode,
  path: string[]
): FolderTreeNode {
  let node = tree;
  for (const p of path) {
    node = node.children[p] ?? { children: {} };
  }
  return node;
}

/**
 * Creates a mapping of folder names to their IDs
 */
export function createFolderIdMap(folderList: FolderInfo[]): Record<string, number> {
  const folderIds: Record<string, number> = {};
  folderList.forEach((f) => {
    folderIds[f.name] = f.id;
  });
  return folderIds;
}
