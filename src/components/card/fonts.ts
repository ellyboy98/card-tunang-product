// Card typefaces, self-hosted by next/font so no third-party stylesheet blocks
// the first paint. Every family is declared here (next/font needs module scope)
// with preload off, so a page only downloads the files its preset actually uses.
import { Amiri, Cormorant_Garamond, EB_Garamond, Fraunces, Great_Vibes, Lora, Nunito_Sans, Playfair_Display } from "next/font/google";
import type { FontPresetKey } from "@/lib/presets";

export const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], display: "swap", preload: false, variable: "--font-cormorant" });
export const nunitoSans = Nunito_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-nunito" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const ebGaramond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const lora = Lora({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", preload: false });
const amiri = Amiri({ subsets: ["latin", "arabic"], weight: ["400", "700"], style: ["normal", "italic"], display: "swap", preload: false });

/** CSS font-family stacks (with next/font's metric-matched fallback) per preset. */
export const CARD_FONTS: Record<FontPresetKey, { display: string; body: string }> = {
  classic: { display: cormorant.style.fontFamily, body: nunitoSans.style.fontFamily },
  script: { display: greatVibes.style.fontFamily, body: ebGaramond.style.fontFamily },
  modern: { display: playfair.style.fontFamily, body: lora.style.fontFamily },
  minimal: { display: fraunces.style.fontFamily, body: fraunces.style.fontFamily },
  jawi: { display: amiri.style.fontFamily, body: amiri.style.fontFamily },
};
