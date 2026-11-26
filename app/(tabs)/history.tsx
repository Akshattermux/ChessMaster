import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChessColors } from '@/constants/theme';
import { loadAllGames, deleteGame, SavedGame } from '@/src/storage/games';

function formatResult(result: string): { label: string; color: string } {
  if (result === '1-0') return { label: 'White Wins', color: ChessColors.success };
  if (result === '0-1') return { label: 'Black Wins', color: '#8888FF' };
  if (result === '1/2-1/2') return { label: 'Draw', color: ChessColors.warning };
  return { label: 'Ongoing', color: ChessColors.textMuted };
}

export default function HistoryScreen() {
  const router = useRouter();
  const [games, setGames] = useState<SavedGame[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGames = useCallback(async () => {
    const g = await loadAllGames();
    setGames(g);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGames();
    }, [fetchGames])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGames();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Game', 'Are you sure you want to delete this game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGame(id);
          fetchGames();
        },
      },
    ]);
  };

  const renderGame = ({ item }: { item: SavedGame }) => {
    const { label: resultLabel, color: resultColor } = formatResult(item.result);
    const date = new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() =>
          router.push({
            pathname: '/game/analysis',
            params: { pgn: item.pgn, fen: item.fen },
          })
        }
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.8}
        delayLongPress={600}
      >
        <View style={styles.gameHeader}>
          <Text style={styles.gameVs}>
            {item.white} <Text style={styles.vsText}>vs</Text> {item.black}
          </Text>
          <View style={[styles.resultBadge, { borderColor: resultColor }]}>
            <Text style={[styles.resultText, { color: resultColor }]}>{item.result}</Text>
          </View>
        </View>

        <View style={styles.gameMeta}>
          <Text style={styles.metaItem}>📅 {date}</Text>
          <Text style={styles.metaItem}>♟ {item.moves} moves</Text>
          <Text style={styles.metaItem}>
            {item.mode === 'ai' ? `🤖 ${item.aiDifficulty || 'AI'}` : '👥 2P'}
          </Text>
          {item.timeControl && item.timeControl !== 'None' && (
            <Text style={styles.metaItem}>⏱ {item.timeControl}</Text>
          )}
        </View>

        <Text style={styles.resultLabel}>{resultLabel}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📜 History</Text>
        <Text style={styles.headerSub}>{games.length} games saved</Text>
      </View>

      {games.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>♟</Text>
          <Text style={styles.emptyTitle}>No games yet</Text>
          <Text style={styles.emptyText}>
            Play a game and save it — it will appear here for analysis
          </Text>
          <TouchableOpacity
            style={styles.playNowBtn}
            onPress={() => router.push('/play')}
            activeOpacity={0.8}
          >
            <Text style={styles.playNowText}>Play Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={renderGame}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={ChessColors.gold}
            />
          }
          ListFooterComponent={() => (
            <Text style={styles.footer}>Long-press a game to delete it</Text>
          )}
        />
      )}
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
  listContent: { padding: 12 },
  gameCard: {
    backgroundColor: ChessColors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gameVs: { fontSize: 15, fontWeight: '700', color: ChessColors.textPrimary, flex: 1 },
  vsText: { fontWeight: '400', color: ChessColors.textSecondary },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  resultText: { fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
  gameMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  metaItem: { fontSize: 12, color: ChessColors.textSecondary },
  resultLabel: { fontSize: 13, color: ChessColors.textMuted, fontWeight: '500' },
  separator: { height: 8 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: ChessColors.textPrimary, marginBottom: 8 },
  emptyText: {
    fontSize: 15,
    color: ChessColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  playNowBtn: {
    backgroundColor: ChessColors.goldDark,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  playNowText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  footer: {
    textAlign: 'center',
    color: ChessColors.textMuted,
    fontSize: 12,
    padding: 16,
    fontStyle: 'italic',
  },
});
