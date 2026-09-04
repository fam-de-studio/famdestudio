"use client";

import { useEffect } from "react";

/**
 * Deterrents against casual image copying: no context menu over images,
 * no drag-out, no drag-select of pictures. Pointer events on <img> are also
 * disabled in CSS, so "Save image as…" never appears in the native menu.
 * This does not stop a determined visitor (screenshots, dev tools) and is
 * not meant to.
 */
export function ImageGuard() {
  useEffect(() => {
    // <img> has pointer-events:none, so the event target is its wrapper.
    const wrapsImage = (t: EventTarget | null) => {
      const el = t instanceof Element ? t : null;
      if (!el) return false;
      if (el.tagName === "IMG" || el.tagName === "PICTURE") return true;
      if (el.querySelector(":scope > img, :scope > picture")) return true;
      const wrap = el.closest(".hmedia, .sheen, .reveal-clip, .hero-img, .hover-zoom");
      return !!wrap?.querySelector("img");
    };

    const onContextMenu = (e: MouseEvent) => {
      if (wrapsImage(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (wrapsImage(e.target)) e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
