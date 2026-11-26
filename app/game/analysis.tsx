import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Chess } from 'chess.js';
import { ChessColors } from '@/constants/theme';
import { BOARD_THEMES } from '@/constants/boardThemes';
import { useSettings } from '@/src/hooks/useSettings';
import ChessBoard from '@/src/components/chess/ChessBoard';
import MoveList from '@/src/components/chess/MoveList';
import { evaluateCurrentPosition } from '@/src/engine/aiEngine';
import { ChessSquare } from '@/src/engine/chessEngine';

export default function AnalysisScreen() {
  const params = useLocalSearchParams<{ pgn?: string; fen?: string }>();
  const { settings } = useSettings();

  // Build initial game from PGN or FEN
  const buildInitialGame = () => {
    const g = new Chess();
    if (params.pgn) {
      try { g.loadPgn(params.pgn); } catch { /* ignore */ }
    } else if (params.fen) {
      try { g.load(params.fen); } catch { /* ignore */ }
    }
    return g;
  };

  const [history, setHistory] = useState(() => {
    const g = buildInitialGame();
    return g.history({ verbose: true });
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const g = buildInitialGame();
    return g.history().length - 1;
  });

  const theme = BOARD_THEMES[settings.boardTheme];

  // Build board at currentIndex
  const getBoardAtIndex = useCallback(() => {
    const g = new Chess();
    for (let i = 0; i <= currentIndex; i++) {
      if (history[i]) g.move(history[i].san);
    }
    return g;
  }, [currentIndex, history]);

  const game = getBoardAtIndex();
  const board = game.board();
  const evaluation = evaluateCurrentPosition(game.fen());
  const lastMove = currentIndex >= 0 && history[currentIndex]
    ? {
        from: history[currentIndex].from as ChessSquare,
        to: history[currentIndex].to as ChessSquare,
      }
    : null;

  const goBack = () => setCurrentIndex((i) => Math.max(-1, i - 1));
  const goForward = () => setCurrentIndex((i) => Math.min(history.length - 1, i + 1));
  const goStart = () => setCurrentIndex(-1);
  const goEnd = () => setCurrentIndex(history.length - 1);

  const evalBar = Math.max(-5, Math.min(5, evaluation / 100));
  const evalPercent = ((evalBar + 5) / 10) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Evaluation bar */}
      <View style={styles.evalContainer}>
        <View style={styles.evalBar}>
          <View style={[styles.evalFill, { width: `${evalPercent}%` }]} />
        </View>
        <Text style={styles.evalText}>
          {evaluation > 0 ? `+${(evaluation / 100).toFixed(1)}` : (evaluation / 100).toFixed(1)}
        </Text>
      </View>

      {/* Board */}
      <View style={styles.boardContainer}>
        <ChessBoard
          board={board}
          selectedSquare={null}
          legalMoveSquares={[]}
          lastMove={lastMove}
          theme={theme}
          onSquarePress={() => {}}
          showCoordinates={settings.showCoordinates}
        />
      </View>

      {/* Navigation Controls */}
      <View style={styles.navControls}>
        <TouchableOpacity style={styles.navBtn} onPress={goStart}>
          <Text style={styles.navIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={goBack}>
          <Text style={styles.navIcon}>◀</Text>
        </TouchableOpacity>
        <View style={styles.navInfo}>
          <Text style={styles.navMoveText}>
            Move {Math.max(0, currentIndex + 1)} of {history.length}
          </Text>
        </View>
        <TouchableOpacity style={styles.navBtn} onPress={goForward}>
          <Text style={styles.navIcon}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={goEnd}>
          <Text style={styles.navIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Move List */}
      <View style={styles.moveListContainer}>
        <Text style={styles.moveListTitle}>Game Moves</Text>
        <MoveList
          history={history}
          currentMoveIndex={currentIndex}
          onMovePress={setCurrentIndex}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChessColors.background },
  evalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  evalBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  evalFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  evalText: {
    fontSize: 14,
    fontWeight: '700',
    color: ChessColors.gold,
    minWidth: 48,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  boardContainer: { alignItems: 'center', paddingVertical: 8 },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: ChessColors.surface,
    borderTopWidth: 1,
    borderTopColor: ChessColors.textMuted,
    gap: 8,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ChessColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  navIcon: { fontSize: 18 },
  navInfo: { flex: 1, alignItems: 'center' },
  navMoveText: { fontSize: 14, color: ChessColors.textSecondary, fontWeight: '600' },
  moveListContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: ChessColors.textMuted,
    paddingTop: 8,
  },
  moveListTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: ChessColors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
});
