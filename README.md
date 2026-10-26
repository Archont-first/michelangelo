# michelangelo.lol — лендинг

Статический сайт для GitHub Pages: один `index.html`, стили и скрипт в `assets/`. Без сборки, трекеров, cookies
и внешних запросов (шрифты и видео лежат здесь же; CSP в `<head>` разрешает только свой домен).

## Что где

| файл | что |
|---|---|
| `index.html` | вся страница; **ссылка для тестеров — здесь** (см. ниже) |
| `assets/style.css` | цвета и шрифты по `web/brand.json` платформы: молочный фон, красный `#A4302A` (логотип и акцент), почти чёрный текст |
| `assets/app.js` | кнопки «Стать тестером» и плееры до/после |
| `assets/brand/` | вордмарк MICHELANGELO (Young Serif, `-sm` — разрядка для шапки, `-lg` — крупно), монограмма «M» и `favicon.svg` — из `docs/brand/` платформы (`scripts/brand_logos.py`) |
| `assets/fonts/` | Lora 700 (заголовки, прямой и курсив), Inter (текст), JetBrains Mono (подписи), Young Serif (из него контуры логотипа) — woff2 + `licenses/` — тексты SIL OFL 1.1 |
| `assets/media/` | до/после: `before.mp4` 1,7 МБ, `after.mp4` 2,0 МБ (H.264 540×960, faststart) + постеры |
| `assets/og.jpg`, `assets/apple-touch-icon.png` | превью ссылки в мессенджерах, иконка на iPhone |
| `CNAME` | домен `michelangelo.lol` |
| `.nojekyll` | GitHub Pages отдаёт файлы как есть |

## 1. Впишите свой Telegram

Откройте `index.html`, найдите строку (поиск по `YOUR_TELEGRAM`):

```html
<a class="btn btn--light" id="tester-link" href="https://t.me/YOUR_TELEGRAM" rel="noopener">Стать тестером</a>
```

Замените `YOUR_TELEGRAM` на свой ник (например `https://t.me/ivan_ivanov`). Это единственное место — остальные
кнопки «Стать тестером» берут ссылку отсюда.

## 2. Посмотрите локально

```bash
cd ~/development/michelangelo-landing
python3 -m http.server 8000
```

Откройте http://localhost:8000. Остановить — Ctrl+C.

## 3. Создайте репозиторий и опубликуйте

1. На github.com → **New repository** → имя, например `michelangelo-landing`, **Public**, без README/лицензии
   (они уже есть) → **Create repository**.
2. В терминале (адрес возьмите со страницы нового репозитория):
   ```bash
   cd ~/development/michelangelo-landing
   git add -A && git commit -m "Ссылка для тестеров"     # если меняли index.html
   git remote add origin https://github.com/<ваш-логин>/michelangelo-landing.git
   git push -u origin main
   ```
3. В репозитории: **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, папка `/ (root)` → **Save**.
4. Там же, **Custom domain**: `michelangelo.lol` → **Save** (файл `CNAME` уже есть, поле может заполниться само).

## 4. Настройте DNS у регистратора michelangelo.lol

Удалите старые A/AAAA/CNAME для `@` и `www`, если есть, и добавьте:

| тип | имя | значение |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `<ваш-логин>.github.io` |

DNS обновляется от нескольких минут до суток. Проверить: `dig michelangelo.lol +short` — должны прийти четыре
адреса `185.199.x.153`.

Рекомендуется: **Settings → Pages → Verify domain** (защита от захвата домена чужим репозиторием) — GitHub
попросит добавить TXT-запись.

## 5. Включите HTTPS

Когда в **Settings → Pages** появится «DNS check successful», отметьте **Enforce HTTPS** (сертификат
выпускается автоматически, до часа).

## Проверено (26.10.2026)

- WebKit (Safari), iPhone 13, ширина 390 px: нет горизонтальной прокрутки, все 9 шрифтов грузятся, видео по
  нажатию играет со звуком; с `prefers-reduced-motion` анимации нет.
- WebKit, 1280 px: то же.
- Внешних запросов — 0, ответов 4xx/5xx — 0. Страница без видео ≈ 300 КБ; видео грузятся только по нажатию.

## Видео

Пример «Говорящая голова» из `docs/pitch/exports/` платформы: исходник — стоковый ролик Pexels (лицензия Pexels
разрешает такое использование, указание автора не требуется; на странице есть подпись «стоковый ролик с Pexels»).
Заменить: положите свои `before.mp4` / `after.mp4` (+ `.jpg` кадры) в `assets/media/`, сжать можно так:

```bash
ffmpeg -i in.mp4 -vf scale=540:960 -c:v libx264 -crf 27 -maxrate 1400k -bufsize 2800k \
  -c:a aac -b:a 96k -movflags +faststart out.mp4
```

## Hero «Сотворение Адама» (тестовая страница `hero-test.html`)

- `assets/art/hands.jpg` — фрагмент фрески Микеланджело «Сотворение Адама» (1508–1512), общественное достояние;
  источник — Wikimedia Commons, «Creation of Adam (Michelangelo) Detail.jpg» (PD-Art). Исходники
  `creation-of-adam.jpg` / `creation-full.jpg` в git не кладутся (.gitignore).
- `assets/hero.js` — свой код на Canvas2D, без библиотек: рука Бога — фреска, рука Адама написана строкой
  «i saw the angel in the marble and carved until i set him free» (фраза, которую приписывают Микеланджело).
  Пасхалки в предплечье проявляются под курсором (контакт основателя и фраза Стива Джобса из интервью 1994 года); ещё одна — в консоли браузера.
