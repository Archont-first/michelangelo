# Лицензии анимаций

Три анимации — бесплатные с LottieFiles, **Lottie Simple License**: коммерческое использование разрешено.
Лицензии проверены владельцем проекта 27.10.2026.

| файл | название в файле (`nm`) | источник | лицензия |
|---|---|---|---|
| `cube-light.json` | «2x2 Rubiks (Motion 1)_30f_no pauses_Lottie Render [Final]» | LottieFiles | Lottie Simple License |
| `cube-dark.json` | «Modular Cube (Motion 1)_30f» | LottieFiles | Lottie Simple License |
| `david.json` | «david» | LottieFiles | Lottie Simple License |

**Изменения.** Файлы лежат без правок (копии `references/anim/`). Мы перекрашиваем их в цвета бренда
(`web/brand.json`) при загрузке, в копии данных в браузере — `web/lib/lottie.ts`:

- кубики — линии в красный `#A4302A` (в тёмной теме `#E8928A`), грани в молочный `#F4EDE3` / почти чёрный `#151213`;
- Давид — жёлтые тона в оттенки красного бренда (светлые — светлее, тёмные — темнее), чёрный контур — `#151213`.

Плеер — `lottie-web` (MIT, Airbnb), light-сборка, из npm.
