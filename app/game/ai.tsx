import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChessColors } from '@/constants/theme';
import { BOARD_THEMES } from '@/constants/boardThemes';
import { useChessGame } from '@/src/hooks/useChessGame';
import { useTimer } from '@/src/hooks/useTimer';
import { useSettings } from '@/src/hooks/useSettings';
import ChessBoard from '@/src/components/chess/ChessBoard';
import MoveList from '@/src/components/chess/MoveList';
import Timer from '@/src/components/chess/Timer';
import PromotionModal from '@/src/components/chess/PromotionModal';
import GameResultModal from '@/src/components/chess/GameResultModal';
import { getGameResultText } from '@/src/engine/notation';
import { saveGame } from '@/src/storage/games';
import { recordGameResult } from '@/src/storage/stats';
import { Chess } from 'chess.js';
import { AIDifficulty } from '@/src/engine/aiEngine';

const DIFFICULTY_LABELS: Record<AIDifficulty, string> = {
  easy: '🐣 Easy',
  medium: '🎯 Medium',
  hard: '⚡ Hard',
  master: '👑 Master',
};

export default function AIGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    difficulty?: string;
    playerColor?: string;
    timer?: string;
  }>();
  const { settings } = useSettings();

  const difficulty = (params.difficulty as AIDifficulty) || settings.aiDifficulty;
  const playerColor = (params.playerColor as 'w' | 'b') || 'w';
  const aiColor: 'w' | 'b' = playerColor === 'w' ? 'b' : 'w';
  const timerSeconds = params.timer ? parseInt(params.timer) : 0;
  const timerEnabled = timerSeconds > 0;

  const [showResult, setShowResult] = useState(false);
  const [timeoutWinner, setTimeoutWinner] = useState<'w' | 'b' | null>(null);

  const {
    gameState,
    selectedSquare,
    legalMoveSquares,
    lastMove,
    pendingPromotion,
    isAIThinking,
    handleSquarePress,
    handlePromotion,
    cancelPromotion,
    undoMove,
    resetGame,
  } = useChessGame({ mode: 'ai', aiDifficulty: difficulty, aiColor });

  const theme = BOARD_THEMES[settings.boardTheme];

  const handleTimeout = useCallback((color: 'w' | 'b') => {
    setTimeoutWinner(color === 'w' ? 'b' : 'w');
    setShowResult(true);
  }, []);

  const { whiteTime, blackTime, isRunning, startTimer, pauseTimer, resetTimer } = useTimer({
    initialTime: timerSeconds || 600,
    enabled: timerEnabled,
    currentTurn: gameState.turn,
    isGameOver: gameState.isGameOver,
    onTimeout: handleTimeout,
  });

  useEffect(() => {
    if (gameState.isGameOver) {
      pauseTimer();
      setShowResult(true);
      const isCheckmate = gameState.isCheckmate;
      const loserColor = gameState.turn;
      const playerWon = loserColor === aiColor;
      recordGameResult(
        playerWon ? 'win' : gameState.isDraw ? 'draw' : 'loss',
        isCheckmate,
        gameState.history.length,
        true
      );
    }
  }, [gameState.isGameOver]);

  useEffect(() => {
    if (gameState.history.length === 1 && timerEnabled && !isRunning) {
      startTimer();
    }
  }, [gameState.history.length]);

  const result = getGameResultText(
    gameState.isCheckmate,
    gameState.isDraw,
    gameState.isStalemate,
    !!timeoutWinner,
    timeoutWinner || (gameState.turn === 'w' ? 'b' : 'w')
  );

  const handleExit = () => {
    if (gameState.history.length > 0 && !gameState.isGameOver) {
      Alert.alert('Exit Match', 'Are you sure you want to exit? Your game progress will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleNewGame = () => {
    setShowResult(false);
    setTimeoutWinner(null);
    resetGame();
    resetTimer();
  };

  const handleSave = async () => {
    await saveGame({
      fen: gameState.fen,
      pgn: gameState.pgn,
      result: result.result,
      white: playerColor === 'w' ? 'You' : `AI (${difficulty})`,
      black: playerColor === 'b' ? 'You' : `AI (${difficulty})`,
      moves: gameState.history.length,
      timeControl: timerEnabled ? `${timerSeconds / 60}min` : 'None',
      mode: 'ai',
      aiDifficulty: difficulty,
    });
    Alert.alert('Saved!', 'Game saved to history.');
  };

  const isPlayerTurn = gameState.turn === playerColor;
  const turnLabel = isPlayerTurn ? '🎯 Your turn' : `🤖 AI thinking...`;

  // Build board from FEN
  const chess = new Chess(gameState.fen);
  const board = chess.board();

  return (
    <SafeAreaView style={styles.container}>
      {/* AI Info bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoLeft}>
          <Text style={styles.infoLabel}>AI: {DIFFICULTY_LABELS[difficulty]}</Text>
          <Text style={styles.infoSub}>
            You play {playerColor === 'w' ? '⬜ White' : '⬛ Black'}
          </Text>
        </View>
        {isAIThinking && (
          <View style={styles.thinkingBadge}>
            <ActivityIndicator size="small" color={ChessColors.gold} />
            <Text style={styles.thinkingText}>Thinking...</Text>
          </View>
        )}
      </View>

      {/* Timer */}
      {timerEnabled && (
        <View style={styles.timerContainer}>
          <Timer
            whiteTime={whiteTime}
            blackTime={blackTime}
            currentTurn={gameState.turn}
            isRunning={isRunning}
            compact
          />
        </View>
      )}

      {/* Turn indicator */}
      <View style={styles.turnBar}>
        <Text style={styles.turnText}>{turnLabel}</Text>
        {gameState.isCheck && <Text style={styles.checkText}>CHECK!</Text>}
      </View>

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
          flipped={playerColor === 'b'}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={undoMove} activeOpacity={0.7}>
          <Text style={styles.controlIcon}>↩</Text>
          <Text style={styles.controlLabel}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, styles.controlBtnDanger]}
          onPress={() => {
            Alert.alert('Resign', 'Resign this game?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Resign', style: 'destructive', onPress: () => setShowResult(true) },
            ]);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.controlIcon}>🏳️</Text>
          <Text style={styles.controlLabel}>Resign</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={handleNewGame} activeOpacity={0.7}>
          <Text style={styles.controlIcon}>🔄</Text>
          <Text style={styles.controlLabel}>New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={handleExit} activeOpacity={0.7}>
          <Text style={styles.controlIcon}>✕</Text>
          <Text style={styles.controlLabel}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* Move list */}
      <View style={styles.moveListContainer}>
        <MoveList history={gameState.history} compact />
      </View>

      {/* Modals */}
      <PromotionModal
        visible={!!pendingPromotion}
        color={gameState.turn}
        onSelect={handlePromotion}
        onCancel={cancelPromotion}
      />

      <GameResultModal
        visible={showResult}
        title={result.title}
        subtitle={result.subtitle}
        result={result.result}
        onNewGame={handleNewGame}
        onSave={handleSave}
        onAnalyze={() => {
          setShowResult(false);
          router.push({ pathname: '/game/analysis', params: { pgn: gameState.pgn } });
        }}
        onHome={() => {
          setShowResult(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChessColors.background },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: ChessColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ChessColors.textMuted,
  },
  infoLeft: {},
  infoLabel: { fontSize: 15, fontWeight: '700', color: ChessColors.gold },
  infoSub: { fontSize: 12, color: ChessColors.textSecondary, marginTop: 1 },
  thinkingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ChessColors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  thinkingText: { fontSize: 13, color: ChessColors.gold, fontWeight: '600' },
  timerContainer: { paddingHorizontal: 16, paddingTop: 8 },
  turnBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  turnText: { fontSize: 15, fontWeight: '600', color: ChessColors.textPrimary },
  checkText: { fontSize: 14, fontWeight: '800', color: ChessColors.danger, letterSpacing: 1 },
  boardContainer: { alignItems: 'center', paddingVertical: 4 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  controlBtnDanger: { borderColor: ChessColors.danger + '80' },
  controlIcon: { fontSize: 20, marginBottom: 2 },
  controlLabel: { fontSize: 11, color: ChessColors.textSecondary, fontWeight: '600' },
  moveListContainer: { flex: 1, borderTopWidth: 1, borderTopColor: ChessColors.textMuted },
});
