// Замена web/lib/fonts.ts платформы для статического сайта: те же шрифты (fonts.generated.json платформы),
// но из assets/fonts/motion/ этого сайта и без @remotion/fonts (delayRender нужен рендеру, а не превью).

import fonts from "@/lib/fonts.generated.json";

let started = false;

export function ensureFonts(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  for (const f of fonts) {
    const face = new FontFace(f.family, `url(/assets/fonts/motion/${f.file}) format("woff2")`, {
      weight: f.weight,
      style: f.style,
      unicodeRange: f.unicodeRange,
      display: "swap",
    });
    document.fonts.add(face);
    face.load().catch((e) => console.warn(`Шрифт ${f.family} ${f.weight} не загрузился`, e));
  }
}
