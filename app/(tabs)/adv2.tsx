import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const CATEGORIES = ['All', 'Home', 'Apparel', 'Beauty & Wellness'] as const;

type Category = (typeof CATEGORIES)[number];

type ReelItem = {
  id: string;
  category: Category;
  type: 'image' | 'video';
  title: string;
  subtitle: string;
  brand: string;
  source: number;
};

const HOME_IMAGES = [
  require('@/assets/images/west-elm-herman-basket-woven.png'),
  require('@/assets/images/west-elm-sebastion.png'),
  require('@/assets/images/frama-table.png'),
  require('@/assets/images/metastudio.png'),
  require('@/assets/images/imakebook.png'),
];

const APPAREL_IMAGES = [
  require('@/assets/images/Corridor.png'),
  require('@/assets/images/nb-1960r.png'),
  require('@/assets/images/auter.png'),
  require('@/assets/images/latetowork.png'),
  require('@/assets/images/oas.png'),
];

const BEAUTY_IMAGES = [
  require('@/assets/images/aesop-soap.png'),
  require('@/assets/images/lelabo.png'),
  require('@/assets/images/salt&stone.png'),
  require('@/assets/images/snif-crumb.png'),
  require('@/assets/images/soosatelier.png'),
];

const IMAGE_SOURCES: Record<Category, number[]> = {
  All: [...HOME_IMAGES, ...APPAREL_IMAGES, ...BEAUTY_IMAGES],
  Home: HOME_IMAGES,
  Apparel: APPAREL_IMAGES,
  'Beauty & Wellness': BEAUTY_IMAGES,
};

const HOME_VIDEOS = [require('@/assets/vid/frama-farmhouse.mp4')];
const APPAREL_VIDEOS = [require('@/assets/vid/buckmason.mp4'), require('@/assets/vid/nothingsomething.mp4')];
const BEAUTY_VIDEOS = [
  require('@/assets/vid/snif.mp4'),
  require('@/assets/vid/aesop-fragrance.mp4'),
  require('@/assets/vid/elorea-city.mp4'),
  require('@/assets/vid/elorea-blue.mp4'),
];

const VIDEO_SOURCES: Record<Category, number[]> = {
  All: [...HOME_VIDEOS, ...APPAREL_VIDEOS, ...BEAUTY_VIDEOS],
  Home: HOME_VIDEOS,
  Apparel: APPAREL_VIDEOS,
  'Beauty & Wellness': BEAUTY_VIDEOS,
};

const TITLES = [
  'The Clark Sweater',
  'Studio Linen Shirt',
  'Midnight Runner',
  'Softline Hoodie',
  'Lakeview Jacket',
  'Atlas Tote',
  'Elorea Blue',
  'Expedition Bag',
];

const SUBTITLES = [
  'Refined layers for work and play.',
  'Lightweight and breathable for daily wear.',
  'Balanced cushioning with minimal profile.',
  'Relaxed fit with clean lines.',
  'Structured outerwear with subtle texture.',
  'Carry-everywhere canvas with leather trim.',
  'A refined sweater for work and play.',
  'Wear it to the office or a date.',
];

const BRANDS = ['ELOREA', 'NIKE', 'PYRA', 'MOD REF', 'OAKLEY', 'FRAMA', 'LE LABO', 'AESOP'];

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const buildInterleavedDeck = (images: number[], videos: number[]) => {
  const shuffledImages = shuffle(images);
  const shuffledVideos = shuffle(videos);
  const deck: { type: 'image' | 'video'; source: number }[] = [];
  let imageIndex = 0;
  let videoIndex = 0;
  let lastType: 'image' | 'video' | null = null;

  while (imageIndex < shuffledImages.length || videoIndex < shuffledVideos.length) {
    const remainingImages = shuffledImages.length - imageIndex;
    const remainingVideos = shuffledVideos.length - videoIndex;
    let nextType: 'image' | 'video';

    if (remainingImages === 0) {
      nextType = 'video';
    } else if (remainingVideos === 0) {
      nextType = 'image';
    } else if (lastType === 'image') {
      nextType = 'video';
    } else if (lastType === 'video') {
      nextType = 'image';
    } else {
      nextType = remainingImages >= remainingVideos ? 'image' : 'video';
    }

    if (nextType === 'image') {
      deck.push({ type: 'image', source: shuffledImages[imageIndex] });
      imageIndex += 1;
      lastType = 'image';
    } else {
      deck.push({ type: 'video', source: shuffledVideos[videoIndex] });
      videoIndex += 1;
      lastType = 'video';
    }
  }

  return deck;
};

const buildReelItems = (category: Category, count: number) => {
  const deck = buildInterleavedDeck(IMAGE_SOURCES[category], VIDEO_SOURCES[category]);
  const items: ReelItem[] = [];
  let deckIndex = 0;

  for (let index = 0; index < count; index += 1) {
    if (deckIndex >= deck.length) {
      deckIndex = 0;
    }
    const media = deck[deckIndex];
    deckIndex += 1;
    const title = TITLES[index % TITLES.length];
    const subtitle = SUBTITLES[index % SUBTITLES.length];
    const brand = BRANDS[index % BRANDS.length];

    items.push({
      id: `${category}-${index}`,
      category,
      type: media.type,
      source: media.source,
      title,
      subtitle,
      brand,
    });
  }

  return items;
};

export default function Adv2Screen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = CATEGORIES[activeIndex];
  const filterBarHeight = insets.top + 44;
  const reelHeight = Math.max(0, height - filterBarHeight);

  const reels = useMemo(() => buildReelItems(activeCategory, 12), [activeCategory]);

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <View className="absolute left-0 right-0 top-0 z-10 bg-black">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View
            className="flex-row items-center gap-8 px-6 pb-4"
            style={{ paddingTop: insets.top + 6 }}>
            {CATEGORIES.map((label, index) => {
              const isActive = index === activeIndex;
              return (
                <Pressable key={label} onPress={() => setActiveIndex(index)}>
                  <ThemedText
                    className="text-[12px] font-semibold"
                    numberOfLines={1}
                    style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}>
                    {label.toUpperCase()}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={reelHeight}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="fast"
        contentContainerStyle={{ paddingTop: filterBarHeight }}
        getItemLayout={(_, index) => ({
          length: reelHeight,
          offset: filterBarHeight + reelHeight * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={{ height: reelHeight }}>
            {item.type === 'image' ? (
              <Image source={item.source} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Video
                source={item.source}
                style={{ width: '100%', height: '100%' }}
                resizeMode={ResizeMode.COVER}
                isMuted
                isLooping
                shouldPlay
              />
            )}
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-10">
              <View className="mb-2 flex-row items-center gap-3">
                <ThemedText className="text-[13px] font-semibold text-white">{item.title}</ThemedText>
                <View className="h-1.5 w-1.5 rounded-full bg-white/60" />
                <ThemedText className="text-[12px] text-white/80">4.2 (762)</ThemedText>
              </View>
              <ThemedText className="text-[12px] text-white/80">{item.subtitle}</ThemedText>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
