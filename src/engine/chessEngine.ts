import { Chess, Square as ChessSquare, Move, Piece } from 'chess.js';

export type { Square as ChessSquare, Move, Piece } from 'chess.js';

export interface GameState {
  fen: string;
  pgn: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  history: Move[];
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
}

export interface MoveResult {
  success: boolean;
  move?: Move;
  error?: string;
  isPromotion?: boolean;
}

export class ChessEngine {
  private game: Chess;

  constructor(fen?: string) {
    this.game = fen ? new Chess(fen) : new Chess();
  }

  getGame(): Chess {
    return this.game;
  }

  getState(): GameState {
    const history = this.game.history({ verbose: true });
    const { capturedByWhite, capturedByBlack } = this.getCapturedPieces(history);

    return {
      fen: this.game.fen(),
      pgn: this.game.pgn(),
      turn: this.game.turn(),
      isCheck: this.game.inCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isGameOver: this.game.isGameOver(),
      history,
      capturedByWhite,
      capturedByBlack,
    };
  }

  private getCapturedPieces(history: Move[]): {
    capturedByWhite: Piece[];
    capturedByBlack: Piece[];
  } {
    const capturedByWhite: Piece[] = [];
    const capturedByBlack: Piece[] = [];

    for (const move of history) {
      if (move.captured) {
        const piece: Piece = {
          type: move.captured,
          color: move.color === 'w' ? 'b' : 'w',
        };
        if (move.color === 'w') {
          capturedByWhite.push(piece);
        } else {
          capturedByBlack.push(piece);
        }
      }
    }

    return { capturedByWhite, capturedByBlack };
  }

  makeMove(from: ChessSquare, to: ChessSquare, promotion?: 'q' | 'r' | 'b' | 'n'): MoveResult {
    // Check if this move requires promotion
    const piece = this.game.get(from);
    const isPromotion =
      piece?.type === 'p' &&
      ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'));

    if (isPromotion && !promotion) {
      return { success: false, isPromotion: true };
    }

    try {
      const move = this.game.move({ from, to, promotion: promotion || 'q' });
      if (move) {
        return { success: true, move };
      }
      return { success: false, error: 'Invalid move' };
    } catch {
      return { success: false, error: 'Invalid move' };
    }
  }

  getLegalMoves(square?: ChessSquare): ChessSquare[] {
    if (square) {
      return this.game
        .moves({ square, verbose: true })
        .map((m) => m.to as ChessSquare);
    }
    return this.game
      .moves({ verbose: true })
      .map((m) => m.to as ChessSquare);
  }

  getLegalMovesFrom(square: ChessSquare): Move[] {
    return this.game.moves({ square, verbose: true });
  }

  undoMove(): Move | null {
    return this.game.undo() || null;
  }

  loadFen(fen: string): boolean {
    try {
      const newGame = new Chess(fen);
      this.game = newGame;
      return true;
    } catch {
      return false;
    }
  }

  loadPgn(pgn: string): boolean {
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgn);
      this.game = newGame;
      return true;
    } catch {
      return false;
    }
  }

  getPgn(): string {
    return this.game.pgn();
  }

  getFen(): string {
    return this.game.fen();
  }

  reset(): void {
    this.game = new Chess();
  }

  getPieceAt(square: ChessSquare): Piece | null {
    return this.game.get(square) || null;
  }

  getKingSquare(color: 'w' | 'b'): ChessSquare | null {
    const board = this.game.board();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'k' && piece.color === color) {
          return piece.square as ChessSquare;
        }
      }
    }
    return null;
  }

  isValidSquare(square: string): square is ChessSquare {
    return /^[a-h][1-8]$/.test(square);
  }

  getMaterialAdvantage(): number {
    const pieceValues: Record<string, number> = {
      p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
    };
    const board = this.game.board();
    let advantage = 0;
    for (const row of board) {
      for (const piece of row) {
        if (piece) {
          const val = pieceValues[piece.type] || 0;
          advantage += piece.color === 'w' ? val : -val;
        }
      }
    }
    return advantage;
  }
}
