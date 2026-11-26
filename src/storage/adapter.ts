/**
 * storage/adapter.ts
 * 
 * Drop-in AsyncStorage replacement using expo-file-system.
 * Works in Expo Go without any native module linking.
 * API matches AsyncStorage: getItem / setItem / removeItem
 */
import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_DIR = FileSystem.documentDirectory + 'chess_master_storage/';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(STORAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
  }
}

function keyToPath(key: string): string {
  // Sanitise key so it's a valid filename
  const safe = key.replace(/[^a-zA-Z0-9_@]/g, '_');
  return STORAGE_DIR + safe + '.json';
}

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      await ensureDir();
      const path = keyToPath(key);
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists) return null;
      return await FileSystem.readAsStringAsync(path);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await ensureDir();
      await FileSystem.writeAsStringAsync(keyToPath(key), value);
    } catch (e) {
      console.warn('[Storage] setItem failed:', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const path = keyToPath(key);
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) await FileSystem.deleteAsync(path);
    } catch {
      /* ignore */
    }
  },
};
