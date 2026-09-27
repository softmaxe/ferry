# LXGW WenKai subset

`LXGWWenKai-Regular.subset.woff2`, its charset manifest, and `OFL.txt` were copied from `softmaxe/animate-test` at commit `965b4fe`. The upstream font is [LXGW WenKai](https://github.com/lxgw/LxgwWenKai).

The subset contains ASCII, common CJK punctuation, and GB2312 Han characters. Captions, titles, and annotations use this bundled web font in both languages. UI text uses the system UI font. Option and Return key symbols are outside this subset and must use UI text or vector paths.

Run `uv run scripts/subset_font.py /path/to/LXGWWenKai-Regular.ttf` from `demo` to rebuild the subset from a local upstream TTF. The script never downloads fonts. `npm test` reads the actual font's cmap and advance widths to check coverage and caption layout.
