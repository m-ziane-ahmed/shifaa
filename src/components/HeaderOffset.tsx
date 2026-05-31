"use client";

import { useEffect, useRef, useState } from "react";

export function HeaderOffset({ children }: { children: React.ReactNode }) {
  const [height, setHeight] = useState(0);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Récupérer le header par son id
    const header = document.getElementById("site-header");
    if (!header) return;
    headerRef.current = header;

    const observer = new ResizeObserver(() => {
      setHeight(header.offsetHeight);
    });
    observer.observe(header);
    setHeight(header.offsetHeight);

    return () => observer.disconnect();
  }, []);

  return (
    <main
      style={{ paddingTop: height > 0 ? height : undefined }}
      className="flex-1 pb-16 md:pb-0"
    >
      {children}
    </main>
  );
}
