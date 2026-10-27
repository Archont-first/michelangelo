#!/usr/bin/env python3
"""Сборка страниц сайта из src/pages/*.html: общая шапка (вкладки как у платформы), <head> и подвал — в одном месте.

    python3 scripts/build-pages.py

src/pages/<имя>.html → <имя>/index.html (index → index.html в корне). Первая строка страницы — служебная:
    <!-- page: id="<вкладка>" title="<заголовок>" desc="<описание>" -->
затем, если нужно, свои теги для <head> между <!-- head --> и <!-- /head -->.
id — какая вкладка активна: montage | library | docs | examples | home (на главной ни одна).
Иконки вкладок — Phosphor (MIT), те же, что в меню платформы (web/app/site-nav.tsx); SVG — src/partials/icons.json.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
ICONS = json.loads((SITE / "src/partials/icons.json").read_text())

# как ITEMS в web/app/site-nav.tsx платформы
TABS = [
    ("montage", "/montage/", "Монтаж", "Монтаж", "FilmSlate"),
    ("library", "/library/", "Библиотека", "Библиотека", "Sparkle"),
    ("docs", "/docs/", "Документы → видео", "Документы", "FileText"),
    ("examples", "/examples/", "Примеры", "Примеры", "PlayCircle"),
]

CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
       "media-src 'self' blob: data:; font-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; "
       "base-uri 'self'; form-action 'none'")


def icon(name: str, active: bool) -> str:
    return ICONS[f"{name}:{'fill' if active else 'regular'}"]


def nav(active: str) -> str:
    def links(cls: str, short: bool) -> str:
        out = []
        for tid, href, label, sh, ic in TABS:
            on = tid == active
            cur = ' aria-current="page"' if on else ""
            out.append(f'<a class="{cls}" href="{href}" data-active="{str(on).lower()}"{cur}>{icon(ic, on)}<span>{sh if short else label}</span></a>')
        return "\n        ".join(out)

    return f"""<header class="topnav" data-site-nav>
    <div class="topnav__row">
      <a class="logo logo--text" href="/" aria-label="michelangelo — на главную">michelangelo</a>
      <nav class="topnav__links" aria-label="Разделы">
        {links("topnav__link", False)}
      </nav>
    </div>
  </header>
  <nav class="tabbar" aria-label="Разделы" data-site-nav>
    {links("tabbar__tab", True)}
  </nav>"""


def head(title: str, desc: str, extra: str, path: str) -> str:
    t, d = html.escape(title), html.escape(desc)
    return f"""<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta http-equiv="Content-Security-Policy" content="{CSP}">
  <meta name="referrer" content="no-referrer">
  <title>{t}</title>
  <meta name="description" content="{d}">
  <meta name="theme-color" content="#F4EDE3">
  <meta name="color-scheme" content="light">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{t}">
  <meta property="og:description" content="{d}">
  <meta property="og:url" content="https://michelangelo.lol{path}">
  <meta property="og:image" content="https://michelangelo.lol/assets/og.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://michelangelo.lol{path}">
  <link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/young-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/style.css">
  <link rel="stylesheet" href="/assets/site.css">{extra}"""


FOOT = """<footer class="foot">
    <div class="wrap foot__row">
      <a class="logo logo--text logo--foot" href="/">michelangelo</a>
      <span>© 2026 · без трекеров и cookies · файлы никуда не отправляются</span>
      <a href="/licenses/">Лицензии</a>
    </div>
  </footer>"""


def build(src: Path) -> Path:
    text = src.read_text()
    m = re.match(r"<!-- page: (.*?) -->\n", text)
    if not m:
        raise SystemExit(f"{src}: нет служебной строки <!-- page: … -->")
    meta = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
    body = text[m.end():]
    # свои теги в <head> (скрипты, стили страницы) — между <!-- head --> и <!-- /head --> в начале страницы
    h = re.match(r"<!-- head -->\n(.*?)<!-- /head -->\n", body, re.S)
    extra = "".join(f"\n  {line.strip()}" for line in h.group(1).splitlines() if line.strip()) if h else ""
    body = body[h.end():] if h else body
    name = src.stem
    path = "/" if name == "index" else f"/{name}/"
    page = f"""<!doctype html>
<html lang="ru">
<head>
  {head(meta["title"], meta["desc"], extra, path)}
</head>
<body class="page-{name}">
  <a class="skip" href="#main">К содержанию</a>
  {nav(meta["id"])}
{body.rstrip()}
  {FOOT}
</body>
</html>
"""
    out = SITE / "index.html" if name == "index" else SITE / name / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(page)
    return out


if __name__ == "__main__":
    for p in sorted((SITE / "src/pages").glob("*.html")):
        print(build(p).relative_to(SITE))
