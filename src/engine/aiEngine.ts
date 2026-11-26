import { Chess } from 'chess.js';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'master';

// Piece values for evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Piece-square tables (from white's perspective, rank 8 to rank 1)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0],
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,   0,  5,  5,  5,  5,  0, -5],
  [0,    0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const KING_MIDDLE_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20,  20,  0,  0,  0,  0, 20, 20],
  [20,  30, 10,  0,  0, 10, 30, 20],
];

function getPieceSquareValue(type: string, color: 'w' | 'b', row: number, col: number): number {
  // For black pieces, mirror the table
  const tableRow = color === 'w' ? row : 7 - row;
  switch (type) {
    case 'p': return PAWN_TABLE[tableRow][col];
    case 'n': return KNIGHT_TABLE[tableRow][col];
    case 'b': return BISHOP_TABLE[tableRow][col];
    case 'r': return ROOK_TABLE[tableRow][col];
    case 'q': return QUEEN_TABLE[tableRow][col];
    case 'k': return KING_MIDDLE_TABLE[tableRow][col];
    default: return 0;
  }
}

function squareToRowCol(square: string): [number, number] {
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(square[1]);
  return [row, col];
}

function evaluatePosition(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isDraw() || game.isStalemate()) return 0;

  let score = 0;
  const board = game.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] || 0;
      const posValue = getPieceSquareValue(piece.type, piece.color, row, col);
      const total = value + posValue;
      score += piece.color === 'w' ? total : -total;
    }
  }

  return score;
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluatePosition(game);
  }

  const moves = game.moves();

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

export function getAIMove(fen: string, difficulty: AIDifficulty): string | null {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });

  if (moves.length === 0) return null;

  // Easy: random moves
  if (difficulty === 'easy') {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return randomMove.san;
  }

  const depthMap: Record<AIDifficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
    master: 4,
  };

  const depth = depthMap[difficulty];
  const isWhite = game.turn() === 'w';

  let bestMove = moves[0];
  let bestScore = isWhite ? -Infinity : Infinity;

  // Add some randomness to medium to make it feel more human
  const shuffled = difficulty === 'medium'
    ? [...moves].sort(() => Math.random() - 0.5)
    : moves;

  for (const move of shuffled) {
    game.move(move);
    const score = minimax(game, depth - 1, -Infinity, Infinity, !isWhite);
    game.undo();

    if (isWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove.san;
}

export function evaluateCurrentPosition(fen: string): number {
  const game = new Chess(fen);
  return evaluatePosition(game);
}

export function getHint(fen: string): string | null {
  // Use medium depth for hints
  return getAIMove(fen, 'medium');
}
