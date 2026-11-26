import React, { memo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { ChessColors } from '@/constants/theme';
import { PromotionPiece } from '@/src/hooks/useChessGame';

interface PromotionModalProps {
  visible: boolean;
  color: 'w' | 'b';
  onSelect: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES: { type: PromotionPiece; label: string }[] = [
  { type: 'q', label: 'Queen' },
  { type: 'r', label: 'Rook' },
  { type: 'b', label: 'Bishop' },
  { type: 'n', label: 'Knight' },
];

const PIECE_IMAGES: Record<string, Record<string, any>> = {
  w: {
    q: require('@/assets/play/white-queen.jpg'),
    r: require('@/assets/play/white-rook.jpg'),
    b: require('@/assets/play/white-bishop.jpg'),
    n: require('@/assets/play/white-knight.jpg'),
  },
  b: {
    q: require('@/assets/play/black-queen.jpg'),
    r: require('@/assets/play/black-rook.jpg'),
    b: require('@/assets/play/black-bishop.jpg'),
    n: require('@/assets/play/black-knight.jpg'),
  },
};

function PromotionModal({ visible, color, onSelect, onCancel }: PromotionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Pawn Promotion</Text>
          <Text style={styles.subtitle}>Choose a piece to promote to</Text>
          <View style={styles.pieces}>
            {PROMOTION_PIECES.map(({ type, label }) => (
              <TouchableOpacity
                key={type}
                style={styles.pieceButton}
                onPress={() => onSelect(type)}
                activeOpacity={0.7}
              >
                <Image
                  source={PIECE_IMAGES[color][type]}
                  style={styles.pieceImage}
                  resizeMode="contain"
                />
                <Text style={styles.pieceLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: ChessColors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: 320,
    borderWidth: 1,
    borderColor: ChessColors.gold,
    shadowColor: ChessColors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: ChessColors.gold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: ChessColors.textSecondary,
    marginBottom: 20,
  },
  pieces: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pieceButton: {
    alignItems: 'center',
    backgroundColor: ChessColors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    width: 64,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  pieceImage: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  pieceLabel: {
    fontSize: 11,
    color: ChessColors.textSecondary,
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  cancelText: {
    color: ChessColors.textSecondary,
    fontSize: 14,
  },
});

export default memo(PromotionModal);
