import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';

const ICON_SIZE = 20;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingTop: 12,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="adv2"
        options={{
          title: 'Adv2',
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            paddingTop: 12,
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: '#000000',
          },
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/ad.png')}
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
              tintColor={color}
              contentFit="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/cube-of-notes-stack (1).svg')}
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
              tintColor={color}
              contentFit="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={ICON_SIZE} />,
        }}
      />
    </Tabs>
  );
}
