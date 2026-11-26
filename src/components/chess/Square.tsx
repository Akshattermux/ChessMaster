import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ChessSquare } from '@/src/engine/chessEngine';
import { BoardTheme } from '@/constants/boardThemes';
import Piece from './Piece';
import type { Piece as ChessPiece } from 'chess.js';

interface SquareProps {
  square: ChessSquare;
  piece: ChessPiece | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMoveFrom: boolean;
  isLastMoveTo: boolean;
  isCheck: boolean;
  theme: BoardTheme;
  onPress: (square: ChessSquare) => void;
  size: number;
}

function Square({
  square,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isLastMoveFrom,
  isLastMoveTo,
  isCheck,
  theme,
  onPress,
  size,
}: SquareProps) {
  const backgroundColor = isLight ? theme.lightSquare : theme.darkSquare;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(square)}
      style={[styles.square, { width: size, height: size, backgroundColor }]}
    >
      {/* Last move highlight */}
      {(isLastMoveFrom || isLastMoveTo) && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: isLastMoveFrom ? theme.lastMoveFrom : theme.lastMoveTo },
          ]}
        />
      )}

      {/* Selected highlight */}
      {isSelected && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: theme.selectedSquare },
          ]}
        />
      )}

      {/* Check highlight */}
      {isCheck && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: theme.checkSquare },
          ]}
        />
      )}

      {/* Piece */}
      {piece && <Piece piece={piece} size={size} isSelected={isSelected} />}

      {/* Legal move dot/ring */}
      {isLegalMove && (
        <View style={[StyleSheet.absoluteFillObject, styles.legalMoveOverlay]}>
          {piece ? (
            // Ring for capture
            <View
              style={[
                styles.captureRing,
                {
                  width: size - 4,
                  height: size - 4,
                  borderColor: theme.legalMove,
                  borderRadius: (size - 4) / 2,
                },
              ]}
            />
          ) : (
            // Dot for empty square
            <View
              style={[
                styles.legalMoveDot,
                {
                  width: size * 0.3,
                  height: size * 0.3,
                  borderRadius: (size * 0.3) / 2,
                  backgroundColor: theme.legalMove,
                },
              ]}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  square: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  legalMoveOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalMoveDot: {
    opacity: 0.7,
  },
  captureRing: {
    borderWidth: 4,
    opacity: 0.7,
  },
});

export default memo(Square);
