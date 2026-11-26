import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChessColors } from '@/constants/theme';
import { PUZZLES, Puzzle } from '@/constants/puzzles';

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

const FILTER_OPTIONS: { value: DifficultyFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🎯' },
  { value: 'beginner', label: 'Beginner', icon: '🐣' },
  { value: 'intermediate', label: 'Intermediate', icon: '⚡' },
  { value: 'advanced', label: 'Advanced', icon: '👑' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: ChessColors.success,
  intermediate: ChessColors.warning,
  advanced: ChessColors.danger,
};

export default function PuzzlesScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<DifficultyFilter>('all');

  const filtered = filter === 'all' ? PUZZLES : PUZZLES.filter((p) => p.difficulty === filter);

  const renderPuzzle = ({ item, index }: { item: Puzzle; index: number }) => {
    const diffColor = DIFFICULTY_COLORS[item.difficulty] || ChessColors.textSecondary;
    return (
      <TouchableOpacity
        style={styles.puzzleCard}
        onPress={() => router.push({ pathname: '/game/puzzle/[id]', params: { id: item.id } })}
        activeOpacity={0.8}
      >
        <View style={styles.puzzleLeft}>
          <Text style={styles.puzzleNumber}>#{PUZZLES.indexOf(item) + 1}</Text>
        </View>
        <View style={styles.puzzleInfo}>
          <Text style={styles.puzzleTitle}>{item.title}</Text>
          <Text style={styles.puzzleTheme}>{item.theme}</Text>
        </View>
        <View style={[styles.diffBadge, { borderColor: diffColor }]}>
          <Text style={[styles.diffText, { color: diffColor }]}>{item.difficulty}</Text>
        </View>
        <Text style={styles.puzzleArrow}>▶</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧩 Puzzles</Text>
        <Text style={styles.headerSub}>{filtered.length} puzzles</Text>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterIcon}>{f.icon}</Text>
            <Text
              style={[
                styles.filterLabel,
                filter === f.value && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Puzzle list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderPuzzle}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChessColors.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: ChessColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ChessColors.textMuted,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: ChessColors.gold },
  headerSub: { fontSize: 14, color: ChessColors.textSecondary, marginTop: 4 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: ChessColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ChessColors.textMuted,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ChessColors.surfaceElevated,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
    gap: 4,
  },
  filterChipActive: { borderColor: ChessColors.gold, backgroundColor: ChessColors.goldDark + '40' },
  filterIcon: { fontSize: 14 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: ChessColors.textSecondary },
  filterLabelActive: { color: ChessColors.gold },
  listContent: { padding: 12 },
  puzzleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ChessColors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
    gap: 12,
  },
  puzzleLeft: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ChessColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puzzleNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: ChessColors.gold,
  },
  puzzleInfo: { flex: 1 },
  puzzleTitle: { fontSize: 15, fontWeight: '700', color: ChessColors.textPrimary },
  puzzleTheme: { fontSize: 12, color: ChessColors.textSecondary, marginTop: 2 },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  diffText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  puzzleArrow: { fontSize: 14, color: ChessColors.textMuted },
  separator: { height: 8 },
});
