import { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const CATEGORIES = ['All', 'Home', 'Apparel', 'Beauty & Wellness'] as const;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleMomentumEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex flex-row w-full items-center justify-between gap-6 border-b border-zinc-200 px-6 pb-4 pt-4">
        {CATEGORIES.map((label, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable key={label} onPress={() => handleTabPress(index)}>
              <ThemedText
                className="text-[14px] font-medium"
                numberOfLines={1}
                style={{ color: isActive ? '#111827' : '#9CA3AF' }}>
                {label.toUpperCase()}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
