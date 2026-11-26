import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChessColors } from '@/constants/theme';
import { AIDifficulty } from '@/src/engine/aiEngine';
import { TimerPreset } from '@/src/storage/settings';
import { useSettings } from '@/src/hooks/useSettings';

const DIFFICULTIES: { value: AIDifficulty; label: string; desc: string; icon: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Random moves', icon: '🐣' },
  { value: 'medium', label: 'Medium', desc: 'Minimax depth 2', icon: '🎯' },
  { value: 'hard', label: 'Hard', desc: 'Minimax depth 3', icon: '⚡' },
  { value: 'master', label: 'Master', desc: 'Minimax depth 4', icon: '👑' },
];

const TIMER_PRESETS: { value: TimerPreset; label: string }[] = [
  { value: 60, label: '1 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
  { value: 900, label: '15 min' },
  { value: 1800, label: '30 min' },
];

export default function PlayScreen() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>New Game</Text>

        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Game Mode</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, styles.modeButtonPrimary]}
              onPress={() =>
                router.push({
                  pathname: '/game',
                  params: {
                    timer: settings.timerEnabled ? settings.timerPreset : 0,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.modeIcon}>👥</Text>
              <Text style={styles.modeTitle}>2 Players</Text>
              <Text style={styles.modeDesc}>Local multiplayer on same device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, styles.modeButtonSecondary]}
              onPress={() =>
                router.push({
                  pathname: '/game/ai',
                  params: {
                    difficulty: settings.aiDifficulty,
                    playerColor: selectedColor === 'random'
                      ? Math.random() > 0.5 ? 'w' : 'b'
                      : selectedColor,
                    timer: settings.timerEnabled ? settings.timerPreset : 0,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.modeIcon}>🤖</Text>
              <Text style={styles.modeTitle}>vs AI</Text>
              <Text style={styles.modeDesc}>Challenge the computer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Difficulty */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI Difficulty</Text>
          <View style={styles.difficultyGrid}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[
                  styles.difficultyCard,
                  settings.aiDifficulty === d.value && styles.difficultyCardActive,
                ]}
                onPress={() => updateSetting('aiDifficulty', d.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.difficultyIcon}>{d.icon}</Text>
                <Text
                  style={[
                    styles.difficultyLabel,
                    settings.aiDifficulty === d.value && styles.difficultyLabelActive,
                  ]}
                >
                  {d.label}
                </Text>
                <Text style={styles.difficultyDesc}>{d.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Play as */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Play as</Text>
          <View style={styles.colorRow}>
            {(['w', 'random', 'b'] as const).map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorButton,
                  selectedColor === c && styles.colorButtonActive,
                ]}
                onPress={() => setSelectedColor(c)}
                activeOpacity={0.8}
              >
                <Text style={styles.colorIcon}>
                  {c === 'w' ? '♔' : c === 'b' ? '♚' : '🎲'}
                </Text>
                <Text style={styles.colorLabel}>
                  {c === 'w' ? 'White' : c === 'b' ? 'Black' : 'Random'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timer */}
        <View style={styles.section}>
          <View style={styles.timerHeader}>
            <Text style={styles.sectionLabel}>Time Control</Text>
            <TouchableOpacity
              onPress={() => updateSetting('timerEnabled', !settings.timerEnabled)}
              style={[styles.toggle, settings.timerEnabled && styles.toggleActive]}
            >
              <View style={[styles.toggleThumb, settings.timerEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {settings.timerEnabled && (
            <View style={styles.timerPresets}>
              {TIMER_PRESETS.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.timerChip,
                    settings.timerPreset === t.value && styles.timerChipActive,
                  ]}
                  onPress={() => updateSetting('timerPreset', t.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.timerChipText,
                      settings.timerPreset === t.value && styles.timerChipTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChessColors.background },
  scroll: { padding: 16, paddingTop: 56 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: ChessColors.gold,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ChessColors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  modeRow: { flexDirection: 'row', gap: 12 },
  modeButton: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  modeButtonPrimary: {
    backgroundColor: ChessColors.goldDark,
    borderColor: ChessColors.gold,
  },
  modeButtonSecondary: {
    backgroundColor: ChessColors.surface,
    borderColor: ChessColors.textMuted,
  },
  modeIcon: { fontSize: 32, marginBottom: 8 },
  modeTitle: { fontSize: 16, fontWeight: '700', color: ChessColors.textPrimary, marginBottom: 4 },
  modeDesc: { fontSize: 12, color: ChessColors.textSecondary, textAlign: 'center' },
  difficultyGrid: { flexDirection: 'row', gap: 10 },
  difficultyCard: {
    flex: 1,
    backgroundColor: ChessColors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  difficultyCardActive: {
    borderColor: ChessColors.gold,
    backgroundColor: ChessColors.surfaceElevated,
  },
  difficultyIcon: { fontSize: 22, marginBottom: 4 },
  difficultyLabel: { fontSize: 13, fontWeight: '700', color: ChessColors.textSecondary, marginBottom: 2 },
  difficultyLabelActive: { color: ChessColors.gold },
  difficultyDesc: { fontSize: 10, color: ChessColors.textMuted, textAlign: 'center' },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorButton: {
    flex: 1,
    backgroundColor: ChessColors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  colorButtonActive: { borderColor: ChessColors.gold, backgroundColor: ChessColors.surfaceElevated },
  colorIcon: { fontSize: 28, marginBottom: 6 },
  colorLabel: { fontSize: 13, fontWeight: '600', color: ChessColors.textSecondary },
  timerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: ChessColors.textMuted,
    padding: 3,
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: ChessColors.gold },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: { alignSelf: 'flex-end' },
  timerPresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ChessColors.surface,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  timerChipActive: { borderColor: ChessColors.gold, backgroundColor: ChessColors.surfaceElevated },
  timerChipText: { fontSize: 14, color: ChessColors.textSecondary, fontWeight: '600' },
  timerChipTextActive: { color: ChessColors.gold },
});
