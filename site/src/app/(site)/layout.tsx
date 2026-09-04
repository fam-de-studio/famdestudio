import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Cursor } from "@/components/site/Cursor";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { ImageGuard } from "@/components/site/ImageGuard";

/** Public site chrome. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="t-nav sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-text focus:px-4 focus:py-3 focus:text-ink"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <Cursor />
      <ImageGuard />
    </>
  );
}
