import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const FILTERS = ['All', 'Experts', 'Friends', 'Your Brands'] as const;

type Filter = (typeof FILTERS)[number];

type Product = {
  id: string;
  brand: string;
  title: string;
  image: number;
  filters: Filter[];
};

type BentoSize = 'wide' | 'tall' | 'square';

const PRODUCTS: Product[] = [
  {
    id: 'nike-pegasus',
    brand: 'Nike',
    title: 'Pegasus Premium',
    image: require('@/assets/images/nb-1960r.png'),
    filters: ['All', 'Experts'],
  },
  {
    id: 'mod-ref',
    brand: 'Mod Ref',
    title: 'The Clark Sweater',
    image: require('@/assets/images/Corridor.png'),
    filters: ['All', 'Friends'],
  },
  {
    id: 'oakley-goggles',
    brand: 'Oakley',
    title: 'Flow Scape Snow Goggles',
    image: require('@/assets/images/oas.png'),
    filters: ['All', 'Experts'],
  },
  {
    id: 'pyra-pack',
    brand: 'Pyra',
    title: 'Expedition Bag',
    image: require('@/assets/images/latetowork.png'),
    filters: ['All', 'Friends'],
  },
  {
    id: 'lelabo-santal',
    brand: 'Le Labo',
    title: 'Santal 33',
    image: require('@/assets/images/lelabo.png'),
    filters: ['All', 'Your Brands'],
  },
  {
    id: 'aesop-resin',
    brand: 'Aesop',
    title: 'Resurrection Aromatique',
    image: require('@/assets/images/aesop-soap.png'),
    filters: ['All', 'Your Brands'],
  },
  {
    id: 'snif-crumb',
    brand: 'Snif',
    title: 'Crumb Couture',
    image: require('@/assets/images/snif-crumb.png'),
    filters: ['All', 'Your Brands'],
  },
  {
    id: 'salt-stone',
    brand: 'Salt & Stone',
    title: 'Bergamot + Hinoki',
    image: require('@/assets/images/salt&stone.png'),
    filters: ['All', 'Your Brands'],
  },
  {
    id: 'west-elm-basket',
    brand: 'West Elm',
    title: 'Herman Basket',
    image: require('@/assets/images/west-elm-herman-basket-woven.png'),
    filters: ['All', 'Friends'],
  },
  {
    id: 'frama-table',
    brand: 'Frama',
    title: 'Farmhouse Table',
    image: require('@/assets/images/frama-table.png'),
    filters: ['All', 'Experts'],
  },
  {
    id: 'metastudio-shelf',
    brand: 'Metastudio',
    title: 'Console Shelf',
    image: require('@/assets/images/metastudio.png'),
    filters: ['All', 'Friends'],
  },
  {
    id: 'imakebook-light',
    brand: 'I Make Book',
    title: 'Studio Light',
    image: require('@/assets/images/imakebook.png'),
    filters: ['All', 'Experts'],
  },
  {
    id: 'soosatelier',
    brand: 'Soos Atelier',
    title: 'Neroli Wash',
    image: require('@/assets/images/soosatelier.png'),
    filters: ['All', 'Your Brands'],
  },
  {
    id: 'auter-coat',
    brand: 'Auter',
    title: 'City Shell',
    image: require('@/assets/images/auter.png'),
    filters: ['All', 'Experts'],
  },
  {
    id: 'west-elm-sebastion',
    brand: 'West Elm',
    title: 'Sebastion Chair',
    image: require('@/assets/images/west-elm-sebastion.png'),
    filters: ['All', 'Friends'],
  },
];

const BENTO_PATTERN: BentoSize[] = ['tall', 'square', 'tall', 'square', 'tall', 'square', 'tall', 'square'];
const getBentoSize = (index: number, seed: number) => {
  return BENTO_PATTERN[(index + seed) % BENTO_PATTERN.length];
};

const getAspectRatio = (size: BentoSize) => {
  if (size === 'tall') {
    return 3 / 4;
  }
  return 1;
};

const styles = StyleSheet.create({
  blurFill: {
    ...StyleSheet.absoluteFillObject,
  },
  dispersionLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  dispersionTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dispersionLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 2,
    backgroundColor: 'rgba(120, 200, 255, 0.25)',
  },
  dispersionRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 2,
    backgroundColor: 'rgba(255, 140, 200, 0.22)',
  },
});

const buildMasonryColumns = (items: Product[], seed: number) => {
  const left: { items: (Product & { size: BentoSize; aspectRatio: number })[]; height: number } = {
    items: [],
    height: 0,
  };
  const right: { items: (Product & { size: BentoSize; aspectRatio: number })[]; height: number } = {
    items: [],
    height: 0,
  };

  items.forEach((item, index) => {
    const size = getBentoSize(index, seed);
    const aspectRatio = getAspectRatio(size);
    const weight = 1 / aspectRatio;
    const target = left.height <= right.height ? left : right;

    target.items.push({ ...item, size, aspectRatio });
    target.height += weight;
  });

  return { left: left.items, right: right.items };
};

export default function HomeScreen() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center gap-3 px-6 pb-4 pt-6">
            {FILTERS.map((label, index) => {
              const isActive = index === activeIndex;
              return (
                <Pressable
                  key={label}
                  onPress={() => {
                    activeIndexRef.current = index;
                    setActiveIndex(index);
                    pagerRef.current?.setPage(index);
                  }}
                  className={`rounded-full border px-4 py-2 ${
                    isActive ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-200 bg-white'
                  }`}>
                  <ThemedText
                    className="text-[12px] font-semibold"
                    numberOfLines={1}
                    style={{ color: isActive ? '#FFFFFF' : '#111827' }}>
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
        {FILTERS.map((filter, filterIndex) => (
          <View key={filter} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
              <View className="flex-row flex-wrap gap-4 px-2 pb-32 pt-5">
                {(() => {
                  const filtered = PRODUCTS.filter((product) => product.filters.includes(filter));
                  const columns = buildMasonryColumns(filtered, filterIndex);

                  const renderCard = (item: Product & { aspectRatio: number }) => (
                    <View key={item.id}>
                      <View
                        className="w-full overflow-hidden rounded-lg bg-zinc-100"
                        style={{ aspectRatio: item.aspectRatio }}>
                        <Image source={item.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      </View>
                      <View className="mt-3">
                        <ThemedText className="text-[11px] font-semibold uppercase tracking-[0.8px] text-zinc-500">
                          {item.brand}
                        </ThemedText>
                        <ThemedText className="text-[12px] font-medium text-zinc-900">
                          {item.title}
                        </ThemedText>
                      </View>
                    </View>
                  );

                  return (
                    <>
                      <View className="flex-1 gap-8">{columns.left.map(renderCard)}</View>
                      <View className="flex-1 gap-8">{columns.right.map(renderCard)}</View>
                    </>
                  );
                })()}
              </View>
            </ScrollView>
          </View>
        ))}
      </PagerView>

      <View className="absolute bottom-6 left-0 right-0 px-6" pointerEvents={chatOpen ? 'none' : 'auto'}>
        <Pressable
          onPress={() => setChatOpen(true)}
          className="overflow-hidden rounded-2xl border border-white/70 shadow-lg shadow-black/25">
          <BlurView intensity={45} tint="light" style={styles.blurFill} />
          <View className="absolute inset-0 bg-white/55" />
          <View pointerEvents="none" style={styles.dispersionLayer}>
            <View style={styles.dispersionTop} />
            <View style={styles.dispersionLeft} />
            <View style={styles.dispersionRight} />
          </View>
          <View className="flex-row items-center justify-between px-5 py-6">
            <ThemedText className="text-[12px] font-medium text-zinc-700">
              "Formal and casual sweaters for the winter..."
            </ThemedText>
            <View className="ml-4 flex-row items-center gap-1">
              <View className="h-3 w-[2px] rounded-full bg-zinc-900" />
              <View className="h-4 w-[2px] rounded-full bg-zinc-900" />
              <View className="h-2 w-[2px] rounded-full bg-zinc-900" />
            </View>
          </View>
        </Pressable>
      </View>

      {chatOpen ? (
        <View className="absolute inset-0">
          <Pressable className="flex-1 bg-black/10" onPress={() => setChatOpen(false)} />
          <View className="overflow-hidden rounded-t-[28px] border border-white/70 shadow-2xl shadow-black/25">
            <BlurView intensity={60} tint="light" style={styles.blurFill} />
            <View className="absolute inset-0 bg-white/60" />
            <View pointerEvents="none" style={styles.dispersionLayer}>
              <View style={styles.dispersionTop} />
              <View style={styles.dispersionLeft} />
              <View style={styles.dispersionRight} />
            </View>
            <View className="px-6 pb-8 pt-4">
              <View className="mx-auto h-1.5 w-14 rounded-full bg-zinc-300" />
              <View className="mt-4">
                <ThemedText className="text-center text-[12px] font-semibold text-zinc-500">Chat</ThemedText>
              </View>
              <View className="mt-6 flex-1">
                <ThemedText className="text-[14px] leading-6 text-zinc-700">
                  Sure - tell me what you're looking for and I'll refine the feed.
                </ThemedText>
              </View>
              <View className="mt-6 flex-row items-center justify-between rounded-full bg-white/70 px-4 py-3">
                <ThemedText className="text-[13px] text-zinc-500">Ask anything</ThemedText>
                <View className="flex-row items-center gap-1">
                  <View className="h-3 w-[2px] rounded-full bg-zinc-900" />
                  <View className="h-4 w-[2px] rounded-full bg-zinc-900" />
                  <View className="h-2 w-[2px] rounded-full bg-zinc-900" />
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
