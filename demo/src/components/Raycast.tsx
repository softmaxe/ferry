import { C, FONT } from "../theme";
import { ferryCommandTitle } from "../copy";

// Raycast's own UI is English-only, so none of this is localized.

const PANEL = { w: 880, x: 960 - 440, y: 190 };
const ROW = 62;
const SEARCH = 84;
const FOOTER = 56;

const FerryIcon = ({ x, y, size = 34 }: { x: number; y: number; size?: number }) => (
  <text x={x} y={y + size * 0.8} fontFamily={FONT.emoji} fontSize={size}>
    ⛴️
  </text>
);

type PanelProps = {
  query: string;
  selected: number;
  /** 0 closed, 1 open. */
  open: number;
  caret: boolean;
};

export const RaycastPanel = ({ query, selected, open, caret }: PanelProps) => {
  if (open <= 0) return null;
  const showFerry = query.length >= 2;
  const rows = showFerry ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4];
  const h = SEARCH + 20 + 36 + rows.length * ROW + 16 + FOOTER;
  const s = 0.94 + open * 0.06;
  const { x, y, w } = PANEL;
  return (
    <g opacity={open} transform={`translate(960 ${y + h / 2}) scale(${s}) translate(-960 ${-(y + h / 2)})`}>
      <rect x={x} y={y + 24} width={w} height={h} rx={22} fill="#000" opacity={0.25} />
      <rect x={x} y={y} width={w} height={h} rx={22} fill={C.rayBg} opacity={0.97} />
      <rect x={x} y={y} width={w} height={h} rx={22} fill="none" stroke="#3A3A40" strokeWidth={2} />
      {/* search */}
      <text x={x + 34} y={y + SEARCH / 2 + 11} fontFamily={FONT.ui} fontSize={30} fontWeight={query ? 500 : 400} fill={query ? C.rayText : C.rayMuted}>
        {query || "Search for apps and commands…"}
      </text>
      {caret && (
        <rect x={x + 34 + query.length * 16.8 + (query ? 3 : 0)} y={y + SEARCH / 2 - 18} width={3} height={36} fill={C.coral} />
      )}
      <rect x={x} y={y + SEARCH} width={w} height={1.5} fill="#34343A" />
      <text x={x + 34} y={y + SEARCH + 42} fontFamily={FONT.ui} fontSize={18} fontWeight={600} fill={C.rayMuted}>
        {showFerry ? "Results" : "Suggestions"}
      </text>
      {rows.map((r, i) => {
        const ry = y + SEARCH + 58 + i * ROW;
        const on = i === selected;
        return (
          <g key={`${showFerry}-${r}`}>
            {on && <rect x={x + 12} y={ry} width={w - 24} height={ROW - 6} rx={12} fill={C.rayRow} />}
            {showFerry ? (
              <>
                <FerryIcon x={x + 30} y={ry + 10} size={32} />
                <text x={x + 82} y={ry + 37} fontFamily={FONT.ui} fontSize={24} fontWeight={500} fill={C.rayText}>
                  {ferryCommandTitle(r)}
                </text>
                <text x={x + 82 + 322} y={ry + 37} fontFamily={FONT.ui} fontSize={20} fill={C.rayMuted}>
                  Ferry
                </text>
                <text x={x + w - 32} y={ry + 37} textAnchor="end" fontFamily={FONT.ui} fontSize={20} fill={C.rayMuted}>
                  Script Command
                </text>
              </>
            ) : (
              <>
                <rect x={x + 30} y={ry + 12} width={34} height={34} rx={9} fill={[C.coral, C.seaLight, "#93CBAE", "#B7A7E3", "#F5C95C"][r]} />
                <rect x={x + 82} y={ry + 21} width={[220, 180, 250, 160, 200][r]} height={16} rx={8} fill="#55555E" />
                <rect x={x + w - 150} y={ry + 21} width={118} height={16} rx={8} fill="#3E3E46" />
              </>
            )}
          </g>
        );
      })}
      {/* footer */}
      <rect x={x} y={y + h - FOOTER} width={w} height={1.5} fill="#34343A" />
      <g fontFamily={FONT.ui} fontSize={19} fill={C.rayMuted}>
        {showFerry && <FerryIcon x={x + 28} y={y + h - FOOTER + 13} size={26} />}
        <text x={x + w - 250} y={y + h - FOOTER / 2 + 7} fill={C.rayText} fontWeight={500}>
          {showFerry ? "Run Script" : "Open Command"}
        </text>
        <rect x={x + w - 128} y={y + h - FOOTER / 2 - 15} width={32} height={30} rx={7} fill="#3A3A42" />
        <text x={x + w - 112} y={y + h - FOOTER / 2 + 7} textAnchor="middle" fill={C.rayText}>
          ↵
        </text>
        <rect x={x + w - 84} y={y + h - FOOTER / 2 - 14} width={1.5} height={28} fill="#3A3A42" />
        <text x={x + w - 32} y={y + h - FOOTER / 2 + 7} textAnchor="end">
          ⌘K
        </text>
      </g>
    </g>
  );
};

type SettingsProps = {
  open: number;
  /** For each of the five commands: 0 = not recorded, 0..1 = recording pop, 1 = recorded. */
  recorded: number[];
  recording: number;
};

export const hotkeyLabel = (space: number) => ["⌃", "⌥", String(space)];

export const RaycastSettings = ({ open, recorded, recording }: SettingsProps) => {
  if (open <= 0) return null;
  const w = 1280;
  const h = 700;
  const x = 960 - w / 2;
  const y = 170;
  const s = 0.95 + open * 0.05;
  const cols = { name: x + 70, type: x + 620, hotkey: x + 900 };
  return (
    <g opacity={open} transform={`translate(960 ${y + h / 2}) scale(${s}) translate(-960 ${-(y + h / 2)})`}>
      <rect x={x} y={y + 26} width={w} height={h} rx={24} fill="#000" opacity={0.22} />
      <rect x={x} y={y} width={w} height={h} rx={24} fill={C.rayBg} />
      <rect x={x} y={y} width={w} height={h} rx={24} fill="none" stroke="#3A3A40" strokeWidth={2} />
      {[C.macRed, C.macYellow, C.macGreen].map((color, i) => (
        <circle key={i} cx={x + 32 + i * 28} cy={y + 30} r={9} fill={color} />
      ))}
      {/* toolbar tabs */}
      {["General", "Extensions", "Advanced"].map((tab, i) => {
        const tx = 960 + (i - 1) * 170;
        const on = tab === "Extensions";
        return (
          <g key={tab}>
            {on && <rect x={tx - 70} y={y + 16} width={140} height={78} rx={14} fill={C.rayRow} />}
            <rect x={tx - 14} y={y + 26} width={28} height={28} rx={8} fill={on ? C.coral : "#55555E"} />
            <text x={tx} y={y + 80} textAnchor="middle" fontFamily={FONT.ui} fontSize={17} fontWeight={600} fill={on ? C.rayText : C.rayMuted}>
              {tab}
            </text>
          </g>
        );
      })}
      <rect x={x} y={y + 110} width={w} height={1.5} fill="#34343A" />
      {/* table header */}
      <g fontFamily={FONT.ui} fontSize={17} fontWeight={600} fill={C.rayMuted}>
        <text x={cols.name} y={y + 150}>Name</text>
        <text x={cols.type} y={y + 150}>Type</text>
        <text x={cols.hotkey} y={y + 150}>Hotkey</text>
      </g>
      <rect x={x + 40} y={y + 168} width={w - 80} height={1.5} fill="#2E2E34" />
      {/* Ferry group row */}
      <g>
        <text x={cols.name - 30} y={y + 212} fontFamily={FONT.ui} fontSize={18} fill={C.rayMuted}>
          ▾
        </text>
        <FerryIcon x={cols.name} y={y + 186} size={30} />
        <text x={cols.name + 48} y={y + 212} fontFamily={FONT.ui} fontSize={22} fontWeight={600} fill={C.rayText}>
          Ferry
        </text>
        <text x={cols.type} y={y + 212} fontFamily={FONT.ui} fontSize={20} fill={C.rayMuted}>
          Script Directory
        </text>
      </g>
      {[1, 2, 3, 4, 5].map((space, i) => {
        const ry = y + 240 + i * 82;
        const done = recorded[i] ?? 0;
        const active = recording === i;
        return (
          <g key={space}>
            {active && <rect x={x + 30} y={ry - 6} width={w - 60} height={72} rx={12} fill={C.rayRow} />}
            <FerryIcon x={cols.name + 30} y={ry + 12} size={28} />
            <text x={cols.name + 76} y={ry + 38} fontFamily={FONT.ui} fontSize={22} fontWeight={500} fill={C.rayText}>
              {ferryCommandTitle(space)}
            </text>
            <text x={cols.type} y={ry + 38} fontFamily={FONT.ui} fontSize={20} fill={C.rayMuted}>
              Script Command
            </text>
            <rect
              x={cols.hotkey - 8}
              y={ry + 6}
              width={250}
              height={50}
              rx={12}
              fill="#26262B"
              stroke={active && done < 1 ? C.coral : "#3A3A42"}
              strokeWidth={active && done < 1 ? 3 : 1.5}
            />
            {done <= 0 ? (
              <text x={cols.hotkey + 117} y={ry + 38} textAnchor="middle" fontFamily={FONT.ui} fontSize={19} fill={active ? C.rayText : "#6D6D76"}>
                {active ? "Press keys…" : "Record Hotkey"}
              </text>
            ) : (
              hotkeyLabel(space).map((k, j) => {
                const p = Math.min(1, done * 3 - j * 0.6);
                if (p <= 0) return null;
                const kx = cols.hotkey + 34 + j * 56;
                return (
                  <g key={j} transform={`translate(${kx} ${ry + 31}) scale(${0.6 + 0.4 * Math.min(1.15, p)}) translate(${-kx} ${-(ry + 31)})`} opacity={Math.min(1, p * 2)}>
                    <rect x={kx - 22} y={ry + 12} width={44} height={38} rx={9} fill="#44444E" />
                    <text x={kx} y={ry + 40} textAnchor="middle" fontFamily={FONT.ui} fontSize={22} fontWeight={600} fill={C.rayText}>
                      {k}
                    </text>
                  </g>
                );
              })
            )}
          </g>
        );
      })}
    </g>
  );
};
