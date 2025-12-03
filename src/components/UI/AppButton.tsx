import React from "react";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  gradient?: string;
  color?: "primary" | "danger" | "success" | "default";
  icon?: React.ReactElement;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const colorMap = {
  primary: "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500",
  danger: "bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500",
  success: "bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500",
  default: "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600",
};

const AppButtonComponent: React.FC<AppButtonProps> = ({
  children,
  gradient,
  color = "primary",
  icon,
  className = "",
  disabled,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        ${gradient ? "" : colorMap[color]}
        text-white font-bold px-3 py-1 rounded-lg shadow transition-all duration-300 text-sm
        flex items-center gap-2 font-red-rose
        ${className}
      `.trim()}
      style={{
        ...(gradient ? { background: gradient } : {}),
        opacity: disabled ? 0.4 : 1.0,
        cursor: disabled ? "not-allowed" : "pointer",
        pointerEvents: disabled ? "none" : "auto",
        fontFamily: 'Red Rose, sans-serif',
      }}
      {...props}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children}
    </button>
  );
};

// Memoize the component to prevent unnecessary re-renders from parent state changes
const MemoizedAppButton = React.memo(AppButtonComponent);

export default MemoizedAppButton;