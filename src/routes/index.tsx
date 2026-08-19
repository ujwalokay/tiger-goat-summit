import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Clock, RotateCcw, Swords } from "lucide-react";
import {
  createGame,
  legalMovesFrom,
  movePiece,
  placeGoat,
  tigerAiMove,
  TOTAL_GOATS,
  type GameState,
} from "@/lib/baghchal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const BoardScene = lazy(() => import("@/components/game/BoardScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bagh-Chal 3D — Tigers vs Goats Board Game" },
      {
        name: "description",
        content:
          "Play Bagh-Chal, the classic Nepalese tigers-and-goats strategy game, in a fully interactive 3D board rendered with Three.js.",
      },
      { property: "og:title", content: "Bagh-Chal 3D — Tigers vs Goats Board Game" },
      {
        property: "og:description",
        content: "Trap the tigers or devour the goats in this interactive 3D Bagh-Chal board game.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [game, setGame] = useState<GameState>(() => createGame());
  const [selected, setSelected] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [vsAi, setVsAi] = useState(true);

  useEffect(() => setMounted(true), []);

  const placementPhase = game.goatsPlaced < TOTAL_GOATS;

  const targets = useMemo(() => {
    if (game.winner) return [];
    if (selected !== null) return legalMovesFrom(game, selected);
    if (game.turn === "goat" && placementPhase)
      return game.board.map((c, i) => (c === "empty" ? i : -1)).filter((i) => i >= 0);
    return [];
  }, [game, selected, placementPhase]);

  const onNodeClick = useCallback(
    (i: number) => {
      if (game.winner) return;
      const cell = game.board[i];

      if (selected !== null) {
        const next = movePiece(game, selected, i);
        if (next) {
          setGame(next);
          setSelected(null);
          return;
        }
      }

      if (cell === game.turn && !(game.turn === "goat" && placementPhase)) {
        setSelected(selected === i ? null : i);
        return;
      }

      if (game.turn === "goat" && placementPhase && cell === "empty") {
        const next = placeGoat(game, i);
        if (next) {
          setGame(next);
          setSelected(null);
        }
      }
    },
    [game, selected, placementPhase],
  );

  // Tiger AI
  useEffect(() => {
    if (!vsAi || game.turn !== "tiger" || game.winner) return;
    const t = setTimeout(() => {
      setGame((g) => (g.turn === "tiger" && !g.winner ? (tigerAiMove(g) ?? g) : g));
    }, 600);
    return () => clearTimeout(t);
  }, [game, vsAi]);

  const reset = () => {
    setGame(createGame());
    setSelected(null);
  };

  const status = game.winner
    ? game.winner === "tiger"
      ? "Tigers win — five goats devoured!"
      : "Goats win — every tiger is trapped!"
    : game.turn === "goat"
      ? placementPhase
        ? "Goats: place a goat on any empty node"
        : "Goats: move a goat to an adjacent node"
      : vsAi
        ? "Tigers are prowling…"
        : "Tigers: move or jump over a goat";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200">
      <div className="absolute inset-0">
        {mounted ? (
          <Suspense fallback={null}>
            <BoardScene
              board={game.board}
              selected={selected}
              targets={targets}
              onNodeClick={onNodeClick}
            />
          </Suspense>
        ) : null}
      </div>

      {/* HUD */}
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col justify-between p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="pointer-events-auto rounded-2xl border-2 border-amber-900/40 bg-amber-100/90 px-5 py-3 shadow-xl backdrop-blur">
            <h1 className="text-2xl font-black tracking-tight text-amber-950 sm:text-3xl">
              BAGH-CHAL
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">
              Tigers vs Goats
            </p>
          </div>
          <div className="pointer-events-auto flex gap-3">
            <Stat label="Goats left" value={`${TOTAL_GOATS - game.goatsPlaced}`} />
            <Stat label="Captured" value={`${game.goatsCaptured} / 5`} />
            <Stat label="Turn" value={game.turn === "goat" ? "Goat" : "Tiger"} />
          </div>
        </header>

        <div className="mx-auto pointer-events-auto rounded-full border border-amber-900/30 bg-amber-50/90 px-5 py-2 text-sm font-semibold text-amber-950 shadow-lg backdrop-blur">
          {status}
        </div>

        <footer className="flex flex-wrap items-end justify-between gap-3">
          <div className="pointer-events-auto flex gap-2">
            <ActionButton icon={<BookOpen className="size-4" />} onClick={() => setRulesOpen(true)}>
              Rules
            </ActionButton>
            <ActionButton icon={<Clock className="size-4" />} onClick={() => setHistoryOpen(true)}>
              History
            </ActionButton>
          </div>
          <div className="pointer-events-auto flex gap-2">
            <ActionButton icon={<RotateCcw className="size-4" />} onClick={reset}>
              Reset
            </ActionButton>
            <ActionButton
              icon={<Swords className="size-4" />}
              onClick={() => {
                setVsAi((v) => !v);
                reset();
              }}
            >
              {vsAi ? "New game (2P)" : "New game (vs AI)"}
            </ActionButton>
          </div>
        </footer>
      </div>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to play Bagh-Chal</DialogTitle>
            <DialogDescription>An ancient Nepalese hunt game of asymmetric war.</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Four tigers start in the corners. Goats have 20 pieces to place.</li>
            <li>
              Phase 1: goats place one piece per turn on any empty node. Goats cannot move yet.
            </li>
            <li>Phase 2: once all 20 goats are placed, goats move along lines to adjacent nodes.</li>
            <li>
              Tigers move along lines, or jump straight over a single adjacent goat into the empty
              node beyond it to capture that goat.
            </li>
            <li>Tigers win by capturing 5 goats. Goats win by blocking every tiger move.</li>
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move history</DialogTitle>
            <DialogDescription>{game.history.length} moves played.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-72 pr-4">
            <ol className="space-y-1 text-sm">
              {game.history.length === 0 ? (
                <li className="text-muted-foreground">No moves yet.</li>
              ) : (
                game.history.map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-6 shrink-0 text-muted-foreground">{i + 1}.</span>
                    <span>{h}</span>
                  </li>
                ))
              )}
            </ol>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-amber-900/30 bg-amber-50/90 px-4 py-2 text-center shadow-lg backdrop-blur">
      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">{label}</div>
      <div className="text-lg font-black text-amber-950">{value}</div>
    </div>
  );
}

function ActionButton({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="gap-2 rounded-xl border-2 border-amber-900/40 bg-amber-100/90 font-bold text-amber-950 shadow-lg backdrop-blur hover:bg-amber-200"
      variant="secondary"
    >
      {icon}
      {children}
    </Button>
  );
}
