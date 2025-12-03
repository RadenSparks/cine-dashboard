import React from "react";
import type { Image } from "../../entities/type";

interface FolderTreeNode {
  children: Record<string, FolderTreeNode>;
  items?: Image[];
}

interface FolderTreeProps {
  node: FolderTreeNode;
  path?: string[];
  expanded?: Record<string, boolean>;
  setExpanded?: (exp: Record<string, boolean>) => void;
  selectedPath?: string[];
  setSelectedPath?: (path: string[]) => void;
  onDeleteFolder?: (folderName: string, folderId: number) => void;
  folderIds?: Record<string, number>;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  node,
  path = [],
  expanded = {},
  setExpanded = () => {},
  selectedPath = [],
  setSelectedPath = () => {},
  onDeleteFolder = () => {},
  folderIds = {},
}) => {
  // if nothing to render
  const hasChildrenAtAll = node && node.children && Object.keys(node.children).length > 0;
  if (!hasChildrenAtAll) return null;

  // Use backend folder data directly
  const mergedChildren: Record<string, FolderTreeNode> = { ...(node.children || {}) };

  return (
    <ul className="pl-2 border-l border-gray-100">
      {Object.keys(mergedChildren)
        .sort((a, b) => {
          // 'root' always comes first
          if (a === 'root') return -1;
          if (b === 'root') return 1;
          // Rest sorted alphabetically
          return a.localeCompare(b);
        })
        .map((folder) => {
        const thisPath = [...path, folder];
        const pathKey = thisPath.join("/");
        const childNode = mergedChildren[folder] || { children: {} };
        const hasChildren =
          !!childNode.children &&
          Object.keys(childNode.children).length > 0;
        const isExpanded = expanded[pathKey] ?? true;
        const isSelected = pathKey === selectedPath.join("/");
        const displayName = folder === 'root' ? 'Root' : folder;

        return (
          <li key={folder} className="relative group">
            <div
              className={`flex items-center gap-2 cursor-pointer rounded-lg pr-2 py-2 font-red-rose
                ${
                isSelected ? "bg-blue-50 font-semibold text-blue-700" : "hover:bg-gray-50"
              }`}
              style={{ minHeight: 40, fontFamily: 'Red Rose, sans-serif' }}
              onClick={() => setSelectedPath(thisPath)}
            >
              {hasChildren ? (
                <button
                  className="ml-1 mr-1 flex items-center justify-center w-7 h-7 rounded hover:bg-blue-50 focus:outline-none transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded({
                      ...expanded,
                      [pathKey]: !isExpanded,
                    });
                  }}
                  tabIndex={-1}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  type="button"
                >
                  {isExpanded ? (
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ) : (
                <span className="w-7 inline-block" />
              )}

              <span className="flex items-center gap-2 truncate ml-1">
                <svg className="w-5 h-5 text-yellow-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <span className="truncate">{displayName}</span>
              </span>

              <span className="ml-auto flex items-center gap-2 text-xs">
                {folder !== 'root' && childNode.items && childNode.items.length >= 10 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold" title="Folder is full">
                    Full
                  </span>
                )}
                <span className="text-gray-400 group-hover:text-blue-400">
                  {folder === 'root' ? (childNode.items?.length ? `${childNode.items.length} images` : "0 images") : (childNode.items?.length ? `${childNode.items.length}/10` : "0/10")}
                </span>
              </span>

              {folder !== 'root' && (
                <button
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded hover:bg-red-100 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    const folderId = folderIds[folder] || 0;
                    onDeleteFolder(folder, folderId);
                  }}
                  tabIndex={-1}
                  title="Delete folder"
                  type="button"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className="ml-3">
                <FolderTree
                  node={childNode}
                  path={thisPath}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  selectedPath={selectedPath}
                  setSelectedPath={setSelectedPath}
                  onDeleteFolder={onDeleteFolder}
                  folderIds={folderIds}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default FolderTree;