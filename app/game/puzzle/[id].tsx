import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Chess } from 'chess.js';
import { ChessColors } from '@/constants/theme';
import { BOARD_THEMES } from '@/constants/boardThemes';
import { PUZZLES, Puzzle } from '@/constants/puzzles';
import { useSettings } from '@/src/hooks/useSettings';
import ChessBoard from '@/src/components/chess/ChessBoard';
import { recordPuzzleResult } from '@/src/storage/stats';
import { ChessSquare } from '@/src/engine/chessEngine';
import { getHint } from '@/src/engine/aiEngine';

export default function PuzzleScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { settings } = useSettings();

  const puzzle: Puzzle | undefined = PUZZLES.find((p) => p.id === params.id);

  const [game, setGame] = useState(() => {
    if (!puzzle) return new Chess();
    const g = new Chess(puzzle.fen);
    return g;
  });
  const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
  const [legalMoveSquares, setLegalMoveSquares] = useState<ChessSquare[]>([]);
  const [lastMove, setLastMove] = useState<{ from: ChessSquare; to: ChessSquare } | null>(null);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'solved'>('playing');
  const [hint, setHint] = useState<string | null>(null);
  const [movesMade, setMovesMade] = useState(0);
  const feedbackAnim = React.useRef(new Animated.Value(0)).current;

  const theme = BOARD_THEMES[settings.boardTheme];

  const animateFeedback = useCallback(
    (isCorrect: boolean) => {
      Animated.sequence([
        Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(feedbackAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    },
    [feedbackAnim]
  );

  const handleSquarePress = useCallback(
    (square: ChessSquare) => {
      if (status !== 'playing') return;

      const piece = game.get(square);

      if (!selectedSquare) {
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const moves = game.moves({ square, verbose: true }).map((m) => m.to as ChessSquare);
          setLegalMoveSquares(moves);
        }
        return;
      }

      if (piece && piece.color === game.turn() && square !== selectedSquare) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true }).map((m) => m.to as ChessSquare);
        setLegalMoveSquares(moves);
        return;
      }

      if (square === selectedSquare) {
        setSelectedSquare(null);
        setLegalMoveSquares([]);
        return;
      }

      // Attempt move
      try {
        const newGame = new Chess(game.fen());
        const move = newGame.move({ from: selectedSquare, to: square, promotion: 'q' });

        if (move) {
          const moveUci = `${move.from}${move.to}`;
          const expectedUci = puzzle?.bestMove || '';

          setGame(newGame);
          setLastMove({ from: move.from as ChessSquare, to: move.to as ChessSquare });
          setSelectedSquare(null);
          setLegalMoveSquares([]);
          setMovesMade((m) => m + 1);

          if (
            moveUci === expectedUci ||
            move.san === puzzle?.solution[0]
          ) {
            setStatus('solved');
            recordPuzzleResult(true);
            animateFeedback(true);
          } else {
            setStatus('wrong');
            recordPuzzleResult(false);
            animateFeedback(false);
            // Reset after a moment
            setTimeout(() => {
              const reset = new Chess(puzzle!.fen);
              setGame(reset);
              setLastMove(null);
              setMovesMade(0);
              setStatus('playing');
            }, 1500);
          }
        }
      } catch {
        setSelectedSquare(null);
        setLegalMoveSquares([]);
      }
    },
    [selectedSquare, game, puzzle, status, animateFeedback]
  );

  const handleHint = () => {
    const h = getHint(game.fen());
    setHint(h);
    setTimeout(() => setHint(null), 3000);
  };

  const handleReset = () => {
    if (!puzzle) return;
    const g = new Chess(puzzle.fen);
    setGame(g);
    setSelectedSquare(null);
    setLegalMoveSquares([]);
    setLastMove(null);
    setStatus('playing');
    setMovesMade(0);
    setHint(null);
  };

  if (!puzzle) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Puzzle not found</Text>
      </SafeAreaView>
    );
  }

  const board = game.board();
  const difficultyColor =
    puzzle.difficulty === 'beginner'
      ? ChessColors.success
      : puzzle.difficulty === 'intermediate'
      ? ChessColors.warning
      : ChessColors.danger;

  return (
    <SafeAreaView style={styles.container}>
      {/* Puzzle Info */}
      <View style={styles.infoBar}>
        <View>
          <Text style={styles.puzzleTitle}>{puzzle.title}</Text>
          <Text style={styles.puzzleTheme}>{puzzle.theme}</Text>
        </View>
        <View style={[styles.diffBadge, { borderColor: difficultyColor }]}>
          <Text style={[styles.diffText, { color: difficultyColor }]}>
            {puzzle.difficulty}
          </Text>
        </View>
      </View>

      {/* Turn prompt */}
      <View style={styles.promptBar}>
        <Text style={styles.promptText}>
          {game.turn() === 'w' ? '⬜ Find the best move for White' : '⬛ Find the best move for Black'}
        </Text>
      </View>

      {/* Feedback */}
      {status === 'solved' && (
        <View style={[styles.feedbackBar, styles.feedbackCorrect]}>
          <Text style={styles.feedbackText}>✅ Correct! Brilliant move!</Text>
        </View>
      )}
      {status === 'wrong' && (
        <View style={[styles.feedbackBar, styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>❌ Not the best move. Try again!</Text>
        </View>
      )}

      {/* Hint */}
      {hint && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>💡 Hint: {hint}</Text>
        </View>
      )}

      {/* Board */}
      <View style={styles.boardContainer}>
        <ChessBoard
          board={board}
          selectedSquare={selectedSquare}
          legalMoveSquares={legalMoveSquares}
          lastMove={lastMove}
          theme={theme}
          onSquarePress={handleSquarePress}
          showCoordinates={settings.showCoordinates}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={handleReset}>
          <Text style={styles.controlIcon}>🔄</Text>
          <Text style={styles.controlLabel}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={handleHint}>
          <Text style={styles.controlIcon}>💡</Text>
          <Text style={styles.controlLabel}>Hint</Text>
        </TouchableOpacity>
        {status === 'solved' && (
          <TouchableOpacity
            style={[styles.controlBtn, styles.nextBtn]}
            onPress={() => {
              const currentIdx = PUZZLES.findIndex((p) => p.id === puzzle.id);
              const next = PUZZLES[currentIdx + 1];
              if (next) {
                router.replace({ pathname: '/game/puzzle/[id]', params: { id: next.id } });
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.controlIcon}>▶</Text>
            <Text style={[styles.controlLabel, { color: ChessColors.gold }]}>Next</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.controlBtn} onPress={() => router.back()}>
          <Text style={styles.controlIcon}>✕</Text>
          <Text style={styles.controlLabel}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Solution (shown when solved) */}
      {status === 'solved' && (
        <View style={styles.solutionContainer}>
          <Text style={styles.solutionTitle}>Solution:</Text>
          <Text style={styles.solutionText}>{puzzle.solution.join(' ')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChessColors.background },
  errorText: { color: ChessColors.textSecondary, textAlign: 'center', marginTop: 32, fontSize: 16 },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ChessColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ChessColors.textMuted,
  },
  puzzleTitle: { fontSize: 17, fontWeight: '700', color: ChessColors.textPrimary },
  puzzleTheme: { fontSize: 13, color: ChessColors.textSecondary, marginTop: 2 },
  diffBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  diffText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  promptBar: {
    backgroundColor: ChessColors.surfaceElevated,
    padding: 12,
    alignItems: 'center',
  },
  promptText: { fontSize: 14, color: ChessColors.textPrimary, fontWeight: '600' },
  feedbackBar: {
    padding: 10,
    alignItems: 'center',
  },
  feedbackCorrect: { backgroundColor: '#1B3A1B' },
  feedbackWrong: { backgroundColor: '#3A1B1B' },
  feedbackText: { fontSize: 15, fontWeight: '700', color: ChessColors.textPrimary },
  hintBar: {
    backgroundColor: ChessColors.surfaceElevated,
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: ChessColors.textMuted,
  },
  hintText: { fontSize: 14, color: ChessColors.gold, fontStyle: 'italic' },
  boardContainer: { alignItems: 'center', paddingVertical: 8 },
  controls: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: ChessColors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  nextBtn: {
    borderColor: ChessColors.gold,
    backgroundColor: ChessColors.surfaceElevated,
  },
  controlIcon: { fontSize: 20, marginBottom: 2 },
  controlLabel: { fontSize: 11, color: ChessColors.textSecondary, fontWeight: '600' },
  solutionContainer: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: ChessColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  solutionTitle: { fontSize: 13, color: ChessColors.textMuted, marginBottom: 4, fontWeight: '600' },
  solutionText: { fontSize: 15, color: ChessColors.gold, fontFamily: 'monospace', fontWeight: '600' },
});
