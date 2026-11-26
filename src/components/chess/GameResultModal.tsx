import React, { memo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { ChessColors } from '@/constants/theme';

interface GameResultModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  result: string;
  onNewGame: () => void;
  onAnalyze?: () => void;
  onHome: () => void;
  onSave?: () => void;
}

function GameResultModal({
  visible,
  title,
  subtitle,
  result,
  onNewGame,
  onAnalyze,
  onHome,
  onSave,
}: GameResultModalProps) {
  const isWhiteWin = result === '1-0';
  const isBlackWin = result === '0-1';
  const isDraw = result === '1/2-1/2';

  const resultColor = isWhiteWin
    ? '#FFFFFF'
    : isBlackWin
    ? '#555555'
    : ChessColors.gold;

  const emoji = isWhiteWin ? '♔' : isBlackWin ? '♚' : '🤝';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.title, { color: resultColor }]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.resultBadge}>
            <Text style={styles.resultText}>{result}</Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onNewGame}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>New Game</Text>
            </TouchableOpacity>

            {onSave && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onSave}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Save Game</Text>
              </TouchableOpacity>
            )}

            {onAnalyze && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onAnalyze}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Analyze</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={onHome}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: ChessColors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 320,
    borderWidth: 1,
    borderColor: ChessColors.gold,
    shadowColor: ChessColors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: ChessColors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultBadge: {
    backgroundColor: ChessColors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  resultText: {
    color: ChessColors.gold,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: ChessColors.gold,
  },
  primaryButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: ChessColors.surfaceElevated,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  secondaryButtonText: {
    color: ChessColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  outlineButtonText: {
    color: ChessColors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default memo(GameResultModal);
