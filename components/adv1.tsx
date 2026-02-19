import { ResizeMode, Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import PagerView from 'react-native-pager-view';
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
  source: string | number;
};

type MediaSource = {
  type: 'image' | 'video';
  source: number;
};

type MediaDeckState = {
  deck: MediaSource[];
  index: number;
};

const resolveSource = (source: string | number) => {
  return typeof source === 'string' ? { uri: source } : source;
};

const HOME_IMAGES = [
  require('@/assets/images/west-elm-herman-basket-woven.png'),
  require('@/assets/images/west-elm-sebastion.png'),
  require('@/assets/images/frama-table.png'),
  require('@/assets/images/metastudio.png'),
  require('@/assets/images/imakebook.png'),
];

const APPAREL_IMAGES = [
  require('@/assets/images/Nike - Nike Stride.png'),
  require('@/assets/images/Nike - Sabrina 3 "Warnign Label".png'),
  require('@/assets/images/Nike Free Metcon 6 SE.png'),
  require('@/assets/images/ON - Cloud 6.png'),
  require('@/assets/images/ON - Club Collective-T Geo.png'),
  require('@/assets/images/ON - The Roger Pro Fire.png'),
  require('@/assets/images/Mod Ref - The Colin Top.png'),
  require('@/assets/images/Mod Ref - The Dominic Shirt.png'),
  require('@/assets/images/Mod Ref - The Jeremy Top.png'),
  require('@/assets/images/Buck Mason - Cloudloom Cotton Wool Carry-on Jacket.png'),
  require('@/assets/images/Buck Mason - Japanese Twill Belted-Back Chore Jacket.png'),
  require("@/assets/images/Buck Mason - Old Herc' Denim Work Shirt.png"),
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
];

const SUBTITLES = [
  'Refined layers for work and play.',
  'Lightweight and breathable for daily wear.',
  'Balanced cushioning with minimal profile.',
  'Relaxed fit with clean lines.',
  'Structured outerwear with subtle texture.',
  'Carry-everywhere canvas with leather trim.',
];

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
  const deck: MediaSource[] = [];
  let imageIndex = 0;
  let videoIndex = 0;
  let lastType: MediaSource['type'] | null = null;

  while (imageIndex < shuffledImages.length || videoIndex < shuffledVideos.length) {
    const remainingImages = shuffledImages.length - imageIndex;
    const remainingVideos = shuffledVideos.length - videoIndex;
    let nextType: MediaSource['type'];

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

const INITIAL_BATCH = 6;
const NEXT_BATCH = 4;

export default function Adv1() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const mediaDecksRef = useRef<Record<Category, MediaDeckState> | null>(null);

  if (!mediaDecksRef.current) {
    mediaDecksRef.current = CATEGORIES.reduce((acc, category) => {
      acc[category] = {
        deck: buildInterleavedDeck(IMAGE_SOURCES[category], VIDEO_SOURCES[category]),
        index: 0,
      };
      return acc;
    }, {} as Record<Category, MediaDeckState>);
  }

  const getNextMedia = (category: Category) => {
    const deckState = mediaDecksRef.current?.[category];
    if (!deckState) {
      return { type: 'image' as const, source: IMAGE_SOURCES[category][0] };
    }
    if (deckState.deck.length === 0) {
      return { type: 'image' as const, source: IMAGE_SOURCES[category][0] };
    }
    if (deckState.index >= deckState.deck.length) {
      deckState.deck = buildInterleavedDeck(IMAGE_SOURCES[category], VIDEO_SOURCES[category]);
      deckState.index = 0;
    }
    const media = deckState.deck[deckState.index];
    deckState.index += 1;
    return media;
  };

  const createBatch = (category: Category, offset: number, count: number): FeedItem[] => {
    return Array.from({ length: count }, (_, index) => {
      const position = offset + index;
      const title = TITLES[position % TITLES.length];
      const subtitle = SUBTITLES[position % SUBTITLES.length];
      const media = getNextMedia(category);

      return {
        id: `${category}-${position}`,
        category,
        type: media.type,
        title,
        subtitle,
        source: media.source,
      };
    });
  };

  const [feeds, setFeeds] = useState<Record<Category, FeedItem[]>>(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category] = createBatch(category, 0, INITIAL_BATCH);
      return acc;
    }, {} as Record<Category, FeedItem[]>);
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="border-b border-zinc-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center gap-8 px-6 pb-4 pt-4">
            {CATEGORIES.map((label, index) => {
              const isActive = index === activeIndex;
              return (
                <Pressable
                  key={label}
                  onPress={() => {
                    activeIndexRef.current = index;
                    setActiveIndex(index);
                    pagerRef.current?.setPage(index);
                  }}>
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

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageScroll={(event) => {
          const { position, offset } = event.nativeEvent;
          const nextIndex = Math.round(position + offset);
          if (nextIndex !== activeIndexRef.current) {
            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }}
        onPageSelected={(event) => {
          const nextIndex = event.nativeEvent.position;
          if (nextIndex !== activeIndexRef.current) {
            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);
          }
        }}>
        {CATEGORIES.map((category) => (
          <View key={category} style={{ flex: 1 }}>
            <FlatList
              data={feeds[category]}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 24 }}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.6}
              onEndReached={() => {
                setFeeds((prev) => {
                  const current = prev[category];
                  const nextItems = createBatch(category, current.length, NEXT_BATCH);
                  return { ...prev, [category]: [...current, ...nextItems] };
                });
              }}
              renderItem={({ item }) => (
                <View className="mb-8">
                  <View className="w-full overflow-hidden rounded-lg bg-zinc-100" style={{ aspectRatio: 4 / 5 }}>
                    {item.type === 'image' ? (
                      <Image
                        source={resolveSource(item.source)}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : (
                      <Video
                        source={resolveSource(item.source)}
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
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
  );
}
