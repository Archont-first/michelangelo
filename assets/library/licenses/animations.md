# Анимации: источники, лицензии, авторство

Библиотека `web/motion/library/*.json` — сцены DSL (JSON). **Код источников не копировался:** замысел шаблона
(композиция, тайминги, easing, пружины) перенесён в данные нашей схемы и адаптирован под 9:16 и шрифты OFL с кириллицей
(Montserrat, Inter, Onest, Manrope, Cormorant Garamond, Caveat). У каждой перенесённой записи поле `credit`
(автор, репозиторий, лицензия, имя шаблона) — его показывает страница `/library`. Иконки — Phosphor Icons (MIT).
React Bits (Commons Clause), GSAP и LottieFiles **не использовались**.

## 1. reactvideoeditor/remotion-templates — 64 записей

- Репозиторий: https://github.com/reactvideoeditor/remotion-templates (проверено на коммите `6209b72`).
- **Лицензия: MIT, но заявлена только в README** («All templates in this repository are available under the MIT License…
  attribution is appreciated»); отдельного файла LICENSE в репозитории нет, GitHub лицензию не определяет. В шапке каждого
  шаблона: «Free Remotion Template Component… free to use in your projects! Credit appreciated… Created by the team at
  https://www.reactvideoeditor.com». Ниже — текст MIT с правообладателем по этим заявлениям.
- Не перенесены (18): эффекты над самим видео/фото, а не наложения (нужна своя картинка или кадр ролика) —
  camera-shake, gallery-grid, image-carousel, image-comparison-slider, image-zoom-reveal, ken-burns, liquid-wave, masonry-gallery, morph-transition, noise-grain, parallax-pan, photo-stack, picture-in-picture, polaroid-frame, rotating-carousel, split-screen, title-split, zoom-pulse.

```
MIT License

Copyright (c) React Video Editor (reactvideoeditor.com) and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 2. Remocn/remocn — 34 записей

- Репозиторий: https://github.com/Remocn/remocn (коммит `fd2d301`), файл LICENSE:

```
MIT License

Copyright (c) 2026 Remocn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 3. iart-ai — правила моушна (director/TASTE.md: [motion] и «Моушн», промпт create_animation)

Правила пересказаны своими словами из навыков kinetic-typography-skills (коммит `fccc94b`), data-animation-skills,
tiktok-video-skills, lower-thirds-skills (указатель — https://github.com/iart-ai/motion-skills). Все — MIT:

```
MIT License

Copyright (c) 2026 iart.ai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 4. Phosphor Icons — иконки слоёв `icon` (`web/motion/icons.ts`)

@phosphor-icons/react, MIT, © Phosphor Icons (https://github.com/phosphor-icons/react).

## Что откуда (NOTICE)

### https://github.com/reactvideoeditor/remotion-templates
- `#animated_list` ← animated-list
- `#animated_text` ← animated-text
- `#area_chart` ← area-chart
- `#bar_chart` ← chart-animation
- `#blinds` ← blinds-transition
- `#bokeh` ← bokeh-circles
- `#bounce_text` ← bounce-text
- `#bubble_pop` ← bubble-pop-text
- `#card_flip` ← card-flip
- `#chapter_title` ← chapter-title
- `#cinematic_intro` ← cinematic-title-intro
- `#clock_wipe` ← clock-wipe
- `#compare_bars` ← comparison-chart
- `#countdown_321` ← countdown-intro
- `#countdown_timer` ← countdown-timer
- `#credits_roll` ← credits-roll
- `#dip_white` ← cross-dissolve
- `#donut_chart` ← donut-chart
- `#end_card` ← end-card
- `#fade_black` ← fade-through-black
- `#film_burn` ← film-burn
- `#floating_text` ← floating-bubble-text
- `#geo_pattern` ← geometric-patterns
- `#glitch_text` ← glitch-text
- `#gradient_shift` ← gradient-shift
- `#grid_pulse` ← grid-pulse
- `#iris` ← iris-transition
- `#letterbox` ← letterbox-reveal
- `#line_chart` ← line-chart
- `#logo_blur` ← logo-blur-reveal
- `#logo_drop` ← logo-bounce-drop
- `#logo_fade` ← logo-fade-reveal
- `#logo_glitch` ← logo-glitch-reveal
- `#logo_ring_draw` ← logo-stroke-draw
- `#logo_scale_rotate` ← logo-scale-rotate
- `#logo_spin` ← logo-spin-reveal
- `#logo_split` ← logo-split-reveal
- `#logo_typewriter` ← logo-typewriter
- `#lower_bar` ← lower-third
- `#matrix_rain` ← matrix-rain
- `#notifications` ← notification-pop
- `#particle_burst` ← particle-explosion
- `#pie_chart` ← pie-chart
- `#pixel_wipe` ← pixel-transition
- `#popping_words` ← popping-text
- `#progress_bars` ← progress-bars
- `#progress_ring` ← circular-progress
- `#progress_steps` ← progress-steps
- `#pulse_text` ← pulsing-text
- `#push_cover` ← push-transition
- `#quote_card` ← quote-card
- `#slide_text` ← slide-text
- `#slide_wipe` ← slide-wipe
- `#sound_wave` ← sound-wave
- `#spotlight` ← spotlight-reveal
- `#starfield` ← starfield
- `#stat_counter` ← stat-counter
- `#subscribe_bell` ← subscribe-reminder
- `#subscribe_pill` ← subscribe-reminder
- `#text_highlight` ← text-highlight
- `#typewriter_cursor` ← typewriter-subtitle
- `#vignette_pulse` ← vignette-pulse
- `#whip_streaks` ← whip-pan
- `#zoom_through` ← zoom-through

### https://github.com/Remocn/remocn
- `#big_number` ← rolling-number
- `#blur_out_up` ← blur-out-up
- `#bottom_up_letters` ← bottom-up-letters
- `#check_list` ← check-list
- `#confetti` ← confetti
- `#focus_blur_resolve` ← focus-blur-resolve
- `#hand_count` ← hand-count
- `#ink_arrow` ← ink-arrow
- `#ink_underline` ← ink-underline
- `#inline_highlight` ← inline-highlight
- `#line_by_line_slide` ← line-by-line-slide
- `#marker_highlight` ← marker-highlight
- `#mask_reveal_up` ← mask-reveal-up
- `#micro_scale_fade` ← micro-scale-fade
- `#odometer` ← number-wheel
- `#per_character_rise` ← per-character-rise
- `#per_word_crossfade` ← per-word-crossfade
- `#period_drop` ← period-drop
- `#rgb_glitch` ← rgb-glitch-text
- `#scribble_circle` ← scribble-circle
- `#soft_blur_in` ← soft-blur-in
- `#speed_lines` ← speed-lines
- `#spring_scale_in` ← spring-scale-in
- `#squeeze_in` ← squeeze-in
- `#staggered_fade_up` ← staggered-fade-up
- `#stamp` ← caption-stamp
- `#top_down_letters` ← top-down-letters
- `#tracking_in` ← tracking-in
- `#trim_burst` ← trim-burst
- `#tv_power_off` ← tv-power-off
- `#value_swap` ← value-swap
- `#word_drop` ← caption-drop
- `#word_pop_big` ← caption-word-pop
- `#word_push` ← word-push
