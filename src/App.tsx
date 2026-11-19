import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeftRight,
  Flame,
  Gem,
  Heart,
  RotateCcw,
  Smile,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  FLAMES_LETTERS,
  FLAMES_OUTCOMES,
  FlamesCalculation,
  FlamesLetter,
  calculateFlames,
  extractLetters,
} from './utils/flames';
import { playEliminationTick, playResultChime } from './utils/sound';
import { CelebrationBurst } from './components/CelebrationBurst';

type GamePhase = 'IDLE' | 'ANIMATING' | 'RESULT';

function OutcomeIcon({ letter, className }: { letter: FlamesLetter; className?: string }) {
  switch (letter) {
    case 'F':
      return <Users className={className} />;
    case 'L':
      return <Heart className={className} />;
    case 'A':
      return <Sparkles className={className} />;
    case 'M':
      return <Gem className={className} />;
    case 'E':
      return <Flame className={className} />;
    case 'S':
      return <Smile className={className} />;
  }
}

export default function App() {
  const [person1, setPerson1] = useState('');
  const [person2, setPerson2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<GamePhase>('IDLE');
  const [calculation, setCalculation] = useState<FlamesCalculation | null>(null);
  const [eliminatedSet, setEliminatedSet] = useState<Set<FlamesLetter>>(new Set());
  const [activeEliminating, setActiveEliminating] = useState<FlamesLetter | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [runCounter, setRunCounter] = useState(0);

  const person1InputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const clearScheduledTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearScheduledTimers();
    };
  }, []);

  const handleSwapNames = () => {
    if (phase === 'ANIMATING') return;
    setPerson1(person2);
    setPerson2(person1);
    setError(null);
  };

  const handleReset = () => {
    clearScheduledTimers();
    setPerson1('');
    setPerson2('');
    setError(null);
    setCalculation(null);
    setEliminatedSet(new Set());
    setActiveEliminating(null);
    setPhase('IDLE');
    window.setTimeout(() => {
      person1InputRef.current?.focus();
    }, 40);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const letters1 = extractLetters(person1);
    const letters2 = extractLetters(person2);

    if (letters1.length === 0 || letters2.length === 0) {
      setError('Please enter valid names using letters (A–Z) for both people.');
      return;
    }

    clearScheduledTimers();
    setError(null);

    const result = calculateFlames(person1, person2);
    setCalculation(result);
    setEliminatedSet(new Set());
    setActiveEliminating(null);
    setRunCounter((c) => c + 1);

    if (prefersReducedMotion) {
      const allEliminated = new Set<FlamesLetter>(result.steps.map((s) => s.eliminated));
      setEliminatedSet(allEliminated);
      setPhase('RESULT');
      playResultChime(soundEnabled);
      return;
    }

    setPhase('ANIMATING');

    const stepInterval = 270;
    const initialDelay = 380;

    result.steps.forEach((step, idx) => {
      const highlightTimer = window.setTimeout(() => {
        setActiveEliminating(step.eliminated);
        playEliminationTick(idx, soundEnabled);
      }, initialDelay + idx * stepInterval);

      const strikeTimer = window.setTimeout(() => {
        setEliminatedSet((prev) => {
          const next = new Set(prev);
          next.add(step.eliminated);
          return next;
        });
      }, initialDelay + idx * stepInterval + 130);

      timersRef.current.push(highlightTimer, strikeTimer);
    });

    const revealTimer = window.setTimeout(() => {
      setActiveEliminating(null);
      setPhase('RESULT');
      playResultChime(soundEnabled);
    }, initialDelay + result.steps.length * stepInterval + 180);

    timersRef.current.push(revealTimer);
  };

  const hasInputs = person1.trim().length > 0 || person2.trim().length > 0;
  const showReset = hasInputs || phase !== 'IDLE';

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-pink-600 via-fuchsia-700 to-purple-900 text-slate-900 selection:bg-pink-200 selection:text-purple-950">
      {/* Ambient background gradient highlights */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="animate-float-slow absolute -left-24 -top-24 h-96 w-96 rounded-full bg-pink-400/30 blur-3xl" />
        <div className="animate-float-slow absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-purple-400/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-between px-4 py-6 sm:px-8 sm:py-10">
        {/* Top bar */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Heart className="h-5 w-5 fill-pink-200 text-pink-100" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight whitespace-nowrap shrink-0">
              FLAMES
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap shrink-0"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span className="hidden sm:inline">Sound Off</span>
              </>
            )}
          </button>
        </header>

        {/* Main Game Stage */}
        <main className="my-auto w-full">
          <section className="rounded-3xl bg-white/95 p-6 shadow-2xl shadow-purple-950/35 backdrop-blur-md sm:p-10">
            {/* Hero Title */}
            <div className="mb-8 text-center">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl [text-wrap:balance]">
                <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
                  FLAMES
                </span>{' '}
                Match Game
              </h1>
              <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                Enter two names to cross out common letters and discover your fate across{' '}
                <span className="font-medium text-slate-800">
                  Friends · Love · Affection · Marriage · Enemies · Siblings
                </span>
                .
              </p>
            </div>

            {/* Name Input Form */}
            <form onSubmit={handleCalculate} noValidate className="space-y-5">
              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
                <div>
                  <label
                    htmlFor="person1-input"
                    className="mb-1.5 block text-sm font-semibold text-slate-800"
                  >
                    Person 1 Name
                  </label>
                  <input
                    ref={person1InputRef}
                    id="person1-input"
                    type="text"
                    value={person1}
                    onChange={(e) => {
                      setPerson1(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. Sophia"
                    autoComplete="off"
                    disabled={phase === 'ANIMATING'}
                    className="h-12 w-full rounded-xl border border-purple-200 bg-purple-50/40 px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-fuchsia-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-fuchsia-500/15 disabled:cursor-not-allowed disabled:opacity-65"
                  />
                </div>

                <div className="flex justify-center sm:pb-1">
                  <button
                    type="button"
                    onClick={handleSwapNames}
                    disabled={phase === 'ANIMATING'}
                    aria-label="Swap names"
                    title="Swap names"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-600 transition-all duration-150 hover:border-fuchsia-300 hover:bg-fuchsia-50 hover:text-fuchsia-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="person2-input"
                    className="mb-1.5 block text-sm font-semibold text-slate-800"
                  >
                    Person 2 Name
                  </label>
                  <input
                    id="person2-input"
                    type="text"
                    value={person2}
                    onChange={(e) => {
                      setPerson2(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. Daniel"
                    autoComplete="off"
                    disabled={phase === 'ANIMATING'}
                    className="h-12 w-full rounded-xl border border-purple-200 bg-purple-50/40 px-4 text-base font-medium text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-fuchsia-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-fuchsia-500/15 disabled:cursor-not-allowed disabled:opacity-65"
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-sm font-medium text-rose-700"
                >
                  {error}
                </p>
              )}

              {/* Primary Action Row */}
              <div className="flex flex-col items-stretch justify-center gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={phase === 'ANIMATING'}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 px-8 py-3 text-base font-bold text-white shadow-lg shadow-fuchsia-600/25 transition-all duration-150 hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-500/35 disabled:cursor-not-allowed disabled:opacity-75 sm:max-w-xs whitespace-nowrap shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{phase === 'ANIMATING' ? 'Calculating...' : 'Calculate'}</span>
                </button>

                {showReset && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition-colors duration-150 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-900 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </form>

            {/* Interactive Calculation Breakdown & Result */}
            <AnimatePresence mode="wait">
              {calculation && phase !== 'IDLE' && (
                <motion.div
                  key={`calc-${runCounter}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-8 border-t border-purple-100 pt-8"
                >
                  {/* Step 1: Letter Cancellation */}
                  <div className="mb-7">
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-base font-bold text-slate-900">
                        1. Common Letters Removed
                      </h2>
                      <p className="text-xs font-medium text-slate-500 tabular-nums sm:text-sm">
                        {calculation.commonPairsCount}{' '}
                        {calculation.commonPairsCount === 1 ? 'pair' : 'pairs'} crossed out
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-semibold text-fuchsia-700">
                          {calculation.remainingCount} remaining{' '}
                          {calculation.remainingCount === 1 ? 'letter' : 'letters'}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-purple-100 bg-purple-50/45 p-4 sm:grid-cols-2 sm:p-5">
                      <div>
                        <p className="mb-2 text-xs font-semibold text-slate-500">
                          {calculation.person1Display}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {calculation.person1Tokens.map((token, idx) => (
                            <motion.span
                              key={token.id}
                              initial={
                                prefersReducedMotion ? false : { opacity: 0, scale: 0.85 }
                              }
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.02, duration: 0.16 }}
                              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200 ${
                                token.matched
                                  ? 'border border-rose-200 bg-rose-50/70 text-rose-400'
                                  : 'border border-purple-200 bg-white text-purple-900 shadow-xs'
                              }`}
                            >
                              <span className={token.matched ? 'line-through decoration-2 decoration-rose-500' : ''}>
                                {token.char}
                              </span>
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold text-slate-500">
                          {calculation.person2Display}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {calculation.person2Tokens.map((token, idx) => (
                            <motion.span
                              key={token.id}
                              initial={
                                prefersReducedMotion ? false : { opacity: 0, scale: 0.85 }
                              }
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.02, duration: 0.16 }}
                              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200 ${
                                token.matched
                                  ? 'border border-rose-200 bg-rose-50/70 text-rose-400'
                                  : 'border border-purple-200 bg-white text-purple-900 shadow-xs'
                              }`}
                            >
                              <span className={token.matched ? 'line-through decoration-2 decoration-rose-500' : ''}>
                                {token.char}
                              </span>
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: FLAMES Elimination Track */}
                  <div className="mb-7">
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-base font-bold text-slate-900">
                        2. FLAMES Elimination
                      </h2>
                      <p className="text-xs font-medium text-slate-500 tabular-nums sm:text-sm">
                        {calculation.allLettersMatched
                          ? 'All letters matched · defaulting to Friends'
                          : `Counting every ${calculation.remainingCount} ${
                              calculation.remainingCount === 1 ? 'step' : 'steps'
                            }`}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
                      {FLAMES_LETTERS.map((letter) => {
                        const info = FLAMES_OUTCOMES[letter];
                        const isEliminated = eliminatedSet.has(letter);
                        const isBeingStruck = activeEliminating === letter;
                        const isWinner = phase === 'RESULT' && calculation.winner === letter;

                        return (
                          <motion.div
                            key={letter}
                            animate={
                              isWinner && !prefersReducedMotion
                                ? { scale: [1, 1.08, 1.04] }
                                : isBeingStruck && !prefersReducedMotion
                                  ? { scale: 1.06 }
                                  : { scale: 1 }
                            }
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className={`relative flex flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center transition-all duration-200 ${
                              isWinner
                                ? `border-transparent bg-gradient-to-br ${info.badgeGradient} text-white shadow-lg shadow-fuchsia-600/25`
                                : isBeingStruck
                                  ? 'border-pink-400 bg-pink-50 text-pink-700 ring-4 ring-pink-400/25'
                                  : isEliminated
                                    ? 'border-slate-200 bg-slate-50 text-slate-400 opacity-50'
                                    : 'border-purple-200 bg-white text-slate-900'
                            }`}
                          >
                            <span
                              className={`font-display text-2xl font-extrabold leading-none ${
                                isEliminated && !isWinner
                                  ? 'line-through decoration-2 decoration-rose-400'
                                  : ''
                              }`}
                            >
                              {letter}
                            </span>
                            <span
                              className={`mt-1.5 text-xs font-medium ${
                                isWinner ? 'text-white/95' : 'text-slate-500'
                              }`}
                            >
                              {info.word}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Final Result Reveal */}
                  <AnimatePresence>
                    {phase === 'RESULT' && (
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? { opacity: 1 }
                            : { opacity: 0, scale: 0.92, y: 12 }
                        }
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 340,
                          damping: 22,
                        }}
                        className={`relative overflow-visible rounded-2xl border ${calculation.outcome.accentBorder} ${calculation.outcome.accentBg} p-6 text-center sm:p-8`}
                      >
                        <CelebrationBurst triggerKey={`burst-${runCounter}`} />

                        <div className="relative z-10 flex flex-col items-center">
                          <motion.div
                            initial={
                              prefersReducedMotion ? false : { scale: 0.4, rotate: -14 }
                            }
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 16,
                              delay: 0.05,
                            }}
                            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${calculation.outcome.badgeGradient} text-white shadow-lg`}
                          >
                            <OutcomeIcon
                              letter={calculation.winner}
                              className="h-8 w-8"
                            />
                          </motion.div>

                          <p className="text-sm font-semibold text-slate-600">
                            {calculation.person1Display} &amp; {calculation.person2Display}
                          </p>

                          <h3
                            className={`mt-1.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl ${calculation.outcome.accentText}`}
                          >
                            {calculation.outcome.headline}
                          </h3>

                          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-slate-700 sm:text-base">
                            {calculation.outcome.description}
                          </p>

                          <button
                            type="button"
                            onClick={handleReset}
                            className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/30 whitespace-nowrap shrink-0"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Play Again</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Compact 3-Step Rules Strip */}
          <section
            aria-label="How FLAMES works"
            className="mt-6 grid grid-cols-1 gap-3 text-white/90 sm:grid-cols-3 sm:gap-4"
          >
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="font-display text-sm font-bold text-white">
                01. Enter Two Names
              </p>
              <p className="mt-1 text-xs leading-relaxed text-pink-100/90">
                Type both names above. Spaces and letter casing are ignored automatically.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="font-display text-sm font-bold text-white">
                02. Cancel Common Letters
              </p>
              <p className="mt-1 text-xs leading-relaxed text-pink-100/90">
                Matching letters are crossed out one-for-one, leaving the unique count.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="font-display text-sm font-bold text-white">
                03. Count &amp; Eliminate
              </p>
              <p className="mt-1 text-xs leading-relaxed text-pink-100/90">
                Letters in F-L-A-M-E-S are eliminated circularly until one result remains.
              </p>
            </div>
          </section>
        </main>

        <footer className="mt-8 text-center text-xs text-pink-100/80">
          Classic FLAMES Relationship Game · Just for fun
        </footer>
      </div>
    </div>
  );
}
