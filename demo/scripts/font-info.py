"""Read actual bundled font metrics for glyph coverage and caption-width tests."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
font = TTFont(Path(__file__).resolve().parents[1] / "public/fonts/LXGWWenKai-Regular.subset.woff2")
cmap = font.getBestCmap()
print(json.dumps({
    "unitsPerEm": font["head"].unitsPerEm,
    "advances": {str(codepoint): font["hmtx"][glyph][0] for codepoint, glyph in cmap.items()},
}))
