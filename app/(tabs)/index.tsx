import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const CATEGORIES = ['All', 'Home', 'Apparel', 'Beauty & Wellness'] as const;

type Category = (typeof CATEGORIES)[number];

type FeedItem = {
  id: string;
  category: Category;
  type: 'image' | 'video';
  title: string;
  subtitle: string;
  source: string;
};

const IMAGE_SOURCES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
];

const VIDEO_SOURCES = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

const TITLES = [
  'The Clark Sweater',
  'Studio Linen Shirt',
  'Midnight Runner',
  'Softline Hoodie',
  'Lakeview Jacket',
  'Atlas Tote',
];

const SUBTITLES = [
  'Refined layers for work and play.',
  'Lightweight and breathable for daily wear.',
  'Balanced cushioning with minimal profile.',
  'Relaxed fit with clean lines.',
  'Structured outerwear with subtle texture.',
  'Carry-everywhere canvas with leather trim.',
];

const createBatch = (category: Category, offset: number, count: number): FeedItem[] => {
  return Array.from({ length: count }, (_, index) => {
    const position = offset + index;
    const isVideo = position % 4 === 0;
    const title = TITLES[position % TITLES.length];
    const subtitle = SUBTITLES[position % SUBTITLES.length];
    const source = isVideo
      ? VIDEO_SOURCES[position % VIDEO_SOURCES.length]
      : IMAGE_SOURCES[position % IMAGE_SOURCES.length];

    return {
      id: `${category}-${position}`,
      category,
      type: isVideo ? 'video' : 'image',
      title,
      subtitle,
      source,
    };
  });
};

const INITIAL_BATCH = 6;
const NEXT_BATCH = 4;

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = CATEGORIES[activeIndex];

  const [feeds, setFeeds] = useState<Record<Category, FeedItem[]>>(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category] = createBatch(category, 0, INITIAL_BATCH);
      return acc;
    }, {} as Record<Category, FeedItem[]>);
  });

  const data = useMemo(() => feeds[activeCategory], [feeds, activeCategory]);

  return (
    <SafeAreaView className="flex-1">
      <View className="border-b border-zinc-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center gap-8 px-6 pb-4 pt-4">
            {CATEGORIES.map((label, index) => {
              const isActive = index === activeIndex;
              return (
                <Pressable
                  key={label}
                  onPress={() => setActiveIndex(index)}>
                  <ThemedText
                    className="text-[12px] font-medium"
                    numberOfLines={1}
                    style={{ color: isActive ? '#111827' : '#9CA3AF' }}>
                    {label.toUpperCase()}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          setFeeds((prev) => {
            const current = prev[activeCategory];
            const nextItems = createBatch(activeCategory, current.length, NEXT_BATCH);
            return { ...prev, [activeCategory]: [...current, ...nextItems] };
          });
        }}
        renderItem={({ item }) => (
          <View className="mb-8">
            <View className="w-full overflow-hidden rounded-lg bg-zinc-100" style={{ aspectRatio: 4 / 5 }}>
              {item.type === 'image' ? (
                <Image source={{ uri: item.source }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              ) : (
                <Video
                  source={{ uri: item.source }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode={ResizeMode.COVER}
                  isMuted
                  isLooping
                  shouldPlay
                />
              )}
            </View>
            <View className="mt-3">
              <ThemedText className="text-[16px] font-semibold" style={{ color: '#111827' }}>
                {item.title}
              </ThemedText>
              <ThemedText className="mt-1 text-[13px]" style={{ color: '#6B7280' }}>
                {item.subtitle}
              </ThemedText>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
