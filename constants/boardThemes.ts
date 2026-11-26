export type BoardThemeName = 'classic' | 'wood' | 'dark' | 'blue' | 'green';

export interface BoardTheme {
  name: BoardThemeName;
  label: string;
  lightSquare: string;
  darkSquare: string;
  border: string;
  coordinateColor: string;
  selectedSquare: string;
  legalMove: string;
  lastMoveFrom: string;
  lastMoveTo: string;
  checkSquare: string;
  icon: string;
}

export const BOARD_THEMES: Record<BoardThemeName, BoardTheme> = {
  classic: {
    name: 'classic',
    label: 'Classic',
    lightSquare: '#F0D9B5',
    darkSquare: '#B58863',
    border: '#8B6914',
    coordinateColor: '#8B6914',
    selectedSquare: 'rgba(255, 215, 0, 0.65)',
    legalMove: 'rgba(20, 85, 30, 0.5)',
    lastMoveFrom: 'rgba(170, 162, 58, 0.5)',
    lastMoveTo: 'rgba(170, 162, 58, 0.5)',
    checkSquare: 'rgba(220, 20, 20, 0.7)',
    icon: '♟',
  },
  wood: {
    name: 'wood',
    label: 'Wood',
    lightSquare: '#DEB887',
    darkSquare: '#8B4513',
    border: '#5C2A00',
    coordinateColor: '#5C2A00',
    selectedSquare: 'rgba(255, 200, 0, 0.65)',
    legalMove: 'rgba(139, 69, 19, 0.6)',
    lastMoveFrom: 'rgba(200, 150, 50, 0.55)',
    lastMoveTo: 'rgba(200, 150, 50, 0.55)',
    checkSquare: 'rgba(220, 20, 20, 0.75)',
    icon: '🪵',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    lightSquare: '#9E9E9E',
    darkSquare: '#424242',
    border: '#212121',
    coordinateColor: '#BDBDBD',
    selectedSquare: 'rgba(255, 215, 0, 0.6)',
    legalMove: 'rgba(100, 100, 255, 0.5)',
    lastMoveFrom: 'rgba(130, 130, 130, 0.55)',
    lastMoveTo: 'rgba(130, 130, 130, 0.55)',
    checkSquare: 'rgba(220, 20, 20, 0.7)',
    icon: '🌑',
  },
  blue: {
    name: 'blue',
    label: 'Ocean',
    lightSquare: '#DEE3E6',
    darkSquare: '#4A7FA5',
    border: '#2C5F7A',
    coordinateColor: '#2C5F7A',
    selectedSquare: 'rgba(255, 215, 0, 0.65)',
    legalMove: 'rgba(0, 100, 200, 0.5)',
    lastMoveFrom: 'rgba(74, 127, 165, 0.55)',
    lastMoveTo: 'rgba(74, 127, 165, 0.55)',
    checkSquare: 'rgba(220, 20, 20, 0.7)',
    icon: '🌊',
  },
  green: {
    name: 'green',
    label: 'Forest',
    lightSquare: '#FFFFDD',
    darkSquare: '#86A666',
    border: '#4A7A2A',
    coordinateColor: '#4A7A2A',
    selectedSquare: 'rgba(255, 215, 0, 0.65)',
    legalMove: 'rgba(20, 120, 20, 0.5)',
    lastMoveFrom: 'rgba(134, 166, 102, 0.55)',
    lastMoveTo: 'rgba(134, 166, 102, 0.55)',
    checkSquare: 'rgba(220, 20, 20, 0.7)',
    icon: '🌲',
  },
};

export const DEFAULT_BOARD_THEME: BoardThemeName = 'classic';
