import { useEffect } from "react";

// Lightweight stand-in for the per-route `head()` title that TanStack
// Start's SSR head management used to provide.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
