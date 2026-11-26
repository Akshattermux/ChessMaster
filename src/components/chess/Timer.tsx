import React, { memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { formatTime } from '@/src/engine/notation';
import { ChessColors } from '@/constants/theme';

interface TimerProps {
  whiteTime: number;
  blackTime: number;
  currentTurn: 'w' | 'b';
  isRunning: boolean;
  compact?: boolean;
}

function TimerBar({
  label,
  time,
  isActive,
  compact,
}: {
  label: string;
  time: number;
  isActive: boolean;
  compact?: boolean;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isLowTime = time <= 30 && time > 0;
  const isDanger = time <= 10 && time > 0;

  useEffect(() => {
    if (isActive && isDanger) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, isDanger, pulseAnim]);

  const timeColor = isDanger
    ? ChessColors.danger
    : isLowTime
    ? ChessColors.warning
    : isActive
    ? ChessColors.gold
    : ChessColors.textSecondary;

  return (
    <Animated.View
      style={[
        styles.timerBar,
        compact && styles.timerBarCompact,
        isActive && styles.timerBarActive,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <Text style={[styles.timerLabel, compact && styles.timerLabelCompact]}>
        {label}
      </Text>
      <Text
        style={[
          styles.timerTime,
          compact && styles.timerTimeCompact,
          { color: timeColor },
          isActive && styles.timerTimeActive,
        ]}
      >
        {formatTime(time)}
      </Text>
    </Animated.View>
  );
}

function Timer({ whiteTime, blackTime, currentTurn, isRunning, compact }: TimerProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <TimerBar
        label="⬜ White"
        time={whiteTime}
        isActive={currentTurn === 'w' && isRunning}
        compact={compact}
      />
      <TimerBar
        label="⬛ Black"
        time={blackTime}
        isActive={currentTurn === 'b' && isRunning}
        compact={compact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    gap: 8,
  },
  containerCompact: {
    paddingHorizontal: 4,
  },
  timerBar: {
    flex: 1,
    backgroundColor: ChessColors.surface,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ChessColors.textMuted,
  },
  timerBarCompact: {
    padding: 6,
    borderRadius: 8,
  },
  timerBarActive: {
    borderColor: ChessColors.gold,
    backgroundColor: ChessColors.surfaceElevated,
  },
  timerLabel: {
    fontSize: 12,
    color: ChessColors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  timerLabelCompact: {
    fontSize: 10,
  },
  timerTime: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  timerTimeCompact: {
    fontSize: 18,
  },
  timerTimeActive: {
    fontWeight: '800',
  },
});

export default memo(Timer);
