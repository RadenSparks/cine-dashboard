import React, { useState } from "react";
import type { Image } from "../../entities/type";

interface FolderTreeNode {
  children: Record<string, FolderTreeNode>;
  items?: Image[];
}

interface MoveModalProps {
  show: boolean;
  onClose: () => void;
  onMove: () => void;
  moveTargetFolder: string | null;
  setMoveTargetFolder: (folder: string) => void;
  folderTree: unknown;
  disabled?: boolean;
}

const FolderTreeSelector: React.FC<{
  node: FolderTreeNode;
  path?: string[];
  expanded?: Record<string, boolean>;
  setExpanded?: (exp: Record<string, boolean>) => void;
  selectedPath?: string | null;
  setSelectedPath?: (path: string | null) => void;
}> = ({
  node,
  path = [],
  expanded = {},
  setExpanded = () => {},
  selectedPath = null,
  setSelectedPath = () => {},
}) => {
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
          // Gradual expansion: folders are collapsed by default, expand only when user clicks
          const isExpanded = expanded[pathKey] ?? false;
          // Root is always expanded initially
          const shouldRenderAsExpanded = folder === "root" ? (expanded[pathKey] ?? true) : isExpanded;
          const isSelected = pathKey === (selectedPath ?? "");
          const displayName = folder === "root" ? "Root" : folder;

          return (
            <li key={folder} className="relative group">
              <div
                className={`flex items-center gap-2 cursor-pointer rounded-lg pr-2 py-2 transition ${
                  isSelected
                    ? "bg-blue-100 font-semibold text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                style={{ minHeight: 32 }}
                onClick={() => setSelectedPath(pathKey === "" ? "" : pathKey)}
              >
                {hasChildren ? (
                  <button
                    className="ml-1 mr-1 flex items-center justify-center w-6 h-6 rounded hover:bg-blue-50 focus:outline-none transition"
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
                        className="w-4 h-4 text-blue-500"
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
                        className="w-4 h-4 text-gray-400"
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
                  <span className="w-6 inline-block" />
                )}

                <span className="flex items-center gap-2 truncate">
                  <svg
                    className="w-4 h-4 text-yellow-500 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="truncate text-sm">{displayName}</span>
                </span>
              </div>

              {hasChildren && shouldRenderAsExpanded && (
                <div className="ml-3">
                  <FolderTreeSelector
                    node={childNode}
                    path={thisPath}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    selectedPath={selectedPath}
                    setSelectedPath={setSelectedPath}
                  />
                </div>
              )}
            </li>
          );
        })}
    </ul>
  );
};

const MoveModal: React.FC<MoveModalProps> = ({
  show,
  onClose,
  onMove,
  moveTargetFolder,
  setMoveTargetFolder,
  folderTree,
  disabled,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Initialize with only root expanded on first mount
    return { "root": true };
  });

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative max-h-[80vh] flex flex-col">
        <h3 className="text-lg font-bold mb-4 text-blue-600">Move Images</h3>
        
        <div className="mb-4">
          <label className="block mb-3 text-sm font-medium text-gray-700">
            Select Destination Folder
          </label>
          <div className="border border-gray-200 rounded-lg bg-gray-50 p-3 overflow-y-auto max-h-64">
            <FolderTreeSelector
              node={folderTree as FolderTreeNode}
              path={[]}
              expanded={expanded}
              setExpanded={setExpanded}
              selectedPath={moveTargetFolder}
              setSelectedPath={(path) => setMoveTargetFolder(path ?? "")}
            />
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-4">
          Selected: <span className="font-semibold text-gray-900">{moveTargetFolder || "Root"}</span>
        </div>

        <div className="flex justify-end gap-2 mt-auto">
          <button
            className="flex items-center gap-1 bg-gray-200 text-gray-700 px-6 py-2 rounded shadow hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 transition"
            type="button"
            onClick={onClose}
            disabled={disabled}
          >
            Cancel
          </button>
          <button
            className="flex items-center gap-1 bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 focus:ring-2 focus:ring-green-400 disabled:bg-green-300 transition"
            type="button"
            onClick={onMove}
            disabled={disabled}
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;