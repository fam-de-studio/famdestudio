import type { StaticImageData } from "next/image";
import perfume01 from "@/images/luxury-perfume-box-01.jpg";
import perfume02 from "@/images/luxury-perfume-box-02.jpg";
import aeterna from "@/images/aeterna-perfume.jpg";
import cosmeticCartons from "@/images/luxury-cosmetic-cartons.jpg";
import hotFoilSpotUv from "@/images/hot-foil-and-spot-uv.jpg";
import chocolate from "@/images/chocolate-packaging.jpg";
import jewellery from "@/images/jewellery-rigid-box.jpg";
import giftBox02 from "@/images/luxury-gift-box-02.jpg";
import giftBox01 from "@/images/luxury-gift-box-01.jpg";
import magnetic from "@/images/magnetic-box.jpg";
import metalized from "@/images/metalized-printing.jpg";
import cartons01 from "@/images/folding-carton-collection-01.jpg";
import cartons02 from "@/images/folding-carton-collection-02.jpg";
import rigidBox from "@/images/rigid-box.jpg";
import cornerDetail from "@/images/rigid-box-corner-detail.jpg";
import debossCloseUp from "@/images/deboss-close-up.jpg";
import embossCloseUp from "@/images/emboss-close-up.jpg";
import hotFoilCloseUp from "@/images/hot-foil-close-up.jpg";
import spotUvCloseUp from "@/images/spot-uv-close-up.jpg";
import texturedUv from "@/images/textured-uv.jpg";

export type ProjectImage = { src: StaticImageData; alt: string };

export type Project = {
  slug: string;
  name: string;
  /** Client / brand category shown on the case study. */
  category: string;
  /** Packaging type shown under the name. */
  type: string;
  /** Key finishes, shown as "Rigid Box · Hot Foil · Emboss". */
  finishes: string[];
  quantity: string;
  cover: ProjectImage;
  hero: ProjectImage;
  overview: string;
  challenge: string;
  concept: string;
  structure: string;
  materials: string;
  printing: string;
  finishing: string;
  finals: ProjectImage[];
  details: ProjectImage[];
  /** Placement in the selected-work grid. */
  size: "large" | "tall" | "wide" | "standard";
};

export const projects: Project[] = [
  {
    slug: "luxury-perfume-collection",
    name: "Luxury Perfume Collection",
    category: "Perfume · Niche fragrance house",
    type: "Rigid Box",
    finishes: ["Rigid Box", "Hot Foil", "Emboss"],
    quantity: "250 units",
    cover: {
      src: perfume01,
      alt: "Burgundy rigid perfume box with blind-embossed botanical columns and a small gold foil emblem, lid slid open to reveal an ivory fitment holding a glass bottle",
    },
    hero: {
      src: perfume02,
      alt: "Burgundy textured rigid box with a fine-line gold foil monogram, leaning against its base which holds a bottle of amber eau de parfum in an ivory tray",
    },
    overview:
      "A presentation box for a small fragrance house launching its first eau de parfum. The brief asked for something that would sit comfortably on a dressing table for years, not a carton that gets thrown away.",
    challenge:
      "A 250-unit run rules out most of the tooling a large house would use. The design had to deliver depth and touch with one foil die and one emboss die, on a wrap paper that would forgive small variations in hand assembly.",
    concept:
      "Old bookbinding as the reference: a deep burgundy cover, a single restrained monogram, and decoration carried in relief rather than in ink. The box opens like a slipcase so the bottle is presented, not unpacked.",
    structure:
      "Two-piece slide (drawer) rigid box with a thumb notch on the tray. 2 mm greyboard, tray lined in ivory paper with a die-cut foam fitment covered in the same stock. Dieline developed in ArtiosCAD and proofed as a white sample before any print.",
    materials:
      "120 gsm textured wrap paper in burgundy over 2 mm greyboard. 1.2 mm ivory-lined board for the tray. Cut foam insert with paper-wrapped face.",
    printing:
      "No process printing on the exterior: the colour is the paper itself, which keeps the run economical and the finish consistent across every unit.",
    finishing:
      "Blind emboss of the botanical columns and typographic panel on the front and spine. Champagne gold hot foil for the monogram and name. Emboss and foil registered to each other on the same press.",
    finals: [
      {
        src: perfume01,
        alt: "Open burgundy slide box with the bottle nested in an ivory tray, photographed on linen by a window",
      },
      {
        src: aeterna,
        alt: "Charcoal rigid perfume box with a tone-on-tone embossed floral emblem and gloss spot UV wordmark, beside an ivory carton with a gold foil initial",
      },
    ],
    details: [
      {
        src: embossCloseUp,
        alt: "Macro of a multi-level emboss on natural textured paper",
      },
      {
        src: hotFoilCloseUp,
        alt: "Macro of gold hot foil linework pressed into dark board",
      },
    ],
    size: "large",
  },
  {
    slug: "premium-cosmetics-cartons",
    name: "Premium Cosmetics",
    category: "Skincare · Boutique cosmetics brand",
    type: "Folding Carton",
    finishes: ["Folding Carton", "Hot Foil", "Spot UV", "Textured UV"],
    quantity: "500 units per SKU",
    cover: {
      src: cosmeticCartons,
      alt: "Three skincare cartons in ivory, sage and champagne, each with a different finish: tone-on-tone emboss, gloss spot UV leaves, and a fine textured pattern with a metallic band",
    },
    hero: {
      src: cosmeticCartons,
      alt: "Three skincare cartons in ivory, sage and champagne standing on a stone plinth against soft draped fabric",
    },
    overview:
      "A three-product skincare range with a shared structure and three distinct surface treatments. The cartons needed to read as one family on a shelf and feel different in the hand.",
    challenge:
      "Three finishes across three SKUs at 500 units each. Tooling had to be shared where possible, and the artwork had to survive the tolerances of a tuck-end carton on a 350 gsm board.",
    concept:
      "One quiet botanical drawing, interpreted three ways: blind emboss on ivory, gloss spot UV on sage, and a micro-textured pattern with a gloss band on champagne. Type in gold foil on all three ties the range together.",
    structure:
      "Reverse tuck-end carton with a locking base, sized for glass bottles and a jar. One dieline serves all three products with a change of height only, which halves the cutting-die cost.",
    materials:
      "350 gsm FBB board with a smooth ivory face for the serum, and two pre-coloured, uncoated boards for the moisturiser and eye cream to keep the colour honest without heavy ink coverage.",
    printing:
      "Offset, one spot colour for the pattern on the sage carton plus a matte overprint varnish. The other two cartons carry no process ink at all.",
    finishing:
      "Gold hot foil for the product names. Blind emboss (ivory), gloss spot UV (sage), textured UV with a gloss band (champagne). Each carton makes one pass through finishing after print.",
    finals: [
      {
        src: cosmeticCartons,
        alt: "Three skincare cartons showing embossed, spot UV and textured finishes side by side",
      },
      {
        src: hotFoilSpotUv,
        alt: "Macro of a green board with gold hot foil geometry combined with gloss spot UV leaves",
      },
    ],
    details: [
      {
        src: spotUvCloseUp,
        alt: "Macro of gloss spot UV lines against matte black board",
      },
      {
        src: texturedUv,
        alt: "Macro of a raised textured UV pattern on burgundy paper",
      },
    ],
    size: "standard",
  },
  {
    slug: "artisan-chocolate",
    name: "Artisan Chocolate",
    category: "Food · Chocolatier",
    type: "Rigid Box",
    finishes: ["Rigid Box", "Deboss", "Foil"],
    quantity: "100 units",
    cover: {
      src: chocolate,
      alt: "Burgundy hinged rigid box with a gold foil crest and blind-debossed leaf, lid open to show sixteen chocolates in a dark paper tray",
    },
    hero: {
      src: chocolate,
      alt: "Open chocolate presentation box on an oak table beside a gold spoon and a ceramic dish",
    },
    overview:
      "A sixteen-piece presentation box for a chocolatier's seasonal collection. Quantity: one hundred. The client wanted the box to be the reason people bought the gift.",
    challenge:
      "A hundred boxes means everything is essentially hand-made. The design leaned into that: a hinged lid, a paper tray with individual cells, and finishing that looks expensive because it is precise rather than because there is a lot of it.",
    concept:
      "A crest in gold, a botanical mark in blind deboss, and a paper with visible texture. The interior is dark so the chocolates read as jewellery.",
    structure:
      "Hinged-lid rigid box (book style) with a magnetic closure. Separate 16-cell tray in black kraft board, sized to the chocolatier's moulds. Prototyped twice to get the lid overhang right.",
    materials:
      "Burgundy textured wrap paper over 1.5 mm greyboard. Black uncoated 300 gsm board for the tray. Concealed neodymium magnets.",
    printing:
      "None on the exterior. The crest and text are foil; the leaf is deboss. Interior tray unprinted.",
    finishing:
      "Champagne gold hot foil crest and typography. Blind deboss botanical mark. Both dies run on a small platen press to keep the make-ready economical at this quantity.",
    finals: [
      {
        src: chocolate,
        alt: "Chocolate box open on a wooden table with a gold spoon",
      },
    ],
    details: [
      {
        src: debossCloseUp,
        alt: "Macro of a deboss into deep navy fibrous board",
      },
      {
        src: cornerDetail,
        alt: "Corner of a rigid box showing wrap tension and a debossed frame",
      },
    ],
    size: "tall",
  },
  {
    slug: "jewellery-presentation",
    name: "Jewellery Presentation",
    category: "Jewellery · Fine jewellery atelier",
    type: "Rigid Box",
    finishes: ["Rigid Box", "Deboss", "Soft Touch", "Foil"],
    quantity: "150 units",
    cover: {
      src: jewellery,
      alt: "Charcoal soft-touch jewellery box with a blind-debossed laurel and silver foil wordmark, open beside it a matching box with an ivory suede interior holding a pendant necklace",
    },
    hero: {
      src: giftBox02,
      alt: "Deep green drawer box with a debossed geometric frame and thin foil border, drawer open to reveal a green velvet cushion, a pearl pendant and a small card",
    },
    overview:
      "Two pieces for a fine jewellery atelier: a hinged pendant box and a drawer-style gift box, sharing one material language across a run of 150.",
    challenge:
      "Jewellery packaging is judged at very close range and by the weight in the hand. The boxes needed real board mass, dead-flat lids and interiors that hold a pendant in place without visible fixings.",
    concept:
      "Charcoal and forest green with ivory interiors. The exterior carries only a debossed mark and a foil wordmark; everything else is the material.",
    structure:
      "Pendant box: hinged lid with a spring-loaded stay and a suede-covered card pad with a hidden chain slot. Gift box: drawer with a grosgrain pull, velvet-wrapped cushion insert and a card sleeve.",
    materials:
      "2 mm greyboard, soft-touch laminated wrap for the charcoal box, textured green paper for the drawer box. Ivory suede and green velvet interiors.",
    printing:
      "Interior card in one colour on 400 gsm ivory board with a foil border. Exterior unprinted.",
    finishing:
      "Blind deboss of the laurel and frame. Silver foil wordmark on the charcoal box, champagne foil rule on the green box. Soft-touch lamination throughout.",
    finals: [
      {
        src: jewellery,
        alt: "Charcoal pendant box open beside its closed twin",
      },
      {
        src: giftBox02,
        alt: "Green drawer gift box with velvet cushion and pendant",
      },
    ],
    details: [
      {
        src: debossCloseUp,
        alt: "Macro of debossed tessellation on navy board",
      },
    ],
    size: "standard",
  },
  {
    slug: "botanical-gift-box",
    name: "Botanical Gift Box",
    category: "Gifting · Fine goods brand",
    type: "Drawer Rigid Box",
    finishes: ["Drawer Box", "Emboss", "Foil"],
    quantity: "300 units",
    cover: {
      src: giftBox01,
      alt: "Forest green drawer box with an embossed botanical border, a thin gold foil frame and gold monogram, drawer pulled out with a satin ribbon tab to show an ivory interior",
    },
    hero: {
      src: giftBox01,
      alt: "Green embossed drawer box in warm window light on grey linen",
    },
    overview:
      "A reusable drawer box for a fine-goods brand's gifting range, designed to be kept on a shelf after the gift is opened.",
    challenge:
      "Full-surface relief on a wrap paper: the emboss had to be deep enough to read across the whole lid without cracking the paper or distorting the frame around it.",
    concept:
      "A wild botanical border pressed into deep green, contained by one hairline of gold. The restraint of the frame is what makes the relief feel expensive.",
    structure:
      "Drawer box with a satin ribbon pull and a lift-out ivory tray. 1.8 mm greyboard sleeve, 1.2 mm drawer. Sleeve wrap registered so the frame sits equidistant on all four edges.",
    materials:
      "Textured green wrap paper, ivory lined drawer board, champagne satin ribbon.",
    printing: "No process printing. The foil frame and monogram are the only applied colour.",
    finishing:
      "Multi-level blind emboss of the botanical border. Gold hot foil frame and monogram, registered to the emboss. Foil hairline continues onto the drawer front.",
    finals: [
      {
        src: giftBox01,
        alt: "Green drawer box with embossed botanicals and gold foil frame",
      },
    ],
    details: [
      {
        src: embossCloseUp,
        alt: "Macro of multi-level embossing",
      },
      {
        src: hotFoilCloseUp,
        alt: "Macro of gold foil geometry on black board",
      },
    ],
    size: "wide",
  },
  {
    slug: "magnetic-cosmetics-box",
    name: "Cosmetics Discovery Set",
    category: "Cosmetics · Luxury skincare",
    type: "Magnetic Rigid Box",
    finishes: ["Magnetic Box", "Deboss", "Foil"],
    quantity: "200 units",
    cover: {
      src: magnetic,
      alt: "Ivory magnetic-closure rigid box with a debossed wordmark and gold foil lotus, lid open to reveal a black velvet interior holding four skincare miniatures",
    },
    hero: {
      src: magnetic,
      alt: "Ivory magnetic box open on a stone surface with four skincare bottles in a black velvet fitment",
    },
    overview:
      "A discovery set for a skincare brand: four miniatures in a magnetic-closure rigid box with a fitted velvet interior.",
    challenge:
      "Four different glass components in one fitment, in a box light enough to post and rigid enough to feel like a gift. The ivory wrap had to stay clean through hand assembly.",
    concept:
      "Ivory outside, black inside. The contrast happens at the moment of opening, and the lid interior carries the brand in foil so the name is the first thing seen.",
    structure:
      "Magnetic flap-lid rigid box, 1.5 mm greyboard, with a die-cut EVA fitment wrapped in black velvet. Prototyped with the actual glass to check retention when the box is tipped.",
    materials:
      "Ivory linen-texture wrap paper, black velvet flock on EVA, concealed magnets in lid and base.",
    printing: "Unprinted exterior. Interior lid panel carries foil only.",
    finishing:
      "Blind deboss wordmark. Gold hot foil lotus and secondary type. Gold foil brand name on the black interior lid.",
    finals: [
      {
        src: magnetic,
        alt: "Open ivory magnetic box with black velvet interior and miniatures",
      },
    ],
    details: [
      {
        src: cornerDetail,
        alt: "Rigid box corner and wrap detail",
      },
    ],
    size: "standard",
  },
  {
    slug: "metalized-botanical-carton",
    name: "Metalized Elixir Carton",
    category: "Cosmetics · Botanical apothecary",
    type: "Folding Carton",
    finishes: ["Folding Carton", "Metalized Print"],
    quantity: "1,000 units",
    cover: {
      src: metalized,
      alt: "Folding carton printed on silver metalized board with burgundy and navy botanical illustration, the unprinted silver areas reflecting the room",
    },
    hero: {
      src: metalized,
      alt: "Silver metalized carton with burgundy and navy inks on a dark wooden table",
    },
    overview:
      "A single-SKU carton for a botanical elixir where the whole surface needed to feel metallic, at a quantity where foil coverage this large would be impractical.",
    challenge:
      "Achieving a full-bleed metallic without foil. Printing on metalized board means every ink behaves differently: transparent colours turn metallic, and white has to be laid down first wherever paper-white is wanted.",
    concept:
      "A Victorian apothecary label reinterpreted: engraving-style botanicals in two rich inks, framed by fine silver rules that are simply the board showing through.",
    structure:
      "Straight tuck-end carton with a crash-lock base, sized for a 100 ml jar. Panel layout keeps the illustration continuous around all four faces.",
    materials: "Silver metalized 320 gsm board (metallised PET laminated to FBB).",
    printing:
      "Offset with two transparent spot inks over silver, plus an opaque white underprint for the type panel. Overprint varnish for scuff resistance.",
    finishing:
      "The metalized substrate is the finish. A soft matte varnish over the inks keeps the illustration from competing with the reflections.",
    finals: [
      {
        src: metalized,
        alt: "Silver metalized carton with burgundy and navy botanical print",
      },
    ],
    details: [
      {
        src: cartons02,
        alt: "Six folding cartons in ivory, burgundy, green, navy, taupe and black, each with a different finish",
      },
    ],
    size: "standard",
  },
  {
    slug: "folding-carton-collection",
    name: "Folding Carton Collection",
    category: "Studio · Finishing library",
    type: "Premium Cartons",
    finishes: ["Folding Carton", "Foil", "Emboss", "Spot UV", "Textured UV"],
    quantity: "Sample run",
    cover: {
      src: cartons01,
      alt: "Six gable-top folding cartons in ivory, burgundy, green, navy, taupe and grey, each showing a different finish: gold foil, emboss, deboss, spot UV, textured UV and silver foil",
    },
    hero: {
      src: cartons02,
      alt: "Six lidded folding cartons laid out on a dark surface, each with a different surface finish",
    },
    overview:
      "The studio's own finishing library: one carton structure produced in six coloured boards with six different finishes, so clients can hold the difference rather than imagine it.",
    challenge:
      "Show six finishes fairly. Each board colour was chosen so the finish it carries is the one that suits it best, and the artwork was drawn once so the comparison is honest.",
    concept:
      "The same ornamental motif on every carton. What changes is how the surface carries it: foil, emboss, deboss, gloss, texture and silver.",
    structure:
      "Gable-top carton and a lidded tray carton, both with a single-piece dieline. The gable top was chosen because the angled panels show finishes under two lighting angles at once.",
    materials:
      "Six coloured uncoated boards, 300 to 350 gsm: ivory, burgundy, forest, navy, taupe and black.",
    printing: "Unprinted. Every carton relies on finishing alone, which is the point of the exercise.",
    finishing:
      "Gold foil (ivory), blind emboss (burgundy), blind deboss (green), gloss spot UV (navy), textured UV (taupe), silver foil and gloss panel (black).",
    finals: [
      {
        src: cartons01,
        alt: "Six gable-top cartons in a row with different finishes",
      },
      {
        src: cartons02,
        alt: "Six lidded tray cartons laid out on a dark surface",
      },
    ],
    details: [
      {
        src: rigidBox,
        alt: "Green embossed rigid box with a gold foil rule, drawer open to reveal a green perfume bottle on velvet",
      },
    ],
    size: "wide",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const getNextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};

export const featuredProjects = projects.slice(0, 6);
