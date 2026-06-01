"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ name }: { name: string }) {
  function share() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: name, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="btn-secondary flex items-center gap-2 py-2 text-sm"
    >
      <Share2 className="h-4 w-4" />
      Partager
    </button>
  );
}
