export type FlamesLetter = 'F' | 'L' | 'A' | 'M' | 'E' | 'S';

export interface LetterToken {
  id: string;
  char: string;
  matched: boolean;
  matchPairIndex: number | null;
}

export interface EliminationStep {
  stepNumber: number;
  eliminated: FlamesLetter;
  countStartFrom: FlamesLetter;
  remainingAfter: FlamesLetter[];
}

export interface FlamesOutcomeInfo {
  letter: FlamesLetter;
  word: string;
  headline: string;
  description: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  badgeGradient: string;
}

export interface FlamesCalculation {
  person1Display: string;
  person2Display: string;
  person1Tokens: LetterToken[];
  person2Tokens: LetterToken[];
  commonPairsCount: number;
  remainingCount: number;
  steps: EliminationStep[];
  winner: FlamesLetter;
  outcome: FlamesOutcomeInfo;
  allLettersMatched: boolean;
}

export const FLAMES_LETTERS: FlamesLetter[] = ['F', 'L', 'A', 'M', 'E', 'S'];

export const FLAMES_OUTCOMES: Record<FlamesLetter, FlamesOutcomeInfo> = {
  F: {
    letter: 'F',
    word: 'Friends',
    headline: 'F – Friends',
    description:
      'Easy laughter, shared inside jokes, and the kind of loyalty that sticks around through every season.',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-700',
    accentBorder: 'border-sky-200',
    badgeGradient: 'from-sky-500 to-indigo-600',
  },
  L: {
    letter: 'L',
    word: 'Love',
    headline: 'L – Love',
    description:
      'Electric chemistry and heartfelt sparks — every glance feels like the start of a favorite story.',
    accentBg: 'bg-rose-50',
    accentText: 'text-rose-700',
    accentBorder: 'border-rose-200',
    badgeGradient: 'from-pink-500 to-rose-600',
  },
  A: {
    letter: 'A',
    word: 'Affection',
    headline: 'A – Affection',
    description:
      'Warm admiration, thoughtful gestures, and a gentle closeness that brightens ordinary days.',
    accentBg: 'bg-fuchsia-50',
    accentText: 'text-fuchsia-700',
    accentBorder: 'border-fuchsia-200',
    badgeGradient: 'from-fuchsia-500 to-purple-600',
  },
  M: {
    letter: 'M',
    word: 'Marriage',
    headline: 'M – Marriage',
    description:
      'Lifelong partnership energy — two names that complement each other for the long adventure ahead.',
    accentBg: 'bg-purple-50',
    accentText: 'text-purple-700',
    accentBorder: 'border-purple-200',
    badgeGradient: 'from-purple-600 to-violet-700',
  },
  E: {
    letter: 'E',
    word: 'Enemies',
    headline: 'E – Enemies',
    description:
      'Playful rivalry and fiery banter — sparks fly fast whenever these two cross paths!',
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
    accentBorder: 'border-amber-200',
    badgeGradient: 'from-orange-500 to-rose-600',
  },
  S: {
    letter: 'S',
    word: 'Siblings',
    headline: 'S – Siblings',
    description:
      'Built-in besties who tease relentlessly one minute and have each other’s backs the next.',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    accentBorder: 'border-emerald-200',
    badgeGradient: 'from-teal-500 to-emerald-600',
  },
};

export function extractLetters(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('');
}

export function calculateFlames(rawName1: string, rawName2: string): FlamesCalculation {
  const letters1 = extractLetters(rawName1);
  const letters2 = extractLetters(rawName2);

  const person1Tokens: LetterToken[] = letters1.map((char, idx) => ({
    id: `p1-${idx}-${char}`,
    char: char.toUpperCase(),
    matched: false,
    matchPairIndex: null,
  }));

  const person2Tokens: LetterToken[] = letters2.map((char, idx) => ({
    id: `p2-${idx}-${char}`,
    char: char.toUpperCase(),
    matched: false,
    matchPairIndex: null,
  }));

  let pairCounter = 0;
  for (let i = 0; i < person1Tokens.length; i++) {
    const targetChar = person1Tokens[i].char;
    const matchIndex = person2Tokens.findIndex(
      (token) => !token.matched && token.char === targetChar
    );
    if (matchIndex !== -1) {
      pairCounter += 1;
      person1Tokens[i].matched = true;
      person1Tokens[i].matchPairIndex = pairCounter;
      person2Tokens[matchIndex].matched = true;
      person2Tokens[matchIndex].matchPairIndex = pairCounter;
    }
  }

  const remaining1 = person1Tokens.filter((t) => !t.matched).length;
  const remaining2 = person2Tokens.filter((t) => !t.matched).length;
  const remainingCount = remaining1 + remaining2;

  const activeLetters: FlamesLetter[] = [...FLAMES_LETTERS];
  const steps: EliminationStep[] = [];

  if (remainingCount === 0) {
    // When all letters cancel out completely, traditional fallback maps cleanly to 'F' (Friends)
    // by stepping through the remaining letters once or returning F directly.
    const fallbackOrder: FlamesLetter[] = ['S', 'E', 'M', 'A', 'L'];
    for (let i = 0; i < fallbackOrder.length; i++) {
      const eliminated = fallbackOrder[i];
      const idx = activeLetters.indexOf(eliminated);
      activeLetters.splice(idx, 1);
      steps.push({
        stepNumber: i + 1,
        eliminated,
        countStartFrom: 'F',
        remainingAfter: [...activeLetters],
      });
    }
  } else {
    let currentIndex = 0;
    let stepNum = 1;

    while (activeLetters.length > 1) {
      const countStartFrom = activeLetters[currentIndex];
      const removeIndex = (currentIndex + remainingCount - 1) % activeLetters.length;
      const [eliminated] = activeLetters.splice(removeIndex, 1);

      steps.push({
        stepNumber: stepNum,
        eliminated,
        countStartFrom,
        remainingAfter: [...activeLetters],
      });

      // Counting resumes from the next letter in circular order
      currentIndex = removeIndex % activeLetters.length;
      stepNum += 1;
    }
  }

  const winner = activeLetters[0];

  return {
    person1Display: rawName1.trim(),
    person2Display: rawName2.trim(),
    person1Tokens,
    person2Tokens,
    commonPairsCount: pairCounter,
    remainingCount,
    steps,
    winner,
    outcome: FLAMES_OUTCOMES[winner],
    allLettersMatched: remainingCount === 0,
  };
}
