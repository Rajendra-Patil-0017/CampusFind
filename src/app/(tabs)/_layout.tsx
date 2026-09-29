import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.select({ ios: 84, android: 64, default: 62 }),
          paddingBottom: Platform.select({ ios: 24, android: 10, default: 10 }),
          paddingTop: 8,
          elevation: 4,
          maxWidth: MaxContentWidth,
          width: '100%',
          alignSelf: 'center',
          ...(Platform.OS === 'web'
            ? ({
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderLeftColor: theme.border,
                borderRightColor: theme.border,
              } as any)
            : {}),
        },
        tabBarLabelStyle: {
          fontSize: Typography.xs,
          fontWeight: '600',
          letterSpacing: -0.1,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bulletin',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'newspaper' : 'newspaper-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={23}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-posts"
        options={{
          title: 'My Reports',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'file-tray-full' : 'file-tray-full-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
