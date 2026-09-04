"use client";

import { useEffect } from "react";

/**
 * Deterrents against casual copying:
 * - no context menu anywhere (removes "Save as…", "Save image as…", "Copy image")
 * - no drag-out of images
 * - Ctrl/Cmd+S (save page) is swallowed
 * Pointer events on <img> are also disabled in CSS, and a print stylesheet
 * hides images. This does not stop a determined visitor (browser menu,
 * screenshots, dev tools) and is not meant to.
 */
export function ImageGuard() {
  useEffect(() => {
    const wrapsImage = (t: EventTarget | null) => {
      const el = t instanceof Element ? t : null;
      if (!el) return false;
      if (el.tagName === "IMG" || el.tagName === "PICTURE") return true;
      if (el.querySelector(":scope > img, :scope > picture")) return true;
      const wrap = el.closest(".hmedia, .sheen, .reveal-clip, .hero-img, .hover-zoom");
      return !!wrap?.querySelector("img");
    };

    const onContextMenu = (e: MouseEvent) => {
      // Keep the native menu on form fields so people can paste into the form.
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("input, textarea, select")) return;
      e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (wrapsImage(e.target)) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
