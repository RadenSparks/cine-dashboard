// SimpleTooltip.tsx
import React from "react";

export function SimpleTooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 -top-2 mb-2 px-4 py-2 rounded bg-black text-white text-xs shadow-xl whitespace-pre pointer-events-none font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>
          {content}
        </div>
      )}
    </div>
  );
}