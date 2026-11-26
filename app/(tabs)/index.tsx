import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChessColors } from '@/constants/theme';
import { loadStats, GameStats, DEFAULT_STATS } from '@/src/storage/stats';
import { loadAllGames, SavedGame } from '@/src/storage/games';



export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [recentGame, setRecentGame] = useState<SavedGame | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Load data
    Promise.all([loadStats(), loadAllGames()]).then(([s, games]) => {
      setStats(s);
      setRecentGame(games[0] || null);
    });

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.logoText}>♔</Text>
          <Text style={styles.appName}>Chess Master</Text>
          <Text style={styles.tagline}>Play. Learn. Master.</Text>
        </Animated.View>



        {/* Quick Play Buttons */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Play</Text>
          <View style={styles.playButtons}>
            <TouchableOpacity
              style={[styles.playButton, styles.playButtonPrimary]}
              onPress={() => router.push('/game')}
              activeOpacity={0.8}
            >
              <Text style={styles.playButtonIcon}>👥</Text>
              <Text style={styles.playButtonTitle}>2 Players</Text>
              <Text style={styles.playButtonSub}>Local multiplayer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, styles.playButtonSecondary]}
              onPress={() => router.push('/game/ai')}
              activeOpacity={0.8}
            >
              <Text style={styles.playButtonIcon}>🤖</Text>
              <Text style={styles.playButtonTitle}>vs AI</Text>
              <Text style={styles.playButtonSub}>4 difficulty levels</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/puzzles')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonIcon}>🧩</Text>
              <Text style={styles.secondaryButtonText}>Puzzles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/game/analysis')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonIcon}>🔍</Text>
              <Text style={styles.secondaryButtonText}>Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/history')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonIcon}>📜</Text>
              <Text style={styles.secondaryButtonText}>History</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Card */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Games" value={stats.gamesPlayed.toString()} icon="🎮" />
            <StatCard label="Win Rate" value={`${winRate}%`} icon="📈" />
            <StatCard label="Best Streak" value={stats.bestWinStreak.toString()} icon="🔥" />
            <StatCard label="Puzzles" value={stats.puzzlesSolved.toString()} icon="🧩" />
          </View>
        </Animated.View>

        {/* Recent Game */}
        {recentGame && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Recent Game</Text>
            <TouchableOpacity
              style={styles.recentGameCard}
              onPress={() => router.push('/history')}
              activeOpacity={0.8}
            >
              <View style={styles.recentGameInfo}>
                <Text style={styles.recentGameVs}>
                  {recentGame.white} vs {recentGame.black}
                </Text>
                <Text style={styles.recentGameDate}>
                  {new Date(recentGame.date).toLocaleDateString()}
                </Text>
                <Text style={styles.recentGameMoves}>{recentGame.moves} moves</Text>
              </View>
              <View
                style={[
                  styles.recentGameResult,
                  recentGame.result === '1-0'
                    ? styles.resultWin
                    : recentGame.result === '0-1'
                    ? styles.resultLoss
                    : styles.resultDraw,
                ]}
              >
                <Text style={styles.recentGameResultText}>{recentGame.result}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChessColors.background,
  },
  scroll: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: ChessColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ChessColors.textMuted,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: ChessColors.gold,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: ChessColors.textSecondary,
    marginTop: 4,
    letterSpacing: 2,
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ChessColors.textPrimary,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  playButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  playButton: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  playButtonPrimary: {
    backgroundColor: ChessColors.goldDark,
    borderColor: ChessColors.gold,
  },
  playButtonSecondary: {
    backgroundColor: ChessColors.surface,
    borderColor: ChessColors.textMuted,
  },
  playButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  playButtonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: ChessColors.textPrimary,
    marginBottom: 2,
  },
  playButtonSub: {
    fontSize: 12,
    color: ChessColors.textSecondary,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: ChessColors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  secondaryButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  secondaryButtonText: {
    fontSize: 13,
    color: ChessColors.textSecondary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: ChessColors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: ChessColors.gold,
  },
  statLabel: {
    fontSize: 11,
    color: ChessColors.textSecondary,
    marginTop: 2,
  },
  recentGameCard: {
    backgroundColor: ChessColors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  recentGameInfo: {
    flex: 1,
  },
  recentGameVs: {
    fontSize: 16,
    fontWeight: '700',
    color: ChessColors.textPrimary,
    marginBottom: 4,
  },
  recentGameDate: {
    fontSize: 13,
    color: ChessColors.textSecondary,
  },
  recentGameMoves: {
    fontSize: 12,
    color: ChessColors.textMuted,
    marginTop: 2,
  },
  recentGameResult: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resultWin: { backgroundColor: '#1B3A1B' },
  resultLoss: { backgroundColor: '#3A1B1B' },
  resultDraw: { backgroundColor: '#2A2A1B' },
  recentGameResultText: {
    fontWeight: '700',
    fontFamily: 'monospace',
    color: ChessColors.gold,
    fontSize: 14,
  },
  bottomPad: {
    height: 20,
  },
});
