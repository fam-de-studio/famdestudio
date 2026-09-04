/** Expertise columns (Section 03). */
export const expertise = [
  {
    title: "Design",
    items: ["Packaging Design", "Artwork", "Structural Design", "Dielines", "3D Visualization"],
  },
  {
    title: "Production",
    items: ["Offset Printing", "Flexographic Printing", "Metalized Printing", "Prepress", "Color Management"],
  },
  {
    title: "Finishing",
    items: ["Hot Foiling", "Embossing", "Debossing", "Spot UV", "Textured UV", "Drip-Off UV", "Soft Touch"],
  },
] as const;

export const formats = ["Rigid Boxes", "Magnetic Boxes", "Premium Cartons"] as const;

/** Five-step process (Section 08). */
export const process = [
  { n: "01", title: "Discover", text: "Understand the product, brand and objective." },
  { n: "02", title: "Design", text: "Develop the visual and structural direction." },
  { n: "03", title: "Engineer", text: "Prepare dielines, materials, print specifications and finishing." },
  { n: "04", title: "Produce", text: "Coordinate printing and premium finishing." },
  { n: "05", title: "Deliver", text: "A refined final packaging solution ready for the brand." },
] as const;

/** Timeline (Section 09). */
export const timeline = [
  {
    mark: "1998",
    title: "The beginning",
    text: "Started a professional journey in design and printing.",
  },
  {
    mark: "Pakistan",
    title: "Design, advertising, print, packaging",
    text: "Graphic design, outdoor advertising, flex, offset and flexographic printing, prepress and packaging production.",
  },
  {
    mark: "Dubai",
    sub: "10 years",
    title: "International environment",
    text: "A decade working on international brands and production in one of the most demanding luxury markets.",
  },
  {
    mark: "Today",
    title: "FAM De Studio",
    text: "Focused on premium packaging and small-volume luxury projects for brands anywhere.",
  },
] as const;

/** Structural journey (Section 06). */
export const structureSteps = [
  { label: "Dieline", text: "Flat, dimensioned, with cuts, creases and glue flaps resolved." },
  { label: "3D Structure", text: "Folded digitally to check fit, closure and panel sequence." },
  { label: "Prototype", text: "A white sample, cut and folded, in the real board." },
  { label: "Print", text: "Artwork imposed to the dieline with bleed, registration and finishing layers." },
  { label: "Finished Packaging", text: "Foiled, embossed, cut, glued and assembled." },
] as const;

/** Tools (Section 11). */
export const tools = [
  { title: "Design", items: ["Adobe Illustrator", "Adobe Photoshop", "Adobe InDesign"] },
  { title: "3D", items: ["Blender"] },
  { title: "Structural", items: ["ArtiosCAD", "Esko"] },
  { title: "Production", items: ["Prepress", "Print Production", "Color", "Packaging Finishing"] },
] as const;

/** Inquiry form options (Section 13). */
export const projectTypes = [
  "Luxury Carton",
  "Rigid Box",
  "Perfume Packaging",
  "Cosmetic Packaging",
  "Jewellery Packaging",
  "Food Packaging",
  "Gift Packaging",
  "Other",
] as const;

export const quantities = ["50–100", "100–500", "500–1,000", "1,000+", "Not Decided"] as const;

export const finishingOptions = [
  "Hot Foil",
  "Emboss",
  "Deboss",
  "Spot UV",
  "Textured UV",
  "Drip-Off UV",
  "Metalized Printing",
  "Soft Touch",
  "Rigid Box",
  "Other",
] as const;
