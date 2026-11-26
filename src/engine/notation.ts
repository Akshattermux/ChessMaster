import { Move } from 'chess.js';

export function formatMove(move: Move, moveNumber: number, isWhite: boolean): string {
  if (isWhite) {
    return `${moveNumber}. ${move.san}`;
  }
  return move.san;
}

export function buildPgnDisplay(history: Move[]): Array<{
  number: number;
  white: string;
  black?: string;
}> {
  const pairs: Array<{ number: number; white: string; black?: string }> = [];

  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i].san,
      black: history[i + 1]?.san,
    });
  }

  return pairs;
}

export function squareToAlgebraic(row: number, col: number): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = String(8 - row);
  return file + rank;
}

export function algebraicToSquare(square: string): { row: number; col: number } {
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(square[1]);
  return { row, col };
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getPieceSymbol(type: string, color: 'w' | 'b'): string {
  const symbols: Record<string, Record<string, string>> = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
  };
  return symbols[color]?.[type] || '';
}

export function exportPgnWithHeaders(
  pgn: string,
  white: string = 'Player 1',
  black: string = 'Player 2',
  result: string = '*',
  date?: string
): string {
  const d = date || new Date().toISOString().split('T')[0].replace(/-/g, '.');
  const headers = [
    `[Event "Chess Master Game"]`,
    `[Date "${d}"]`,
    `[White "${white}"]`,
    `[Black "${black}"]`,
    `[Result "${result}"]`,
    '',
    pgn,
  ];
  return headers.join('\n');
}

export function getGameResultText(
  isCheckmate: boolean,
  isDraw: boolean,
  isStalemate: boolean,
  isTimeOut: boolean,
  winner?: 'w' | 'b'
): { title: string; subtitle: string; result: string } {
  if (isCheckmate && winner) {
    const winnerName = winner === 'w' ? 'White' : 'Black';
    return {
      title: 'Checkmate!',
      subtitle: `${winnerName} wins by checkmate`,
      result: winner === 'w' ? '1-0' : '0-1',
    };
  }
  if (isTimeOut && winner) {
    const winnerName = winner === 'w' ? 'White' : 'Black';
    return {
      title: 'Time Out!',
      subtitle: `${winnerName} wins on time`,
      result: winner === 'w' ? '1-0' : '0-1',
    };
  }
  if (isStalemate) {
    return {
      title: 'Stalemate!',
      subtitle: 'The game is a draw by stalemate',
      result: '1/2-1/2',
    };
  }
  if (isDraw) {
    return {
      title: 'Draw!',
      subtitle: 'The game ended in a draw',
      result: '1/2-1/2',
    };
  }
  return { title: 'Game Over', subtitle: '', result: '*' };
}
