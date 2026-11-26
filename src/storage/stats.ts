import { Storage } from './adapter';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  draws: number;
  checkmates: number;
  bestWinStreak: number;
  currentWinStreak: number;
  totalMoves: number;
  puzzlesSolved: number;
  puzzlesFailed: number;
  aiGamesPlayed: number;
  aiGamesWon: number;
}

const STATS_KEY = '@chess_master_stats';

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  draws: 0,
  checkmates: 0,
  bestWinStreak: 0,
  currentWinStreak: 0,
  totalMoves: 0,
  puzzlesSolved: 0,
  puzzlesFailed: 0,
  aiGamesPlayed: 0,
  aiGamesWon: 0,
};

export async function loadStats(): Promise<GameStats> {
  try {
    const raw = await Storage.getItem(STATS_KEY);
    return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

export async function updateStats(updates: Partial<GameStats>): Promise<GameStats> {
  const current = await loadStats();
  const updated = { ...current, ...updates };
  await Storage.setItem(STATS_KEY, JSON.stringify(updated));
  return updated;
}

export async function recordGameResult(
  result: 'win' | 'loss' | 'draw',
  wasCheckmate: boolean,
  moveCount: number,
  isAiGame: boolean,
): Promise<GameStats> {
  const stats = await loadStats();

  stats.gamesPlayed++;
  stats.totalMoves += moveCount;
  if (isAiGame) stats.aiGamesPlayed++;

  if (result === 'win') {
    stats.gamesWon++;
    stats.currentWinStreak++;
    stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.currentWinStreak);
    if (isAiGame) stats.aiGamesWon++;
    if (wasCheckmate) stats.checkmates++;
  } else if (result === 'loss') {
    stats.gamesLost++;
    stats.currentWinStreak = 0;
  } else {
    stats.draws++;
    stats.currentWinStreak = 0;
  }

  await Storage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export async function recordPuzzleResult(solved: boolean): Promise<void> {
  const stats = await loadStats();
  if (solved) stats.puzzlesSolved++;
  else stats.puzzlesFailed++;
  await Storage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function resetStats(): Promise<void> {
  await Storage.removeItem(STATS_KEY);
}
