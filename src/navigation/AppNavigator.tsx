import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Colors, Typography, MIN_TOUCH_TARGET } from '../theme/oneUI';
import type { RootStackParamList, TabParamList } from '../types/fuel';
import HomeScreen    from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DetailScreen  from '../screens/DetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

// ─── Tab bar icon helper (using text emoji as lightweight icons) ──────────────
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.outlineVariant,
          borderTopWidth: 1,
          height: MIN_TOUCH_TARGET + 12,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        tabBarLabelStyle: {
          ...Typography.labelMedium,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Prices',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⛽" focused={focused} />,
          tabBarAccessibilityLabel: 'Current fuel prices',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />,
          tabBarAccessibilityLabel: 'Price history charts',
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root stack — Detail is pushed over the tab bar ──────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ headerShown: true, headerBackTitle: 'Back' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
