import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D4A853',
        tabBarInactiveTintColor: '#6B5A3E',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#161B22',
          borderTopColor: '#2D2416',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="♟" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Play',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="⚔️" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="puzzles"
        options={{
          title: 'Puzzles',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="🧩" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="📜" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="⚙️" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color, size }: { emoji: string; color: string; size: number }) {
  const { Text } = require('react-native');
  return (
    <Text style={{ fontSize: size * 0.8, opacity: color === '#D4A853' ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}
