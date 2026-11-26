import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { ChessColors } from '@/constants/theme';
import { BOARD_THEMES, BoardThemeName } from '@/constants/boardThemes';
import { useSettings } from '@/src/hooks/useSettings';
import { resetStats } from '@/src/storage/stats';
import { clearAllGames } from '@/src/storage/games';
import { resetSettings } from '@/src/storage/settings';
import { AIDifficulty } from '@/src/engine/aiEngine';
import { TimerPreset } from '@/src/storage/settings';

const THEMES: { value: BoardThemeName; label: string; icon: string }[] = [
  { value: 'classic', label: 'Classic', icon: '♟' },
  { value: 'wood', label: 'Wood', icon: '🪵' },
  { value: 'dark', label: 'Dark', icon: '🌑' },
  { value: 'blue', label: 'Ocean', icon: '🌊' },
  { value: 'green', label: 'Forest', icon: '🌲' },
];

const DIFFICULTIES: { value: AIDifficulty; label: string }[] = [
  { value: 'easy', label: '🐣 Easy' },
  { value: 'medium', label: '🎯 Medium' },
  { value: 'hard', label: '⚡ Hard' },
  { value: 'master', label: '👑 Master' },
];

const TIMER_OPTIONS: { value: TimerPreset; label: string }[] = [
  { value: 60, label: '1 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
  { value: 900, label: '15 min' },
  { value: 1800, label: '30 min' },
];

export default function SettingsScreen() {
  const { settings, updateSetting, updateSettings } = useSettings();
  const [showChessTerms, setShowChessTerms] = useState(false);

  const handleResetStats = () => {
    Alert.alert('Reset Statistics', 'This will clear all your game statistics. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetStats();
          Alert.alert('Done', 'Statistics have been reset.');
        },
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert('Clear History', 'This will delete all saved games. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearAllGames();
          Alert.alert('Done', 'Game history cleared.');
        },
      },
    ]);
  };

  const handleResetAll = () => {
    Alert.alert(
      'Reset Everything',
      'This will reset all settings, stats, and game history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            await Promise.all([resetStats(), clearAllGames(), resetSettings()]);
            Alert.alert('Done', 'Everything has been reset.');
          },
        },
      ]
    );
  };

  const currentTheme = BOARD_THEMES[settings.boardTheme];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>

        {/* Board Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Board Theme</Text>

          {/* Board Preview */}
          <View style={styles.boardPreview}>
            {[0, 1, 2, 3].map((row) => (
              <View key={row} style={styles.previewRow}>
                {[0, 1, 2, 3].map((col) => (
                  <View
                    key={col}
                    style={[
                      styles.previewCell,
                      (row + col) % 2 === 0
                        ? { backgroundColor: currentTheme.lightSquare }
                        : { backgroundColor: currentTheme.darkSquare },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          <View style={styles.themeGrid}>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.themeCard,
                  settings.boardTheme === t.value && styles.themeCardActive,
                ]}
                onPress={() => updateSetting('boardTheme', t.value)}
                activeOpacity={0.8}
              >
                <View style={styles.themeColors}>
                  <View
                    style={[
                      styles.themeColorSwatch,
                      { backgroundColor: BOARD_THEMES[t.value].lightSquare },
                    ]}
                  />
                  <View
                    style={[
                      styles.themeColorSwatch,
                      { backgroundColor: BOARD_THEMES[t.value].darkSquare },
                    ]}
                  />
                </View>
                <Text style={styles.themeIcon}>{t.icon}</Text>
                <Text
                  style={[
                    styles.themeLabel,
                    settings.boardTheme === t.value && styles.themeLabelActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Difficulty */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Default AI Difficulty</Text>
          <View style={styles.chipRow}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[
                  styles.chip,
                  settings.aiDifficulty === d.value && styles.chipActive,
                ]}
                onPress={() => updateSetting('aiDifficulty', d.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    settings.aiDifficulty === d.value && styles.chipTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timer */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Default Timer</Text>
          <View style={styles.chipRow}>
            {TIMER_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.chip,
                  settings.timerPreset === t.value && styles.chipActive,
                ]}
                onPress={() => updateSetting('timerPreset', t.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    settings.timerPreset === t.value && styles.chipTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toggle Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.toggleList}>
            <ToggleRow
              label="Show Coordinates"
              value={settings.showCoordinates}
              onToggle={(v) => updateSetting('showCoordinates', v)}
            />
            <ToggleRow
              label="Show Legal Moves"
              value={settings.showLegalMoves}
              onToggle={(v) => updateSetting('showLegalMoves', v)}
            />
            <ToggleRow
              label="Auto-Promote to Queen"
              value={settings.autoPromoteToQueen}
              onToggle={(v) => updateSetting('autoPromoteToQueen', v)}
            />
            <ToggleRow
              label="Haptic Feedback"
              value={settings.hapticsEnabled}
              onToggle={(v) => updateSetting('hapticsEnabled', v)}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Data</Text>
          <View style={styles.dataButtons}>
            <TouchableOpacity
              style={[styles.dataBtn, styles.dataBtnWarning]}
              onPress={handleResetStats}
              activeOpacity={0.8}
            >
              <Text style={styles.dataBtnText}>Reset Statistics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dataBtn, styles.dataBtnWarning]}
              onPress={handleClearHistory}
              activeOpacity={0.8}
            >
              <Text style={styles.dataBtnText}>Clear Game History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dataBtn, styles.dataBtnDanger]}
              onPress={handleResetAll}
              activeOpacity={0.8}
            >
              <Text style={[styles.dataBtnText, { color: ChessColors.danger }]}>
                Reset Everything
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info & Legal */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>♔ Chess Master</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          
          <TouchableOpacity 
            onPress={() => Linking.openURL('http://axionik.friendsbook.co.in/')}
            style={styles.linkContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.appInfoDescLink}>BY Axionik-Friendsbook</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity 
            onPress={() => setShowChessTerms(true)}
            style={styles.legalBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.legalBtnText}>📜 Chess Game Rules & Terms</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => Linking.openURL('https://terms-conditions-axionik.friendsbook.co.in/')}
            style={styles.legalBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.legalBtnText}>🔗 Axionik Terms & Conditions</Text>
          </TouchableOpacity>
        </View>

        {/* Chess Rules & Terms Modal */}
        <Modal
          visible={showChessTerms}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => setShowChessTerms(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>📜 Chess Rules & Terms</Text>
                <TouchableOpacity onPress={() => setShowChessTerms(false)} style={styles.closeBtn} activeOpacity={0.7}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.termsSectionTitle}>1. Standard Chess Rules</Text>
                <Text style={styles.termsText}>
                  This game follows standard chess rules. Each player starts with 16 pieces: 1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights, and 8 Pawns.
                </Text>
                <Text style={styles.termsText}>
                  • <Text style={styles.bold}>Castling</Text>: A special move involving the King and a Rook, allowed only if neither piece has moved, the path between them is clear, and the King is not currently in, nor passes through, check.
                </Text>
                <Text style={styles.termsText}>
                  • <Text style={styles.bold}>En Passant</Text>: A special pawn capture that can only occur immediately after a pawn makes a double-step move from its starting square.
                </Text>
                <Text style={styles.termsText}>
                  • <Text style={styles.bold}>Promotion</Text>: When a pawn reaches the eighth rank, it must be promoted to a Queen, Rook, Bishop, or Knight of the same color.
                </Text>

                <Text style={styles.termsSectionTitle}>2. Game Outcomes</Text>
                <Text style={styles.termsText}>
                  • <Text style={styles.bold}>Checkmate</Text>: The King is under attack and has no legal moves to escape. This is a win for the attacking player.
                </Text>
                <Text style={styles.termsText}>
                  • <Text style={styles.bold}>Stalemate</Text>: The player whose turn it is has no legal moves and their King is not in check. The game ends in a draw.
                </Text>
                <Text style={styles.termsText}>
                  • <Text style={styles.bold}>Draw by Repetition</Text>: If the exact same position occurs three times in a game.
                </Text>

                <Text style={styles.termsSectionTitle}>3. Fair Play & Conduct</Text>
                <Text style={styles.termsText}>
                  Please respect your opponent. The undo function is provided for casual practice and offline learning only. Using external chess engines or assistance during human-versus-human matches is considered cheating and goes against fair play principles.
                </Text>
                <Text style={styles.termsText}>
                  By playing, you agree to play honorably and enjoy the classic game of chess!
                </Text>
                <View style={{ height: 24 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: ChessColors.textMuted, true: ChessColors.goldDark }}
        thumbColor={value ? ChessColors.gold : '#999'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChessColors.background },
  scroll: { padding: 16, paddingTop: 56 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: ChessColors.gold, marginBottom: 24 },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: ChessColors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  boardPreview: {
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ChessColors.textMuted,
  },
  previewRow: { flexDirection: 'row' },
  previewCell: { width: 32, height: 32 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: {
    backgroundColor: ChessColors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
    minWidth: '18%',
    flex: 1,
  },
  themeCardActive: { borderColor: ChessColors.gold, backgroundColor: ChessColors.surfaceElevated },
  themeColors: { flexDirection: 'row', marginBottom: 6 },
  themeColorSwatch: { width: 14, height: 14, borderRadius: 2 },
  themeIcon: { fontSize: 18, marginBottom: 4 },
  themeLabel: { fontSize: 11, color: ChessColors.textSecondary, fontWeight: '600' },
  themeLabelActive: { color: ChessColors.gold },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: ChessColors.surface,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  chipActive: { borderColor: ChessColors.gold, backgroundColor: ChessColors.surfaceElevated },
  chipText: { fontSize: 13, color: ChessColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: ChessColors.gold },
  toggleList: {
    backgroundColor: ChessColors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: ChessColors.textMuted,
  },
  toggleLabel: { fontSize: 15, color: ChessColors.textPrimary, fontWeight: '500' },
  dataButtons: { gap: 10 },
  dataBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  dataBtnWarning: { borderColor: ChessColors.warning + '80', backgroundColor: ChessColors.surface },
  dataBtnDanger: { borderColor: ChessColors.danger + '80', backgroundColor: ChessColors.surface },
  dataBtnText: { fontSize: 15, fontWeight: '600', color: ChessColors.warning },
  appInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: ChessColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  appInfoTitle: { fontSize: 20, fontWeight: '800', color: ChessColors.gold },
  appInfoVersion: { fontSize: 14, color: ChessColors.textSecondary, marginTop: 4 },
  linkContainer: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#1C2128',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  appInfoDescLink: {
    fontSize: 13,
    fontWeight: '700',
    color: ChessColors.gold,
    textDecorationLine: 'underline',
  },
  separator: {
    height: 1,
    backgroundColor: ChessColors.textMuted,
    width: '80%',
    marginVertical: 12,
  },
  legalBtn: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1C2128',
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#30363D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: ChessColors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: ChessColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ChessColors.textMuted,
    backgroundColor: '#161B22',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ChessColors.gold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#30363D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#E8DCC8',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  termsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ChessColors.gold,
    marginTop: 16,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: ChessColors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: ChessColors.textPrimary,
  },
});
