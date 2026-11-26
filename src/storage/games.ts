import { Storage } from './adapter';

export interface SavedGame {
  id: string;
  fen: string;
  pgn: string;
  date: string;
  result: string;
  white: string;
  black: string;
  moves: number;
  timeControl?: string;
  mode: 'pvp' | 'ai';
  aiDifficulty?: string;
}

const GAMES_KEY = '@chess_master_games';

export async function saveGame(game: Omit<SavedGame, 'id' | 'date'>): Promise<SavedGame> {
  const savedGame: SavedGame = {
    ...game,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };

  const existing = await loadAllGames();
  const updated = [savedGame, ...existing].slice(0, 100);
  await Storage.setItem(GAMES_KEY, JSON.stringify(updated));
  return savedGame;
}

export async function loadAllGames(): Promise<SavedGame[]> {
  try {
    const raw = await Storage.getItem(GAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function loadGameById(id: string): Promise<SavedGame | null> {
  const games = await loadAllGames();
  return games.find((g) => g.id === id) || null;
}

export async function deleteGame(id: string): Promise<void> {
  const games = await loadAllGames();
  const updated = games.filter((g) => g.id !== id);
  await Storage.setItem(GAMES_KEY, JSON.stringify(updated));
}

export async function clearAllGames(): Promise<void> {
  await Storage.removeItem(GAMES_KEY);
}
