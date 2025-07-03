import * as React from "react";

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  return open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">{children}</div> : null;
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-xl p-6 w-full max-w-md ${className || ''}`}>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold mb-2">{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-500 text-sm mb-2">{children}</p>;
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  return <>{children}</>;
} 