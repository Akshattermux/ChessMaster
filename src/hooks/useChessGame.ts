import { useState, useCallback, useRef } from 'react';
import { ChessEngine, ChessSquare, GameState, MoveResult } from '@/src/engine/chessEngine';
import { AIDifficulty, getAIMove } from '@/src/engine/aiEngine';

export type GameMode = 'pvp' | 'ai';
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

interface UseChessGameOptions {
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
  aiColor?: 'w' | 'b';
  initialFen?: string;
}

interface UseChessGameReturn {
  gameState: GameState;
  selectedSquare: ChessSquare | null;
  legalMoveSquares: ChessSquare[];
  lastMove: { from: ChessSquare; to: ChessSquare } | null;
  pendingPromotion: { from: ChessSquare; to: ChessSquare } | null;
  isAIThinking: boolean;
  handleSquarePress: (square: ChessSquare) => void;
  handlePromotion: (piece: PromotionPiece) => void;
  cancelPromotion: () => void;
  undoMove: () => void;
  resetGame: (fen?: string) => void;
  loadFen: (fen: string) => void;
}

export function useChessGame({
  mode,
  aiDifficulty = 'medium',
  aiColor = 'b',
  initialFen,
}: UseChessGameOptions): UseChessGameReturn {
  const engineRef = useRef(new ChessEngine(initialFen));
  const [gameState, setGameState] = useState<GameState>(engineRef.current.getState());
  const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
  const [legalMoveSquares, setLegalMoveSquares] = useState<ChessSquare[]>([]);
  const [lastMove, setLastMove] = useState<{ from: ChessSquare; to: ChessSquare } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: ChessSquare;
    to: ChessSquare;
  } | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const syncState = useCallback(() => {
    setGameState(engineRef.current.getState());
  }, []);

  const triggerAIMove = useCallback(
    async (fen: string) => {
      if (mode !== 'ai') return;
      setIsAIThinking(true);

      // Small delay to allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 300));

      const aiMove = getAIMove(fen, aiDifficulty);
      if (aiMove) {
        try {
          const game = engineRef.current.getGame();
          const verbose = game.moves({ verbose: true });
          const moveObj = verbose.find((m) => m.san === aiMove);
          if (moveObj) {
            const result = engineRef.current.makeMove(
              moveObj.from as ChessSquare,
              moveObj.to as ChessSquare,
              moveObj.promotion as PromotionPiece | undefined
            );
            if (result.success && result.move) {
              setLastMove({
                from: result.move.from as ChessSquare,
                to: result.move.to as ChessSquare,
              });
              syncState();
            }
          }
        } catch { /* ignore */ }
      }

      setIsAIThinking(false);
    },
    [mode, aiDifficulty, syncState]
  );

  const handleSquarePress = useCallback(
    (square: ChessSquare) => {
      const state = engineRef.current.getState();

      // Block moves if game over
      if (state.isGameOver) return;

      // Block if AI is thinking or it's AI's turn
      if (mode === 'ai' && state.turn === aiColor) return;
      if (isAIThinking) return;

      const piece = engineRef.current.getPieceAt(square);

      // Case 1: No selection — select a piece
      if (!selectedSquare) {
        if (piece && piece.color === state.turn) {
          setSelectedSquare(square);
          const moves = engineRef.current.getLegalMoves(square);
          setLegalMoveSquares(moves);
        }
        return;
      }

      // Case 2: Re-select own piece
      if (piece && piece.color === state.turn && square !== selectedSquare) {
        setSelectedSquare(square);
        const moves = engineRef.current.getLegalMoves(square);
        setLegalMoveSquares(moves);
        return;
      }

      // Case 3: Deselect
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setLegalMoveSquares([]);
        return;
      }

      // Case 4: Make a move
      const result: MoveResult = engineRef.current.makeMove(selectedSquare, square);

      if (result.isPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoveSquares([]);
        return;
      }

      if (result.success && result.move) {
        setLastMove({ from: result.move.from as ChessSquare, to: result.move.to as ChessSquare });
        setSelectedSquare(null);
        setLegalMoveSquares([]);
        syncState();

        // Trigger AI move
        const newState = engineRef.current.getState();
        if (mode === 'ai' && !newState.isGameOver && newState.turn === aiColor) {
          triggerAIMove(newState.fen);
        }
      } else {
        setSelectedSquare(null);
        setLegalMoveSquares([]);
      }
    },
    [selectedSquare, mode, aiColor, isAIThinking, syncState, triggerAIMove]
  );

  const handlePromotion = useCallback(
    (piece: PromotionPiece) => {
      if (!pendingPromotion) return;
      const result = engineRef.current.makeMove(
        pendingPromotion.from,
        pendingPromotion.to,
        piece
      );
      if (result.success && result.move) {
        setLastMove({
          from: result.move.from as ChessSquare,
          to: result.move.to as ChessSquare,
        });
        syncState();

        const newState = engineRef.current.getState();
        if (mode === 'ai' && !newState.isGameOver && newState.turn === aiColor) {
          triggerAIMove(newState.fen);
        }
      }
      setPendingPromotion(null);
    },
    [pendingPromotion, mode, aiColor, syncState, triggerAIMove]
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
  }, []);

  const undoMove = useCallback(() => {
    // Undo twice in AI mode (undo AI move + player move)
    engineRef.current.undoMove();
    if (mode === 'ai') engineRef.current.undoMove();
    setSelectedSquare(null);
    setLegalMoveSquares([]);
    setLastMove(null);
    syncState();
  }, [mode, syncState]);

  const resetGame = useCallback(
    (fen?: string) => {
      engineRef.current = new ChessEngine(fen);
      setGameState(engineRef.current.getState());
      setSelectedSquare(null);
      setLegalMoveSquares([]);
      setLastMove(null);
      setPendingPromotion(null);
      setIsAIThinking(false);

      // If AI goes first (white)
      if (mode === 'ai' && aiColor === 'w') {
        triggerAIMove(engineRef.current.getFen());
      }
    },
    [mode, aiColor, triggerAIMove]
  );

  const loadFen = useCallback(
    (fen: string) => {
      engineRef.current.loadFen(fen);
      setGameState(engineRef.current.getState());
      setSelectedSquare(null);
      setLegalMoveSquares([]);
      setLastMove(null);
      setPendingPromotion(null);
    },
    []
  );

  return {
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
    loadFen,
  };
}
