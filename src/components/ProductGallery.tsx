"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const gallery = images.length ? images : [];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const current = gallery[active] ?? gallery[0];

  if (!current) return null;

  return (
    <>
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-shifaa-cream">
          <Image
            src={current}
            alt={name}
            fill
            className="object-cover cursor-zoom-in"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            onClick={() => setZoom(true)}
          />
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 shadow"
            aria-label="Agrandir"
          >
            <ZoomIn className="h-5 w-5 text-shifaa-ink" />
          </button>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActive((a) => (a - 1 + gallery.length) % gallery.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActive((a) => (a + 1) % gallery.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === active ? "border-shifaa-green" : "border-transparent"
                }`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full max-h-[90vh] w-full max-w-4xl">
            <Image src={current} alt={name} fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </>
  );
}
