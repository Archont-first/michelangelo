#!/usr/bin/env python3
"""assets/anim/*.json → assets/anim/*.js (window.MichelAnimData[имя] = {…}).

CSP сайта — connect-src 'none', fetch() своих JSON не пройдёт, поэтому данные подключаются тегом <script> (script-src 'self').
Исходные .json лежат без правок (Lottie Simple License), .js — их точная копия в обёртке.

    python3 scripts/build-anim.py
"""
import json
from pathlib import Path

D = Path(__file__).resolve().parents[1] / "assets/anim"
for p in sorted(D.glob("*.json")):
    data = json.loads(p.read_text())
    out = D / f"{p.stem}.js"
    body = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
    out.write_text(f"(window.MichelAnimData=window.MichelAnimData||{{}})[{json.dumps(p.stem)}]={body};\n")
    print(out.name)
