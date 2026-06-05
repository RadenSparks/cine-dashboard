import type { ToastNotification } from "@/shared/components/ui/SatelliteToast";
import type { FolderTreeNode } from "@/shared/types/folderTree";
import FolderTree from "../FolderTree";
import FolderCreator from "../components/FolderCreator";
import { SectionCard } from "@/shared/components/ui/DashboardPrimitives";

interface FolderPanelProps {
  folderTree: FolderTreeNode;
  folderPath: string[];
  setFolderPath: (path: string[]) => void;
  expanded: Record<string, boolean>;
  setExpanded: (expanded: Record<string, boolean>) => void;
  folderIds: Record<string, number>;
  onDeleteFolder: (folderName: string, folderId: number) => void;
  toastRef: React.RefObject<{ showNotification: (options: Omit<ToastNotification, "id">) => void } | null>;
}

export function FolderPanel({
  folderTree,
  folderPath,
  setFolderPath,
  expanded,
  setExpanded,
  folderIds,
  onDeleteFolder,
  toastRef,
}: FolderPanelProps) {
  return (
    <SectionCard title="Folder tree" description="Use the folder tree as the main navigation model for shared image assets." className="h-full">
      <div className="space-y-4">
        <FolderCreator
          onFolderCreated={(name) => {
            setExpanded({ ...expanded, [name]: true });
            setFolderPath([name]);
          }}
          toastRef={toastRef}
        />
        <div className="max-h-[56vh] overflow-y-auto rounded-xl border border-slate-200 bg-white/85 p-3 dark:border-slate-700 dark:bg-slate-900/72">
          <FolderTree
            node={folderTree}
            path={[]}
            expanded={expanded}
            setExpanded={setExpanded}
            selectedPath={folderPath}
            setSelectedPath={setFolderPath}
            onDeleteFolder={onDeleteFolder}
            folderIds={folderIds}
          />
        </div>
      </div>
    </SectionCard>
  );
}
