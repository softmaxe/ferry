import { FULL, cuePop, cueProgress, ease } from "../anim";
import { AppWindow } from "../components/AppWindow";
import { Hop, type HopPlan } from "../components/Hop";
import { Caption, ClockChip, Keycaps } from "../components/Overlays";
import { Shot } from "../components/Shot";
import { SpaceView, type Guest } from "../components/SpaceView";
import { Desktop } from "../components/Desktop";
import { ARRIVAL, SIZE } from "../layouts";
import { C, FONT } from "../theme";
import { FRAMES_PER_EIGHTH, cueFrame, eighths } from "../timeline";
import type { SceneProps } from "./types";

// Early evening, on a call: the terminal is sent to Space 4 with --no-follow while the screen
// stays on the call. Then ferry's own report of that move, and what it doesn't need.

const CLOCK = "17:30";
const COMMAND = "ferry --no-follow --verbose 4";
// Real output from `ferry --verbose` on macOS 26 (window id and timings as measured; Space 4's
// internal id follows the measured ids 4 and 5 for Spaces 1 and 2).
const OUTPUT = ["window 12877 (via accessibility) -> space 4 (id 7):", "moved in 3.4 ms, not followed, total 106.9 ms"];
const HIGHLIGHT = "moved in 3.4 ms";

const CALL = { x: 90, y: 90, ...SIZE.call };
const TERMINAL = { x: 830, y: 430, ...SIZE.terminal };

const terminalLines = (typed: string, output: boolean, caret: boolean) => (
  <g>
    <text x={30} y={100} fill="#7F93B0">$ make</text>
    <text x={30} y={138} fill="#7F93B0">Build complete: build/ferry</text>
    <text x={30} y={190}>
      <tspan fill={C.coral}>$ </tspan>
      <tspan>{typed}</tspan>
      {caret && <tspan fill={C.coral}>▍</tspan>}
    </text>
    {output &&
      OUTPUT.map((line, i) => (
        <text key={i} x={30} y={236 + i * 38} fill="#F5E0A0" fontSize={21}>
          {line}
        </text>
      ))}
  </g>
);

export const P6 = ({ frame: f, text }: SceneProps) => {
  const typeStart = cueFrame("p6.type");
  const typed = COMMAND.slice(0, Math.max(0, Math.min(COMMAND.length, Math.floor(((f - typeStart) / (eighths(5.5))) * COMMAND.length))));
  const entered = f >= cueFrame("p6.enter");

  const call: Guest = { kind: "call", title: text.windows.call, rect: CALL };
  const terminal: Guest = { kind: "terminal", title: text.windows.terminal, rect: TERMINAL, lines: terminalLines(typed, false, !entered) };
  const plan: HopPlan = {
    at: cueFrame("p6.enter"),
    from: 1,
    to: 4,
    follow: false,
    window: terminal,
    landing: { ...ARRIVAL[4], ...SIZE.terminal },
  };
  // Without follow the hop ends once the boat has left and the sea has settled.
  const hopping = f >= plan.at && f < plan.at + eighths(4);

  const ping = cueProgress(f, "p6.inset", 3, ease.out);
  const inset = cuePop(f, "p6.inset", 0, 14);
  const insetScreen = (
    <Desktop space={4} frame={f} app={text.windows.terminal} clock={CLOCK}>
      <AppWindow kind="terminal" {...plan.landing} title={text.windows.terminal} lines={terminalLines(COMMAND, true, false)} frame={f} />
    </Desktop>
  );

  const screen = hopping ? (
    <Hop frame={f} plan={plan} text={text} clock={CLOCK} guestsOf={(s) => (s === 1 ? [call] : [])} />
  ) : (
    <SpaceView space={1} frame={f} text={text} clock={CLOCK} guests={entered ? [call] : [call, terminal]} ping={ping} pingSpace={4} />
  );

  const reveal = cueProgress(f, "p6.reveal", 2, ease.out);
  const enterPress = Math.max(0, Math.sin(((f - plan.at) / FRAMES_PER_EIGHTH) * Math.PI)) * (f >= plan.at ? 1 : 0);
  const enterShow = cuePop(f, "p6.enter", -0.4, 14) * (1 - cueProgress(f, "p6.enter", 1, ease.in, 1));

  return (
    <Shot
      view={FULL}
      overlay={
        <>
          <ClockChip time={CLOCK} show={1 - cueProgress(f, "p6.type", 2, ease.in, 3)} />
          <Keycaps keys={["↵"]} appear={enterShow} press={enterPress} x={1780} y={965} size={84} />
          {inset > 0 && reveal < 1 && (
            <g opacity={1 - reveal} transform={`translate(${1480 + (1 - inset) * 500} 70)`}>
              <rect x={-12} y={-12} width={404} height={239} rx={18} fill={C.navyInk} />
              <svg width={380} height={214} viewBox="0 0 1920 1080">
                {insetScreen}
              </svg>
              <rect x={10} y={180} width={100} height={30} rx={10} fill={C.navyInk} opacity={0.85} />
              <text x={60} y={202} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={18} fill={C.cream}>
                Space 4
              </text>
            </g>
          )}
          <Caption text={text.p6Caption} show={cueProgress(f, "p6.sail", 2, ease.out) * (1 - reveal)} />
          {reveal > 0 && <Reveal frame={f} t={reveal} badges={text.badges} />}
        </>
      }
    >
      {screen}
    </Shot>
  );
};

const Reveal = ({ frame: f, t, badges }: { frame: number; t: number; badges: string[] }) => {
  const line = (i: number) => cueProgress(f, "p6.reveal", 1.5, ease.out, i * 0.7);
  const highlight = cueProgress(f, "p6.reveal", 1.5, ease.out, 2.2);
  return (
    <g>
      <rect width={1920} height={1080} fill={C.navyInk} opacity={0.94 * t} />
      <g fontFamily={FONT.mono} fontSize={44} opacity={t} style={{ fontVariantLigatures: "none" }}>
        <text x={960} y={330} textAnchor="middle" opacity={line(0)} fill={C.cream}>
          <tspan fill={C.coral}>$ </tspan>
          {COMMAND}
        </text>
        <text x={960} y={420} textAnchor="middle" opacity={line(1)} fill="#B9C6DA" fontSize={38}>
          {OUTPUT[0]}
        </text>
        <g opacity={line(2)}>
          {/* JetBrains Mono advances 0.6 em per character, so the highlight can be measured. */}
          <rect
            x={960 - (OUTPUT[1].length * 0.6 * 38) / 2 - 12}
            y={452}
            width={(HIGHLIGHT.length * 0.6 * 38 + 24) * highlight}
            height={52}
            rx={12}
            fill={C.coral}
          />
          <text x={960 - (OUTPUT[1].length * 0.6 * 38) / 2} y={490} fontSize={38} fill="#B9C6DA">
            <tspan fill={highlight > 0.6 ? C.navyInk : "#B9C6DA"} fontWeight={700}>
              {HIGHLIGHT}
            </tspan>
            <tspan>{OUTPUT[1].slice(HIGHLIGHT.length)}</tspan>
          </text>
        </g>
      </g>
      {badges.map((badge, i) => {
        const p = cuePop(f, `p6.badge${i + 1}`, 0, 11);
        if (p <= 0) return null;
        const x = 960 + (i - 1) * 550;
        return (
          <g key={i} transform={`translate(${x} 700) scale(${p})`}>
            <rect x={-260} y={-50} width={520} height={100} rx={50} fill={C.cream} />
            <circle cx={-200} cy={0} r={24} fill={C.coral} />
            <path d="M -211 1 l 8 8 l 15 -17" stroke={C.cream} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <text x={25} y={13} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={34} fill={C.navyInk}>
              {badge}
            </text>
          </g>
        );
      })}
    </g>
  );
};
