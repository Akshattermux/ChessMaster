import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { Piece as ChessPiece } from 'chess.js';

// Piece image map — using the new 3D realistic pieces
const PIECE_IMAGES: Record<string, Record<string, any>> = {
  w: {
    k: require('@/assets/play/white-king.jpg'),
    q: require('@/assets/play/white-queen.jpg'),
    r: require('@/assets/play/white-rook.jpg'),
    b: require('@/assets/play/white-bishop.jpg'),
    n: require('@/assets/play/white-knight.jpg'),
    p: require('@/assets/play/white-pawn.jpg'),
  },
  b: {
    k: require('@/assets/play/black-king.jpg'),
    q: require('@/assets/play/black-queen.jpg'),
    r: require('@/assets/play/black-rook.jpg'),
    b: require('@/assets/play/black-bishop.jpg'),
    n: require('@/assets/play/black-knight.jpg'),
    p: require('@/assets/play/black-pawn.jpg'),
  },
};

interface PieceProps {
  piece: ChessPiece;
  size: number;
  isSelected?: boolean;
}

function Piece({ piece, size, isSelected }: PieceProps) {
  const imageSource = PIECE_IMAGES[piece.color]?.[piece.type];
  if (!imageSource) return null;

  const padding = size * 0.05;
  const imageSize = size - padding * 2;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        isSelected && styles.selected,
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.image,
          { width: imageSize, height: imageSize },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  image: {
    // shadow for piece depth
  },
  selected: {
    transform: [{ scale: 1.1 }],
  },
});

export default memo(Piece);
