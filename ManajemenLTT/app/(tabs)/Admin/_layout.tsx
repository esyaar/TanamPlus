import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { FontAwesome6, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Lexend: require('@/assets/fonts/Lexend.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        tabBarIconStyle: {
          marginBottom: -10, 
          top: '5%',       // Vertikal 
          transform: [
            { translateX: 0 },  
            { translateY: -13 }, 
          ],
        },
      }}
    >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="wilayahkerja"
          options={{
            title: 'Wilayah',
            tabBarIcon: ({ color }) => <MaterialIcons name="people-alt" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: 'User',
            tabBarIcon: ({ color }) => <FontAwesome6 name="user-gear" size={24} color={color} />,
          }}
        />
      </Tabs>

  );
}
