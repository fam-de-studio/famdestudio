import type { StaticImageData } from "next/image";
import mailer from "@/images/box-mailer.jpg";
import windowBox from "@/images/box-window.jpg";
import paperBag from "@/images/box-paper-bag.jpg";
import tissue from "@/images/box-tissue.jpg";
import gable from "@/images/box-gable.jpg";
import tuckEnd from "@/images/box-tuck-end.jpg";
import sandwichWedge from "@/images/box-sandwich-wedge.jpg";
import tray from "@/images/box-tray.jpg";

/** Everyday structures the studio also produces, shown as a thumbnail strip in Expertise. */
export type BoxStyle = { id: string; name: string; src: StaticImageData; alt: string };

export const boxStyles: BoxStyle[] = [
  { id: "mailer", name: "Mailer box", src: mailer, alt: "White roll-end mailer box with the lid open" },
  { id: "window", name: "Window box", src: windowBox, alt: "White box with a clear window in the hinged lid" },
  { id: "paper-bag", name: "Paper bag", src: paperBag, alt: "White paper carrier bag with rope handles" },
  { id: "tissue", name: "Tissue box", src: tissue, alt: "White tissue box with a sheet drawn from the oval opening" },
  { id: "gable", name: "Gable box", src: gable, alt: "White gable-top box with a carry handle" },
  { id: "cigarette", name: "Cigarette box", src: tuckEnd, alt: "White flip-top cigarette-style box with the lid open" },
  { id: "sandwich-wedge", name: "Sandwich wedge", src: sandwichWedge, alt: "White triangular sandwich wedge with a clear window" },
  { id: "frame-vue-tray", name: "Frame Vue Tray", src: tray, alt: "White open frame-vue tray with folded corners" },
];
