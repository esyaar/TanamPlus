import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
          marginBottom: -15, 
          top: '5%',       
          transform: [
            { translateX: 0 },  
            { translateY: -16 }, 
          ],
        },
      }}
    >
        <Tabs.Screen
          name="dbkepala"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="view-dashboard" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="wkkepala"
          options={{
            title: 'Wilayah',
            tabBarIcon: ({ color }) => <MaterialIcons name="people-alt" size={24} color={color} />,
          }}
        />
    </Tabs>
  );
}
