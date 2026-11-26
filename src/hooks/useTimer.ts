import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialTime: number; // seconds
  enabled: boolean;
  currentTurn: 'w' | 'b';
  isGameOver: boolean;
  onTimeout?: (color: 'w' | 'b') => void;
}

interface UseTimerReturn {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (time?: number) => void;
}

export function useTimer({
  initialTime,
  enabled,
  currentTurn,
  isGameOver,
  onTimeout,
}: UseTimerOptions): UseTimerReturn {
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTurnRef = useRef(currentTurn);
  const isGameOverRef = useRef(isGameOver);

  // Keep refs in sync
  useEffect(() => { currentTurnRef.current = currentTurn; }, [currentTurn]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);

  useEffect(() => {
    if (isGameOver && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [isGameOver]);

  const tick = useCallback(() => {
    if (isGameOverRef.current) return;

    if (currentTurnRef.current === 'w') {
      setWhiteTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          onTimeout?.('w');
          return 0;
        }
        return prev - 1;
      });
    } else {
      setBlackTime((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          onTimeout?.('b');
          return 0;
        }
        return prev - 1;
      });
    }
  }, [onTimeout]);

  const startTimer = useCallback(() => {
    if (!enabled || isGameOver) return;
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [enabled, isGameOver, tick]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(
    (time?: number) => {
      pauseTimer();
      const t = time ?? initialTime;
      setWhiteTime(t);
      setBlackTime(t);
    },
    [initialTime, pauseTimer]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { whiteTime, blackTime, isRunning, startTimer, pauseTimer, resetTimer };
}
