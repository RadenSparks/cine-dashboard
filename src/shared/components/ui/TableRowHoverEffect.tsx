import { cn } from "@/shared/lib/utils";

interface TableRowHoverEffectProps {
  children: React.ReactNode;
  className?: string;
  deleted?: boolean;
}

export function TableRowWithHover({
  children,
  className,
  deleted = false,
}: TableRowHoverEffectProps) {
  return (
    <tr
      className={cn(
        "group transition-colors duration-200",
        !deleted && "hover:bg-gradient-to-r hover:from-green-500/20 hover:via-green-500/25 hover:to-blue-500/15 dark:hover:from-green-500/25 dark:hover:via-green-500/30 dark:hover:to-blue-500/20",
        deleted && "opacity-65",
        className
      )}
    >
      {children}
    </tr>
  );
}
