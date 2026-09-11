import Link from "next/link";
import Image from "next/image";

/**
 * LazyFlow logo system.
 *
 * Real logo assets live in /public/logo/, extracted from the brand sheet:
 *  - lazyflow-horizontal.png  -> white "LAZY" + blue "FLOW" wordmark (built for DARK backgrounds)
 *  - lazyflow-stacked.png     -> black "LAZY" + blue "FLOW" wordmark, icon on top (built for LIGHT backgrounds)
 *  - lazyflow-icon.png        -> mark only, white "L" + blue "F" (built for DARK backgrounds)
 *
 * NOTE: these are raster PNGs (chroma-keyed to transparent), not vector --
 * fine at the sizes used below, but will soften if scaled up much further.
 * Ask for SVG/vector source from the designer for large/print use.
 *
 * IMPORTANT: the horizontal & icon marks were designed with WHITE text/strokes
 * for a dark background. They will be invisible on light surfaces.
 */

type LogoProps = {
  className?: string;
  theme?: "dark" | "light"; // background context: "dark" = sitting on a dark surface, "light" = sitting on a light surface
};

/** Horizontal lockup - use in navbar / desktop / anywhere wide & short.
 *  Only has a light-text (white) version today, so it only reads correctly on dark surfaces. */
export function LogoHorizontal({ className = "", theme = "light" }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="LazyFlow home">
      {theme === "dark" ? (
        <Image
          src="/logo/lazyflow-horizontal.png"
          alt="LazyFlow"
          width={530}
          height={115}
          className="h-[34px] w-auto"
          priority
        />
      ) : (
        <>
          <span className="relative block h-9 w-9 overflow-hidden" aria-hidden="true">
            <Image
              src="/logo/lazyflow-stacked.png"
              alt=""
              width={530}
              height={340}
              className="absolute -left-[25px] -top-px max-w-none"
              style={{ width: 89, height: 57 }}
              priority
            />
          </span>
          <span className="ml-2 text-[15px] font-semibold tracking-[0.22em]">
            <span className="text-lf-ink">LAZY</span>
            <span className="text-lf-accent-2">FLOW</span>
          </span>
        </>
      )}
    </Link>
  );
}

/** Stacked lockup - use in centered sections (footer brand block, forms, etc).
 *  Only has a dark-text (black) version today, so it only reads correctly on light surfaces. */
export function LogoStacked({ className = "" }: LogoProps) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <Image
        src="/logo/lazyflow-stacked.png"
        alt="LazyFlow"
        width={530}
        height={340}
        className="h-auto w-[180px]"
      />
    </div>
  );
}

/** Icon-only lockup - favicon-style, mobile nav, small UI surfaces.
 *  White mark, so it only reads correctly on dark surfaces. */
export function LogoIcon({ className = "", size = 34 }: LogoProps & { size?: number }) {
  return (
    <span className={`inline-flex ${className}`}>
      <Image
        src="/logo/lazyflow-icon.png"
        alt="LazyFlow"
        width={235}
        height={245}
        style={{ height: size, width: "auto" }}
      />
    </span>
  );
}
