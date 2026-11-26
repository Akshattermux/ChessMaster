import { useState, useEffect, useCallback } from 'react';
import { AppSettings, loadSettings, saveSettings, DEFAULT_SETTINGS } from '@/src/storage/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const updated = await saveSettings({ [key]: value });
    setSettings(updated);
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = await saveSettings(updates);
    setSettings(updated);
  }, []);

  return { settings, isLoading, updateSetting, updateSettings };
}
