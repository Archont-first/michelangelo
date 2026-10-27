// Библиотека анимаций для статического сайта. Повторяет страницу /library платформы (web/app/library/library.tsx):
// та же композиция MotionLab и те же данные (web/motion/library.generated.json) — сборка берёт их из репозитория
// платформы (scripts/build-library.mjs). Отличия: нет своих анимаций пользователя (/api/motion — это сервер),
// нет ссылок Next.js, копирование работает и без Clipboard API.

import { Player, type PlayerRef, Thumbnail } from "@remotion/player";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { useLive } from "@/lib/live-pool";
import { sceneEnterLength } from "@/lib/motion/eval";
import { BUILTIN, CATEGORY_TITLES, isTestEntry, searchEntries } from "@/lib/motion/library";
import { CATEGORIES, type MotionEntry, parseScene } from "@/lib/motion/schema";
import { MotionLab } from "@/remotion/MotionLab";
import s from "@/app/library/library.module.css";

const COLOR_RE = /^#[0-9a-f]{6}$/i;
const ALL = BUILTIN.filter((e) => !isTestEntry(e));

function Library() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<MotionEntry | null>(null);

  const shown = useMemo(() => searchEntries(ALL, query, cat), [query, cat]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of ALL) c[e.category] = (c[e.category] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div className={s.page}>
      <header className={s.head}>
        <div>
          <h1 className={s.h1}>Библиотека анимаций</h1>
          <p className={s.lead}>
            {ALL.length} анимаций. Скопируй код и напиши в чате монтажёра: «добавь <code>#код</code> на слово …» или «сделай как <code>#код</code>, но красное».
          </p>
        </div>
      </header>
      {/* lib-tools: на сайте шапка липкая — поиск прилипает под ней (assets/site.css) */}
      <div className={`${s.tools} lib-tools`}>
        <input
          className={s.search}
          type="search"
          aria-label="Поиск анимаций"
          placeholder="Поиск: «появление цифры», «как в кино», #like_heart"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={s.cats}>
          <button className={cat === null ? s.catOn : s.cat} onClick={() => setCat(null)}>
            Все <span>{ALL.length}</span>
          </button>
          {CATEGORIES.filter((c) => counts[c]).map((c) => (
            <button key={c} className={cat === c ? s.catOn : s.cat} onClick={() => setCat(cat === c ? null : c)}>
              {CATEGORY_TITLES[c]} <span>{counts[c]}</span>
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className={s.empty}>Ничего не нашлось. В полной версии можно описать анимацию в чате — ИИ соберёт новую.</p>
      ) : (
        <div className={s.grid}>
          {shown.map((e) => (
            <Card key={`${e.source}-${e.slug}`} entry={e} onOpen={() => setOpen(e)} />
          ))}
        </div>
      )}
      {open && <Detail entry={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function useVisible<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

/** Кадр «после появления»: его видно на статичном превью и пока плеер не играет (в начале анимации обычно пусто). */
function heroFrame(entry: MotionEntry, total: number): number {
  const r = parseScene(entry.scene);
  return Math.min(total - 1, Math.max(0, Math.round((r.ok ? sceneEnterLength(r.scene) : 0) + 6)));
}

const PREVIEW_STYLE = { width: "100%", aspectRatio: "9 / 16", display: "block" } as const;

/** Статичное превью — один кадр без проигрывания (дёшево: в сетке их десятки). */
function Still({ entry }: { entry: MotionEntry }) {
  const inputProps = useMemo(() => ({ scene: entry.scene, params: null, format: "9:16" as const, background: null }), [entry.scene]);
  const total = Math.max(1, entry.scene.duration);
  return (
    <Thumbnail
      component={MotionLab}
      inputProps={inputProps}
      frameToDisplay={heroFrame(entry, total)}
      durationInFrames={total}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1920}
      style={PREVIEW_STYLE}
    />
  );
}

function Preview({ entry, params, frames, controls = false }: { entry: MotionEntry; params?: Record<string, string>; frames?: number; controls?: boolean }) {
  const inputProps = useMemo(() => ({ scene: entry.scene, params: params ?? null, format: "9:16" as const, background: null }), [entry.scene, params]);
  const total = Math.max(1, frames ?? entry.scene.duration);
  const hero = useMemo(() => heroFrame(entry, total), [entry, total]);
  const ref = useRef<PlayerRef>(null);
  useEffect(() => {
    ref.current?.play();
  }, []);
  return (
    <Player
      ref={ref}
      initialFrame={hero}
      component={MotionLab}
      inputProps={inputProps}
      durationInFrames={total}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1920}
      style={PREVIEW_STYLE}
      autoPlay
      loop
      controls={controls}
      clickToPlay={controls}
      acknowledgeRemotionLicense
    />
  );
}

/** Копирование: Clipboard API (https и localhost), иначе — через скрытое поле. */
function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  ta.remove();
  return ok ? Promise.resolve() : Promise.reject(new Error("copy"));
}

function CopyButton({ text, label = "Скопировать код" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={s.copy}
      data-copy={text}
      onClick={(ev) => {
        ev.stopPropagation();
        copyText(text).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1400);
          },
          () => {},
        );
      }}
    >
      {done ? "Скопировано" : label}
    </button>
  );
}

function Card({ entry: e, onOpen }: { entry: MotionEntry; onOpen: () => void }) {
  const [ref, visible] = useVisible<HTMLDivElement>();
  // статичный кадр; анимация — при наведении мыши или по нажатию на превью (не больше двух живых сразу)
  const [live, setLive] = useLive(`card:${e.source}:${e.slug}`);
  useEffect(() => {
    if (!visible) setLive(false);
  }, [visible, setLive]);
  return (
    <article className={s.card} onClick={onOpen} data-slug={e.slug}>
      <div
        ref={ref}
        className={s.thumb}
        data-live={live}
        onPointerEnter={(ev) => ev.pointerType === "mouse" && setLive(true)}
        onPointerLeave={(ev) => ev.pointerType === "mouse" && setLive(false)}
        onClick={(ev) => {
          // на телефоне нажатие на превью включает и выключает анимацию; карточку открывает нажатие на текст
          if (matchMedia("(hover: none)").matches) {
            ev.stopPropagation();
            setLive(!live);
          }
        }}
        data-testid="library-thumb"
      >
        {!visible ? (
          <div className={s.ph} style={{ background: e.scene.background ?? "#202020" }} />
        ) : live ? (
          <Preview entry={e} />
        ) : (
          <>
            <Still entry={e} />
            <span className={s.playHint} aria-hidden>
              ▶
            </span>
          </>
        )}
      </div>
      <div className={s.body}>
        <div className={s.row}>
          <span className={s.slug}>#{e.slug}</span>
        </div>
        <h3 className={s.title}>{e.title}</h3>
        <p className={s.desc}>{e.description}</p>
        <CopyButton text={`#${e.slug}`} />
      </div>
    </article>
  );
}

function Detail({ entry: e, onClose }: { entry: MotionEntry; onClose: () => void }) {
  const [params, setParams] = useState<Record<string, string>>({ ...e.scene.params });
  const [frames, setFrames] = useState(e.scene.duration);
  const [json, setJson] = useState(false);
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // под окном страница не прокручивается
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
    };
  }, [onClose]);
  const keys = Object.keys(e.scene.params);
  // крупный плеер в окне тоже живой: занимает место в пуле (одна карточка в сетке остановится)
  const [, setDetailLive] = useLive("detail");
  useEffect(() => {
    setDetailLive(true);
    return () => setDetailLive(false);
  }, [setDetailLive]);
  const phrase = `добавь #${e.slug} на слово `;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} role="dialog" aria-modal="true" aria-label={e.title} onClick={(ev) => ev.stopPropagation()}>
        <div className={s.big}>
          <Preview key={frames} entry={e} params={params} frames={frames} controls />
        </div>
        <div className={s.side}>
          <div className={s.row}>
            <span className={s.slug}>#{e.slug}</span>
            <span className={s.catTag}>{CATEGORY_TITLES[e.category]}</span>
            <button className={s.close} onClick={onClose} aria-label="Закрыть">
              ✕
            </button>
          </div>
          <h2 className={s.h2}>{e.title}</h2>
          <p className={s.full}>{e.description}</p>
          {e.hints.length > 0 && (
            <div className={s.hints}>
              {e.hints.map((h) => (
                <span key={h}>«{h}»</span>
              ))}
            </div>
          )}
          <div className={s.params}>
            {keys.map((k) =>
              COLOR_RE.test(e.scene.params[k]) ? (
                <label key={k}>
                  <span>{k === "accent" ? "Цвет" : k}</span>
                  <input type="color" value={COLOR_RE.test(params[k] ?? "") ? params[k] : e.scene.params[k]} onChange={(ev) => setParams({ ...params, [k]: ev.target.value })} />
                </label>
              ) : (
                <label key={k}>
                  <span>{k === "text" ? "Текст" : k === "sub" ? "Подпись" : k}</span>
                  <input value={params[k] ?? ""} onChange={(ev) => setParams({ ...params, [k]: ev.target.value })} />
                </label>
              ),
            )}
            <label>
              <span>Длительность: {(frames / 30).toFixed(1).replace(".", ",")} с</span>
              <input type="range" min={15} max={300} value={frames} onChange={(ev) => setFrames(Number(ev.target.value))} />
            </label>
          </div>
          <div className={s.actions}>
            <CopyButton text={`#${e.slug}`} />
            <CopyButton text={phrase} label="Фраза для чата" />
            <button className={s.copy} onClick={() => setJson(!json)}>
              {json ? "Скрыть JSON" : "JSON сцены"}
            </button>
          </div>
          {json && <pre className={s.json}>{JSON.stringify(e.scene, null, 1)}</pre>}
          {e.credit && (
            <p className={s.credit}>
              По мотивам «{e.credit.original}» — <a href={e.credit.url} rel="noopener noreferrer">{e.credit.author}</a>, {e.credit.license}. Перенесено в DSL.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById("library");
if (root) createRoot(root).render(<Library />);
