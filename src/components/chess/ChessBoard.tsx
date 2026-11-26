import React, { memo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { ChessSquare } from '@/src/engine/chessEngine';
import { BoardTheme } from '@/constants/boardThemes';
import Square from './Square';
import { Chess } from 'chess.js';

type Board = ReturnType<Chess['board']>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const BOARD_SIZE = Math.min(SCREEN_WIDTH - 16, 400);
export const SQUARE_SIZE = BOARD_SIZE / 8;

interface ChessBoardProps {
  board: Board;
  selectedSquare: ChessSquare | null;
  legalMoveSquares: ChessSquare[];
  lastMove: { from: ChessSquare; to: ChessSquare } | null;
  checkSquare?: ChessSquare | null;
  theme: BoardTheme;
  onSquarePress: (square: ChessSquare) => void;
  flipped?: boolean;
  showCoordinates?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function ChessBoard({
  board,
  selectedSquare,
  legalMoveSquares,
  lastMove,
  checkSquare,
  theme,
  onSquarePress,
  flipped = false,
  showCoordinates = true,
}: ChessBoardProps) {
  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  return (
    <View style={styles.container}>
      {/* Board */}
      <View
        style={[
          styles.board,
          { width: BOARD_SIZE, height: BOARD_SIZE, borderColor: theme.border },
        ]}
      >
        {ranks.map((rank, rowIndex) => (
          <View key={rank} style={styles.row}>
            {files.map((file, colIndex) => {
              const square = `${file}${rank}` as ChessSquare;
              const isLight = (rowIndex + colIndex) % 2 === 0;

              // Board array: board[row][col], row 0 = rank 8
              const boardRow = flipped ? 7 - rowIndex : rowIndex;
              const boardCol = flipped ? 7 - colIndex : colIndex;
              const piece = board[boardRow]?.[boardCol] || null;

              const isSelected = selectedSquare === square;
              const isLegalMove = legalMoveSquares.includes(square);
              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isCheck = checkSquare === square;

              return (
                <Square
                  key={square}
                  square={square}
                  piece={piece}
                  isLight={isLight}
                  isSelected={isSelected}
                  isLegalMove={isLegalMove}
                  isLastMoveFrom={isLastMoveFrom}
                  isLastMoveTo={isLastMoveTo}
                  isCheck={isCheck}
                  theme={theme}
                  onPress={onSquarePress}
                  size={SQUARE_SIZE}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Coordinate Labels */}
      {showCoordinates && (
        <>
          {/* File labels (a-h) */}
          <View style={[styles.fileLabels, { width: BOARD_SIZE }]}>
            {files.map((file) => (
              <Text
                key={file}
                style={[
                  styles.coordLabel,
                  { width: SQUARE_SIZE, color: theme.coordinateColor },
                ]}
              >
                {file}
              </Text>
            ))}
          </View>
          {/* Rank labels (1-8) */}
          <View style={[styles.rankLabels, { height: BOARD_SIZE }]}>
            {ranks.map((rank) => (
              <Text
                key={rank}
                style={[
                  styles.coordLabel,
                  { height: SQUARE_SIZE, color: theme.coordinateColor },
                ]}
              >
                {rank}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  board: {
    borderWidth: 2,
    overflow: 'hidden',
    borderRadius: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  fileLabels: {
    flexDirection: 'row',
    marginTop: 4,
    paddingHorizontal: 0,
  },
  rankLabels: {
    position: 'absolute',
    left: -16,
    top: 0,
    justifyContent: 'flex-start',
  },
  coordLabel: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
});

export default memo(ChessBoard);
