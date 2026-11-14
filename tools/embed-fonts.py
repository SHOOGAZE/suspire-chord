#!/usr/bin/env python3
"""Subsets the open-licence fonts (OFL) to Latin + Cyrillic and writes src/css/00-fonts.css with them inlined (base64 WOFF).
Usage: python3 tools/embed-fonts.py <folder with DMMono-Regular.ttf, PixelifySans-Medium.ttf, JetBrainsMono-Regular.ttf, JetBrainsMono-Bold.ttf>"""
import sys, base64, io
from fontTools import subset
from fontTools.ttLib import TTFont
src = sys.argv[1]
U = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + list(range(0x2010, 0x2028)) + list(range(0x2190, 0x2194)) + list(range(0x25A0, 0x2600)) + list(range(0x2660, 0x2670)) + list(range(0x400, 0x500))
FACES = [("DM Mono", 400, "DMMono-Regular.ttf"), ("Pixelify Sans", 500, "PixelifySans-Medium.ttf"),
         ("JetBrains Mono", 400, "JetBrainsMono-Regular.ttf"), ("JetBrains Mono", 700, "JetBrainsMono-Bold.ttf")]
css = ["/* Embedded fonts (SIL OFL), subset to Latin + Cyrillic; regenerate with tools/embed-fonts.py */\n"]
for fam, wt, fn in FACES:
    opt = subset.Options(); opt.flavor = "woff"; opt.layout_features = ["*"]; opt.notdef_outline = True
    f = TTFont(f"{src}/{fn}"); s = subset.Subsetter(opt); s.populate(unicodes=U); s.subset(f)
    f.flavor = "woff"; b = io.BytesIO(); f.save(b)
    css.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;src:url(data:font/woff;base64,%s) format('woff')}\n" % (fam, wt, base64.b64encode(b.getvalue()).decode()))
open("src/css/00-fonts.css", "w").write("".join(css))
