import { useCallback } from "react";

export function useToast() {
  const toast = useCallback(({ title, description, variant }: { title: string; description: string; variant?: "destructive" }) => {
    // For now, just use alert. Replace with a real toast system in production.
    alert(`${title}\n${description}`);
  }, []);
  return { toast };
} 