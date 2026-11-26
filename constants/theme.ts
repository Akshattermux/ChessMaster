import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A2E',
    background: '#F5F0E8',
    tint: '#B5893A',
    icon: '#8B6914',
    tabIconDefault: '#8B6914',
    tabIconSelected: '#B5893A',
    card: '#FFFFFF',
    border: '#D4B896',
    notification: '#E74C3C',
  },
  dark: {
    text: '#E8DCC8',
    background: '#0D1117',
    tint: '#D4A853',
    icon: '#C49A3C',
    tabIconDefault: '#6B5A3E',
    tabIconSelected: '#D4A853',
    card: '#161B22',
    border: '#2D2416',
    notification: '#E74C3C',
  },
};

export const ChessColors = {
  gold: '#D4A853',
  goldDark: '#B5893A',
  goldLight: '#F0C878',
  cream: '#F5F0E8',
  darkBrown: '#1A0F00',
  mediumBrown: '#5C3D11',
  lightBrown: '#8B6914',
  slate: '#2C3E50',
  ivory: '#FFFFF0',

  // Board themes
  classicLight: '#F0D9B5',
  classicDark: '#B58863',
  woodLight: '#DEB887',
  woodDark: '#8B4513',
  darkBoardLight: '#9E9E9E',
  darkBoardDark: '#424242',
  blueLight: '#DEE3E6',
  blueDark: '#8CA2AD',
  greenLight: '#FFFFDD',
  greenDark: '#86A666',

  // Highlights
  selectedSquare: 'rgba(255, 215, 0, 0.6)',
  legalMove: 'rgba(20, 85, 30, 0.5)',
  lastMoveFrom: 'rgba(170, 162, 58, 0.5)',
  lastMoveTo: 'rgba(170, 162, 58, 0.5)',
  checkSquare: 'rgba(220, 20, 20, 0.7)',

  // UI
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#21262D',
  primary: '#D4A853',
  primaryDark: '#B5893A',
  success: '#2ECC71',
  danger: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
  textPrimary: '#E8DCC8',
  textSecondary: '#8B7355',
  textMuted: '#4A3F2F',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
