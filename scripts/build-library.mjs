// Сборка «Библиотеки» (library/) из репозитория платформы — без сервера, один JS и один CSS.
//
//   node scripts/build-library.mjs [путь к платформе, по умолчанию ~/development/vibe-montage]
//
// Код и данные берутся из платформы только для чтения: web/remotion/MotionLab (та же композиция, что рендерит
// экспорт), web/lib/motion/*, web/motion/library.generated.json, стили web/app/library/library.module.css.
// Шрифты сцен копируются в assets/fonts/motion/, лицензии — в assets/fonts/licenses/.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PLATFORM = resolve(process.argv[2] ?? join(homedir(), "development/vibe-montage"));
const WEB = join(PLATFORM, "web");
if (!existsSync(join(WEB, "remotion/MotionLab.tsx"))) throw new Error(`Нет платформы в ${PLATFORM}`);

const LIB = JSON.parse(readFileSync(join(WEB, "motion/library.generated.json"), "utf8"));
const require = createRequire(join(WEB, "package.json"));
const esbuild = require("esbuild");

// @/… → web/… платформы (как paths в её tsconfig); @/lib/fonts — своя версия (шрифты с этого сайта)
const alias = {
  name: "platform-alias",
  setup(b) {
    b.onResolve({ filter: /^@\// }, async (a) => {
      if (a.path === "@/lib/fonts") return { path: join(SITE, "src/library/fonts.ts") };
      if (a.path === "@/motion/icons") return { path: "icons", namespace: "used-icons" };
      const r = await b.resolve("./" + a.path.slice(2), { resolveDir: WEB, kind: a.kind });
      return r;
    });
    // из 107 иконок Phosphor (web/motion/icons.ts) сцены библиотеки используют ~20 — в сборку только они
    b.onLoad({ filter: /.*/, namespace: "used-icons" }, () => {
      const names = [...new Set(JSON.stringify(LIB).match(/"type":"icon","name":"\w+"/g).map((m) => m.split('"').at(-2)))].sort();
      return {
        contents: `import { ${names.join(", ")} } from "@phosphor-icons/react";\nexport const ICONS = { ${names.join(", ")} };`,
        resolveDir: WEB,
        loader: "js",
      };
    });
  },
};

const res = await esbuild.build({
  entryPoints: { app: join(SITE, "src/library/main.tsx") },
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2020", "safari15"],
  jsx: "automatic",
  outdir: join(SITE, "assets/library"),
  nodePaths: [join(WEB, "node_modules")],
  loader: { ".module.css": "local-css", ".json": "json" },
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "linked",
  plugins: [alias],
  metafile: true,
  logLevel: "warning",
});
if (process.env.META) writeFileSync(process.env.META, JSON.stringify(res.metafile));
for (const [f, o] of Object.entries(res.metafile.outputs)) console.log(f.replace(SITE + "/", ""), Math.round(o.bytes / 1024), "КБ");

// шрифты сцен
const fonts = JSON.parse(readFileSync(join(WEB, "lib/fonts.generated.json"), "utf8"));
mkdirSync(join(SITE, "assets/fonts/motion"), { recursive: true });
let bytes = 0;
for (const f of fonts) {
  const src = join(WEB, "public/fonts", f.file);
  copyFileSync(src, join(SITE, "assets/fonts/motion", f.file));
  bytes += statSync(src).size;
}
console.log(`шрифты сцен: ${fonts.length} файлов, ${Math.round(bytes / 1024)} КБ`);

// сколько анимаций и откуда — для README
writeFileSync(join(SITE, "assets/library/stats.txt"), `${LIB.length} анимаций, собрано ${new Date().toISOString().slice(0, 10)} из ${PLATFORM}\n`);

// лицензии всего, что попало в сборку: шрифты сцен (OFL), Remotion (Remotion License), React/zod/Phosphor (MIT),
// авторство анимаций (assets/motion/LICENSES.md платформы: reactvideoeditor/remotion-templates и Remocn — MIT)
const LIC = join(SITE, "assets/library/licenses");
mkdirSync(LIC, { recursive: true });
const NM = join(WEB, "node_modules");
for (const fam of new Set(fonts.map((f) => f.family))) {
  const pkg = fam.toLowerCase().replace(/ /g, "-");
  copyFileSync(join(NM, "@fontsource", pkg, "LICENSE"), join(SITE, "assets/fonts/licenses", `${pkg}.OFL.txt`));
}
const PKGS = { remotion: "LICENSE.md", "@remotion/player": "LICENSE.md", react: "LICENSE", "react-dom": "LICENSE", scheduler: "LICENSE", zod: "LICENSE", "@phosphor-icons/react": "LICENSE" };
for (const [pkg, file] of Object.entries(PKGS)) {
  const v = JSON.parse(readFileSync(join(NM, pkg, "package.json"), "utf8")).version;
  copyFileSync(join(NM, pkg, file), join(LIC, `${pkg.replace("/", "_")}-${v}.${file.endsWith(".md") ? "md" : "txt"}`));
}
copyFileSync(join(PLATFORM, "assets/motion/LICENSES.md"), join(LIC, "animations.md"));
console.log("лицензии:", LIC.replace(SITE + "/", ""));
