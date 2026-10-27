# michelangelo.lol — сайт

Статический сайт для GitHub Pages, повторяет платформу без сервера: вкладки «Монтаж», «Библиотека», «Документы → видео»,
«Примеры», как в меню платформы. Главная с hero «Сотворение Адама» — вход. Без трекеров, cookies и внешних запросов:
CSP в каждой странице разрешает только свой домен (`connect-src 'none'`: файлы из «Монтажа» отправить некуда).

## Что где

| файл | что |
|---|---|
| `src/pages/*.html` | исходники страниц → `scripts/build-pages.py` собирает `index.html`, `montage/`, `library/`, `docs/`, `examples/`, `licenses/` (общие `<head>`, CSP, шапка с вкладками, подвал) |
| `src/library/` | «Библиотека»: React-страница, повторяет `/library` платформы → `scripts/build-library.mjs` собирает `assets/library/app.js` + `app.css` |
| `assets/style.css` | бренд по `web/brand.json` платформы: молочный фон, красный `#A4302A`, логотип michelangelo строчными (Young Serif) |
| `assets/site.css`, `assets/site.js` | меню (сверху; на телефоне — панель снизу), «Монтаж», «Примеры», «Документы → видео» |
| `assets/app.js`, `assets/hero.js` | главная: кубик и hero |
| `assets/media/examples/` | примеры «до/после» (540×960 H.264, faststart) + постеры |
| `assets/media/docs/` | пример «Документы → видео» (720×1280, без звука) |
| `assets/fonts/` | шрифты сайта; `motion/` — шрифты сцен библиотеки (из платформы); `licenses/` — тексты OFL |
| `assets/library/licenses/` | лицензии кода в сборке библиотеки и авторство анимаций |

Telegram для заявок — `https://t.me/foundermd` (в `src/pages/*.html`, поиск по `foundermd`).

## Пересобрать

```bash
cd ~/development/michelangelo-landing
node scripts/build-library.mjs        # библиотека: код и данные — из ~/development/vibe-montage (только чтение)
python3 scripts/build-pages.py        # страницы из src/pages
```

Сборке библиотеки нужен `web/node_modules` платформы (esbuild, React, Remotion берутся оттуда). Платформа не меняется:
`@/lib/fonts` и `@/motion/icons` подменяются при сборке (шрифты — с этого сайта, иконки — только те ~20, что в сценах).
Новые анимации на платформе → перезапустить `build-library.mjs`.

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

## Проверено (27.10.2026)

Chrome 1440 и 390 px, WebKit (Safari) iPhone 13 — Playwright, все шесть страниц:
- ошибок в консоли — 0, внешних запросов — 0, ответов 4xx/5xx — 0, горизонтальной прокрутки нет;
- «Библиотека»: 129 анимаций с превью, поиск («цифры» → 10, `#confetti` → 1), копирование `#slug` в буфер, живое
  превью по наведению/нажатию, карточка с плеером и настройками;
- «Монтаж»: выбор файлов → превью и длительность в браузере → прогресс → «Идёт закрытый тест — оставьте заявку»;
- «Примеры»: до/после, звук; автозапуск без звука (в Playwright WebKit автозапуск запрещён вообще — там по нажатию).

Вес сайта ≈ 10 МБ (видео 7,4 МБ грузятся, только когда видны; библиотека 1,3 МБ JS, ≈ 330 КБ в gzip).

## Примеры: откуда ролики

Настоящий результат платформы (свой экземпляр API, 27.10.2026): набор материалов → одна фраза в чат → экспорт 720p,
руками ничего не правилось. Сжато `ffmpeg -vf scale=540:960 -crf 28 -maxrate 800k -b:a 96k -movflags +faststart`.
«До» — по 3 с от начала каждого исходника.

- Только стоковые клипы **без людей**, Mixkit, у каждого на странице клипа — «Stock Video Free License» (коммерческое
  использование, без указания автора): путешествие — #2213, #51585, #51502, #51445, #44395, #44391; кофейня — #4982,
  #43935, #44001, #10419, #10424, #10420. Клипы с «Restricted License» (#48525, #49231) отброшены.
- Музыка — Mixkit «Driving Ambition» (#32) и «Tech House Vibes» (#130), Mixkit Stock Music Free License.
- Звуки на склейках — наборы платформы «cinema» и «soft» (вжух, удар, поп, щелчок): CC0 и свой синтез
  (`assets/sfx/LICENSES.md` платформы); звук `flash`, помеченный «проверить», в роликах не звучит.
- «Документы → видео» — `python -m worker.docs` на учебном документе платформы (`demo`, данные вымышленные).

Старый пример «Говорящая голова» (человек со стокового ролика) с сайта убран.

## Библиотека: лицензии

Сцены — данные платформы (`web/motion/library.generated.json`); перенесённые по мотивам шаблонов reactvideoeditor и Remocn
(MIT) — с автором в карточке и в `assets/library/licenses/animations.md`. Код в сборке: React, zod, Phosphor — MIT;
Remotion — Remotion License: бесплатно для частных лиц и компаний до 3 сотрудников, иначе нужна Company License
(remotion.pro). Шрифты сцен — OFL. Сводка — страница `/licenses/`.

## Hero «Сотворение Адама» (главная)

- `assets/art/hands.jpg` — фрагмент фрески Микеланджело «Сотворение Адама» (1508–1512), общественное достояние;
  источник — Wikimedia Commons, «Creation of Adam (Michelangelo) Detail.jpg» (PD-Art). Исходники
  `creation-of-adam.jpg` / `creation-full.jpg` в git не кладутся (.gitignore).
- `assets/hero.js` — свой код на Canvas2D, без библиотек: рука Бога — фреска, рука Адама написана строкой
  «i saw the angel in the marble and carved until i set him free» (фраза, которую приписывают Микеланджело).
  Пасхалки в предплечье проявляются под курсором (контакт основателя и фраза Стива Джобса из интервью 1994 года); ещё одна — в консоли браузера.
