import React, { memo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Move } from 'chess.js';
import { buildPgnDisplay } from '@/src/engine/notation';
import { ChessColors } from '@/constants/theme';

interface MoveListProps {
  history: Move[];
  currentMoveIndex?: number;
  onMovePress?: (index: number) => void;
  compact?: boolean;
}

function MoveList({ history, currentMoveIndex, onMovePress, compact }: MoveListProps) {
  const pairs = buildPgnDisplay(history);

  if (pairs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Game moves will appear here</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={pairs}
      keyExtractor={(item) => item.number.toString()}
      horizontal={compact}
      style={styles.list}
      contentContainerStyle={compact ? styles.contentHorizontal : styles.contentVertical}
      renderItem={({ item }) => {
        const whiteIdx = (item.number - 1) * 2;
        const blackIdx = whiteIdx + 1;
        const isWhiteActive = currentMoveIndex === whiteIdx;
        const isBlackActive = currentMoveIndex === blackIdx;

        return (
          <View style={styles.row}>
            <Text style={styles.moveNumber}>{item.number}.</Text>
            <TouchableOpacity
              onPress={() => onMovePress?.(whiteIdx)}
              style={[styles.moveCell, isWhiteActive && styles.activeMoveCell]}
            >
              <Text style={[styles.moveText, isWhiteActive && styles.activeMoveText]}>
                {item.white}
              </Text>
            </TouchableOpacity>
            {item.black ? (
              <TouchableOpacity
                onPress={() => onMovePress?.(blackIdx)}
                style={[styles.moveCell, isBlackActive && styles.activeMoveCell]}
              >
                <Text style={[styles.moveText, isBlackActive && styles.activeMoveText]}>
                  {item.black}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.moveCell} />
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentVertical: {
    paddingBottom: 8,
  },
  contentHorizontal: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    color: ChessColors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  moveNumber: {
    width: 32,
    fontSize: 13,
    color: ChessColors.textMuted,
    fontWeight: '500',
  },
  moveCell: {
    minWidth: 64,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  activeMoveCell: {
    backgroundColor: ChessColors.goldDark,
  },
  moveText: {
    fontSize: 14,
    color: ChessColors.textPrimary,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  activeMoveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default memo(MoveList);
