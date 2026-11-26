import { Storage } from './adapter';
import { BoardThemeName, DEFAULT_BOARD_THEME } from '@/constants/boardThemes';
import { AIDifficulty } from '@/src/engine/aiEngine';

export type TimerPreset = 60 | 180 | 300 | 600 | 900 | 1800;

export interface AppSettings {
  boardTheme: BoardThemeName;
  aiDifficulty: AIDifficulty;
  timerPreset: TimerPreset;
  timerEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showCoordinates: boolean;
  autoPromoteToQueen: boolean;
  showLegalMoves: boolean;
  flipBoardForBlack: boolean;
}

const SETTINGS_KEY = '@chess_master_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  boardTheme: DEFAULT_BOARD_THEME,
  aiDifficulty: 'medium',
  timerPreset: 600,
  timerEnabled: false,
  soundEnabled: true,
  hapticsEnabled: true,
  showCoordinates: true,
  autoPromoteToQueen: false,
  showLegalMoves: true,
  flipBoardForBlack: false,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await Storage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadSettings();
  const updated = { ...current, ...settings };
  await Storage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export async function resetSettings(): Promise<AppSettings> {
  await Storage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
}
