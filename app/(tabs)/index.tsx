import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image, type ImageContentFit } from 'expo-image';
import { ChevronDown, ChevronUp, Menu, Search, ShoppingBag, SlidersHorizontal, Star } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const FILTERS = ['All', 'Experts', 'Friends', 'Your Brands'] as const;
type Filter = (typeof FILTERS)[number];
const CATEGORY_OPTIONS = [
  'All',
  'Apparel',
  'Home',
  'Beauty',
  'Wellness',
  'Shoes',
  'Accessories',
  'Outdoors',
  'Office',
  'Athletics',
  'Books',
  'Kitchen',
  'Electronics',
  'Furniture',
  'Jewelry',
  'Travel',
  'Pets',
  'Gaming',
  'Watches',
  'Baby',
  'Auto',
] as const;
type CategoryOption = (typeof CATEGORY_OPTIONS)[number];
const STYLE_FILTER_OPTIONS: CategoryOption[] = ['All', 'Apparel', 'Home', 'Beauty', 'Wellness'];

type BrandLogo = 'nike' | 'uniqlo' | 'oakley' | 'pyra' | 'modref' | 'wordmark';

type Product = {
  id: string;
  brand: string;
  logo: BrandLogo;
  title: string;
  image: number;
  aspectRatio: number;
  contentFit?: ImageContentFit;
  friendReviews: number;
  expertReviews: number;
  rating: number;
  reviewCount: number;
  isYourBrand: boolean;
};

const PRODUCTS: Product[] = [
  {
    id: 'nike-pegasus',
    brand: 'Nike',
    logo: 'nike',
    title: 'Nike Pegasus Premium',
    image: require('@/assets/images/nb-1960r.png'),
    aspectRatio: 1,
    contentFit: 'contain',
    friendReviews: 12,
    expertReviews: 9,
    rating: 4.2,
    reviewCount: 762,
    isYourBrand: true,
  },
  {
    id: 'uniqlo-clark',
    brand: 'Uniqlo',
    logo: 'uniqlo',
    title: 'The Clark Sweater',
    image: require('@/assets/images/Nike Free Metcon 6 SE.png'),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 12,
    expertReviews: 8,
    rating: 4.2,
    reviewCount: 684,
    isYourBrand: false,
  },
  {
    id: 'nike-stride',
    brand: 'Nike',
    logo: 'nike',
    title: 'Nike Stride',
    image: require('@/assets/images/Nike - Nike Stride.png'),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 14,
    expertReviews: 11,
    rating: 4.4,
    reviewCount: 812,
    isYourBrand: true,
  },
  {
    id: 'nike-sabrina-3',
    brand: 'Nike',
    logo: 'nike',
    title: 'Sabrina 3 "Warnign Label"',
    image: require('@/assets/images/Nike - Sabrina 3 "Warnign Label".png'),
    aspectRatio: 1,
    contentFit: 'cover',
    friendReviews: 13,
    expertReviews: 12,
    rating: 4.5,
    reviewCount: 790,
    isYourBrand: true,
  },
  {
    id: 'nike-metcon-6-se',
    brand: 'Nike',
    logo: 'nike',
    title: 'Nike Free Metcon 6 SE',
    image: require('@/assets/images/Nike Free Metcon 6 SE.png'),
    aspectRatio: 1,
    contentFit: 'cover',
    friendReviews: 11,
    expertReviews: 13,
    rating: 4.3,
    reviewCount: 755,
    isYourBrand: true,
  },
  {
    id: 'on-cloud-6',
    brand: 'ON',
    logo: 'wordmark',
    title: 'Cloud 6',
    image: require('@/assets/images/ON - Cloud 6.png'),
    aspectRatio: 1,
    contentFit: 'cover',
    friendReviews: 10,
    expertReviews: 14,
    rating: 4.4,
    reviewCount: 748,
    isYourBrand: false,
  },
  {
    id: 'on-club-collective',
    brand: 'ON',
    logo: 'wordmark',
    title: 'Club Collective-T Geo',
    image: require('@/assets/images/ON - Club Collective-T Geo.png'),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 9,
    expertReviews: 12,
    rating: 4.2,
    reviewCount: 689,
    isYourBrand: false,
  },
  {
    id: 'on-roger-pro-fire',
    brand: 'ON',
    logo: 'wordmark',
    title: 'The Roger Pro Fire',
    image: require('@/assets/images/ON - The Roger Pro Fire.png'),
    aspectRatio: 1,
    contentFit: 'cover',
    friendReviews: 8,
    expertReviews: 13,
    rating: 4.3,
    reviewCount: 702,
    isYourBrand: false,
  },
  {
    id: 'modref-colin',
    brand: 'Mod Ref',
    logo: 'modref',
    title: 'The Colin Top',
    image: require('@/assets/images/Mod Ref - The Colin Top.png'),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 12,
    expertReviews: 10,
    rating: 4.2,
    reviewCount: 676,
    isYourBrand: true,
  },
  {
    id: 'modref-dominic',
    brand: 'Mod Ref',
    logo: 'modref',
    title: 'The Dominic Shirt',
    image: require('@/assets/images/Mod Ref - The Dominic Shirt.png'),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 10,
    expertReviews: 11,
    rating: 4.1,
    reviewCount: 641,
    isYourBrand: true,
  },
  {
    id: 'modref-jeremy',
    brand: 'Mod Ref',
    logo: 'modref',
    title: 'The Jeremy Top',
    image: require('@/assets/images/Mod Ref - The Jeremy Top.png'),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 11,
    expertReviews: 9,
    rating: 4.1,
    reviewCount: 620,
    isYourBrand: true,
  },
  {
    id: 'buckmason-cloudloom',
    brand: 'Buck Mason',
    logo: 'wordmark',
    title: 'Cloudloom Carry-on Jacket',
    image: require('@/assets/images/Buck Mason - Cloudloom Cotton Wool Carry-on Jacket.png'),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 9,
    expertReviews: 12,
    rating: 4.2,
    reviewCount: 667,
    isYourBrand: false,
  },
  {
    id: 'buckmason-japanese-twill',
    brand: 'Buck Mason',
    logo: 'wordmark',
    title: 'Japanese Twill Chore Jacket',
    image: require('@/assets/images/Buck Mason - Japanese Twill Belted-Back Chore Jacket.png'),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 8,
    expertReviews: 13,
    rating: 4.3,
    reviewCount: 673,
    isYourBrand: false,
  },
  {
    id: 'buckmason-old-herc',
    brand: 'Buck Mason',
    logo: 'wordmark',
    title: "Old Herc' Denim Work Shirt",
    image: require("@/assets/images/Buck Mason - Old Herc' Denim Work Shirt.png"),
    aspectRatio: 3 / 4,
    contentFit: 'cover',
    friendReviews: 7,
    expertReviews: 11,
    rating: 4.0,
    reviewCount: 598,
    isYourBrand: false,
  },
  {
    id: 'frama-table',
    brand: 'Frama',
    logo: 'wordmark',
    title: 'Farmhouse Table',
    image: require('@/assets/images/frama-table.png'),
    aspectRatio: 1,
    contentFit: 'cover',
    friendReviews: 7,
    expertReviews: 8,
    rating: 4.1,
    reviewCount: 612,
    isYourBrand: false,
  },
  {
    id: 'lelabo-santal',
    brand: 'Le Labo',
    logo: 'wordmark',
    title: 'Santal 33',
    image: require('@/assets/images/lelabo.png'),
    aspectRatio: 1,
    contentFit: 'cover',
    friendReviews: 6,
    expertReviews: 7,
    rating: 4.1,
    reviewCount: 588,
    isYourBrand: true,
  },
  {
    id: 'aesop-resin',
    brand: 'Aesop',
    logo: 'wordmark',
    title: 'Resurrection Aromatique',
    image: require('@/assets/images/aesop-soap.png'),
    aspectRatio: 1,
    contentFit: 'cover',
    friendReviews: 5,
    expertReviews: 6,
    rating: 4.0,
    reviewCount: 522,
    isYourBrand: true,
  },
];

const PORTRAIT_IMAGES = [
  require('@/assets/images/Angela Jackson.png'),
  require('@/assets/images/Brad Pitt.png'),
  require('@/assets/images/Roger Bacon.png'),
  require('@/assets/images/Zendaya.png'),
  require('@/assets/images/Steph Curry.png'),
  require('@/assets/images/Dumbfoundead.png'),
  require('@/assets/images/Simu Liu.png'),
  require('@/assets/images/Stephen Yeun.png'),
  require('@/assets/images/Sarah Black.png'),
];

const BRAND_LOGOS = {
  nike: require('@/assets/images/logos/Nike.svg'),
  on: require('@/assets/images/logos/ON.png'),
  buckMason: require('@/assets/images/logos/buck mason.png'),
  uniqlo: require('@/assets/images/logos/uniqlo.png'),
} as const;

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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  dispersionTopDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
});

const getRankScore = (product: Product, filter: Filter) => {
  if (filter === 'Friends') {
    return product.friendReviews;
  }
  if (filter === 'Experts') {
    return product.expertReviews;
  }
  return product.reviewCount;
};

const getReviewMeta = (product: Product, filter: Filter) => {
  if (filter === 'Experts') {
    return { count: product.expertReviews, audience: 'experts' };
  }
  if (filter === 'Friends') {
    return { count: product.friendReviews, audience: 'friends' };
  }
  return { count: product.reviewCount, audience: 'reviews' };
};

const getProductCategory = (product: Product): CategoryOption => {
  if (product.brand === 'Frama') {
    return 'Home';
  }
  if (product.brand === 'Le Labo') {
    return 'Beauty';
  }
  if (product.brand === 'Aesop') {
    return 'Wellness';
  }
  return 'Apparel';
};

const splitIntoColumns = (items: Product[]) => {
  const left: Product[] = [];
  const right: Product[] = [];

  items.forEach((item, index) => {
    if (index % 2 === 0) {
      left.push(item);
      return;
    }
    right.push(item);
  });

  return { left, right };
};

const BrandLogoMark = ({ product }: { product: Product }) => {
  const [nikeLogoError, setNikeLogoError] = useState(false);

  if (product.brand === 'ON') {
    return <Image source={BRAND_LOGOS.on} style={{ width: 18, height: 18 }} contentFit="contain" />;
  }

  if (product.brand === 'Buck Mason') {
    return <Image source={BRAND_LOGOS.buckMason} style={{ width: 64, height: 12 }} contentFit="contain" />;
  }

  if (product.logo === 'uniqlo') {
    return <Image source={BRAND_LOGOS.uniqlo} style={{ width: 20, height: 20 }} contentFit="contain" />;
  }

  if (product.logo === 'nike' && !nikeLogoError) {
    return (
      <Image
        source={BRAND_LOGOS.nike}
        style={{ width: 24, height: 12 }}
        contentFit="contain"
        onError={() => setNikeLogoError(true)}
      />
    );
  }

  if (product.logo === 'oakley') {
    return <View className="h-[8px] w-[22px] rounded-full border-2 border-zinc-900" />;
  }

  if (product.logo === 'pyra') {
    return <ThemedText className="text-[12px] font-semibold tracking-[1px] text-zinc-800">PYRA^</ThemedText>;
  }

  if (product.logo === 'modref') {
    return <ThemedText className="text-[4px] tracking-[2px] text-zinc-600">MOD REF</ThemedText>;
  }

  if (product.logo === 'nike') {
    return <ThemedText className="text-[11px] font-black italic tracking-tight text-zinc-900">NIKE</ThemedText>;
  }

  return (
    <ThemedText className="text-[8px] font-semibold tracking-[2px] text-zinc-500">{product.brand.toUpperCase()}</ThemedText>
  );
};

const getAvatarPair = (seed: string) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  const firstIndex = Math.abs(hash) % PORTRAIT_IMAGES.length;
  const secondIndex = (firstIndex + 1) % PORTRAIT_IMAGES.length;
  return [PORTRAIT_IMAGES[firstIndex], PORTRAIT_IMAGES[secondIndex]];
};

const AvatarStack = ({ seed }: { seed: string }) => {
  const avatars = getAvatarPair(seed);

  return (
    <View className="flex-row items-center">
      {avatars.map((avatar, index) => (
        <View
          key={`${seed}-avatar-${index}`}
          className="h-[18px] w-[18px] overflow-hidden rounded-full border border-white"
          style={{ marginLeft: index === 0 ? 0 : -6 }}>
          <Image source={avatar} style={{ height: '100%', width: '100%' }} contentFit="cover" />
        </View>
      ))}
    </View>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width: viewportWidth } = useWindowDimensions();
  const pagerRef = useRef<PagerView>(null);
  const tabScrollRef = useRef<ScrollView>(null);
  const tabLayoutsRef = useRef<Record<number, { x: number; width: number }>>({});
  const scrollOffsetsRef = useRef<Record<Filter, number>>({
    All: 0,
    Experts: 0,
    Friends: 0,
    'Your Brands': 0,
  });
  const feedTopInsetProgressByFilterRef = useRef<Record<Filter, Animated.Value>>({
    All: new Animated.Value(1),
    Experts: new Animated.Value(1),
    Friends: new Animated.Value(1),
    'Your Brands': new Animated.Value(1),
  });
  const isChromeVisibleRef = useRef(true);
  const isPressNavigationRef = useRef(false);
  const lastHapticIndexRef = useRef(0);
  const chromeVisibility = useRef(new Animated.Value(1)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [topBarHeight, setTopBarHeight] = useState(0);
  const [categoriesRowHeight, setCategoriesRowHeight] = useState(40);
  const [tabViewportWidth, setTabViewportWidth] = useState(0);
  const [tabContentWidth, setTabContentWidth] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>('All');
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const categoryDrawerOpacity = useRef(new Animated.Value(0)).current;
  const categoryDrawerTranslateY = useRef(new Animated.Value(-14)).current;
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const filterDrawerProgress = useRef(new Animated.Value(0)).current;
  const [isPriceRangeOpen, setIsPriceRangeOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isShoeSizeOpen, setIsShoeSizeOpen] = useState(false);
  const [isShirtSizeOpen, setIsShirtSizeOpen] = useState(true);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const filterDrawerWidth = Math.min(344, Math.max(272, viewportWidth * 0.78));
  const filterDrawerTranslateX = filterDrawerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-filterDrawerWidth - 24, 0],
  });
  const filterOverlayOpacity = filterDrawerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.26],
  });
  const floatingCategoriesTop = Math.max(40, topBarHeight + 12);
  const feedTopInset = Math.max(0, floatingCategoriesTop + categoriesRowHeight + 6);
  const collapsedFeedTopInset = 8;
  const feedInsetCollapseDistance = Math.max(120, (feedTopInset - collapsedFeedTopInset) * 1.8);
  const animatedFeedTopInsetByFilter = useMemo(
    () =>
      FILTERS.reduce(
        (acc, filter) => {
          acc[filter] = feedTopInsetProgressByFilterRef.current[filter].interpolate({
            inputRange: [0, 1],
            outputRange: [collapsedFeedTopInset, feedTopInset],
          });
          return acc;
        },
        {} as Record<Filter, Animated.AnimatedInterpolation<string | number>>
      ),
    [collapsedFeedTopInset, feedTopInset]
  );
  const categoriesHideShift = Math.max(0, floatingCategoriesTop - 6);
  const topBarHideDistance = Math.max(44, topBarHeight + 14);
  const topBarTranslateY = chromeVisibility.interpolate({
    inputRange: [0, 1],
    outputRange: [-topBarHideDistance, 0],
  });
  const categoriesTranslateY = chromeVisibility.interpolate({
    inputRange: [0, 1],
    outputRange: [-categoriesHideShift, 0],
  });
  const bottomChromeTranslateY = chromeVisibility.interpolate({
    inputRange: [0, 1],
    outputRange: [96, 0],
  });
  const categoryModalWidth = Math.min(276, Math.max(238, viewportWidth * 0.76));

  const openFilterDrawer = useCallback(() => {
    setIsCategoryDrawerOpen(false);
    setIsFilterDrawerOpen((prev) => {
      if (!prev) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      return true;
    });
  }, []);

  const closeFilterDrawer = useCallback(() => {
    setIsFilterDrawerOpen(false);
  }, []);

  const closeCategoryDrawer = useCallback(() => {
    setIsCategoryDrawerOpen(false);
  }, []);

  const toggleCategoryDrawer = useCallback(() => {
    setIsFilterDrawerOpen(false);
    setIsCategoryDrawerOpen((prev) => {
      const next = !prev;
      if (next) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      return next;
    });
  }, []);

  const setChromeVisible = useCallback(
    (visible: boolean) => {
      if (visible === isChromeVisibleRef.current) {
        return;
      }
      isChromeVisibleRef.current = visible;
      setIsChromeVisible(visible);
      Animated.timing(chromeVisibility, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    },
    [chromeVisibility]
  );

  const swipeToDrawerResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (isFilterDrawerOpen || isCategoryDrawerOpen) {
            return false;
          }
          const isLeftmostTab = activeIndexRef.current === 0;
          if (!isLeftmostTab) {
            return false;
          }
          const isFromLeftEdge = gestureState.x0 <= 24;
          if (!isFromLeftEdge) {
            return false;
          }
          if (Math.abs(gestureState.dx) < Math.abs(gestureState.dy)) {
            return false;
          }
          return gestureState.dx > 14;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 78 || gestureState.vx > 0.85) {
            openFilterDrawer();
          }
        },
      }),
    [isCategoryDrawerOpen, isFilterDrawerOpen, openFilterDrawer]
  );

  const rankedByFilter = useMemo(() => {
    return FILTERS.reduce(
      (acc, filter) => {
        const filtered = PRODUCTS.filter((product) => {
          if (selectedCategory !== 'All' && getProductCategory(product) !== selectedCategory) {
            return false;
          }
          if (filter === 'Your Brands') {
            return product.isYourBrand;
          }
          return true;
        });

        acc[filter] = [...filtered].sort((a, b) => {
          const scoreDiff = getRankScore(b, filter) - getRankScore(a, filter);
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
          const ratingDiff = b.rating - a.rating;
          if (ratingDiff !== 0) {
            return ratingDiff;
          }
          return b.reviewCount - a.reviewCount;
        });
        return acc;
      },
      {} as Record<Filter, Product[]>
    );
  }, [selectedCategory]);

  const scrollTabIntoView = useCallback(
    (index: number, animated = true) => {
      const layout = tabLayoutsRef.current[index];
      if (!layout || tabViewportWidth === 0) {
        return;
      }

      const centeredX = layout.x + layout.width / 2 - tabViewportWidth / 2;
      const maxX = Math.max(0, tabContentWidth - tabViewportWidth);
      const targetX = Math.max(0, Math.min(centeredX, maxX));

      tabScrollRef.current?.scrollTo({ x: targetX, animated });
    },
    [tabContentWidth, tabViewportWidth]
  );

  useEffect(() => {
    scrollTabIntoView(activeIndex);
  }, [activeIndex, scrollTabIntoView]);

  useEffect(() => {
    filterDrawerProgress.stopAnimation();
    Animated.timing(filterDrawerProgress, {
      toValue: isFilterDrawerOpen ? 1 : 0,
      duration: isFilterDrawerOpen ? 220 : 180,
      useNativeDriver: true,
    }).start();
  }, [filterDrawerProgress, isFilterDrawerOpen]);

  useEffect(() => {
    categoryDrawerOpacity.stopAnimation();
    categoryDrawerTranslateY.stopAnimation();
    Animated.parallel([
      Animated.timing(categoryDrawerOpacity, {
        toValue: isCategoryDrawerOpen ? 1 : 0,
        duration: isCategoryDrawerOpen ? 200 : 160,
        useNativeDriver: true,
      }),
      Animated.timing(categoryDrawerTranslateY, {
        toValue: isCategoryDrawerOpen ? 0 : -14,
        duration: isCategoryDrawerOpen ? 200 : 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [categoryDrawerOpacity, categoryDrawerTranslateY, isCategoryDrawerOpen]);

  const triggerTabHaptic = useCallback((index: number) => {
    if (index === lastHapticIndexRef.current) {
      return;
    }
    lastHapticIndexRef.current = index;
    void Haptics.selectionAsync();
  }, []);

  const syncFeedTopInset = useCallback(
    (filter: Filter, yOffset: number) => {
      const linearProgress = 1 - Math.min(1, yOffset / feedInsetCollapseDistance);
      const easedProgress = linearProgress * linearProgress * (3 - 2 * linearProgress);
      feedTopInsetProgressByFilterRef.current[filter].setValue(easedProgress);
    },
    [feedInsetCollapseDistance]
  );

  const handleFeedScroll = useCallback(
    (filter: Filter, yOffset: number) => {
      const normalizedOffset = Math.max(0, yOffset);
      const previousOffset = scrollOffsetsRef.current[filter] ?? 0;
      const delta = normalizedOffset - previousOffset;
      scrollOffsetsRef.current[filter] = normalizedOffset;
      const isActiveFilter = FILTERS[activeIndexRef.current] === filter;
      syncFeedTopInset(filter, normalizedOffset);

      if (!isActiveFilter) {
        return;
      }

      const isAtTop = normalizedOffset <= 4;
      if (isAtTop) {
        setChromeVisible(true);
        return;
      }

      if (delta > 6) {
        setChromeVisible(false);
        return;
      }

      if (delta < -6) {
        setChromeVisible(true);
      }
    },
    [setChromeVisible, syncFeedTopInset]
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1" {...swipeToDrawerResponder.panHandlers}>
        <Animated.View
          className="absolute left-0 right-0 top-0 bg-white"
          pointerEvents="none"
          style={{
            zIndex: 15,
            height: floatingCategoriesTop,
            opacity: chromeVisibility,
            transform: [{ translateY: topBarTranslateY }],
          }}
        />
        <Animated.View
          className="absolute left-0 right-0 top-0 z-20 px-6 pt-3"
          pointerEvents={isChromeVisible ? 'auto' : 'none'}
          onLayout={(event) => {
            const nextHeight = event.nativeEvent.layout.height;
            if (Math.abs(nextHeight - topBarHeight) > 1) {
              setTopBarHeight(nextHeight);
            }
          }}
          style={{
            opacity: chromeVisibility,
            transform: [{ translateY: topBarTranslateY }],
          }}>
          <View className="flex-row items-center justify-center">
            <Pressable className="absolute left-0 h-8 w-8 items-start justify-center" onPress={openFilterDrawer}>
              <Menu size={18} color="#18181B" strokeWidth={2} />
            </Pressable>
            <Pressable className="flex-row items-center gap-1 py-1 pr-1" onPress={toggleCategoryDrawer}>
              <ThemedText className="text-[11px] font-semibold tracking-[0.8px] text-zinc-900">
                {selectedCategory.toUpperCase()}
              </ThemedText>
              {isCategoryDrawerOpen ? (
                <ChevronUp size={13} color="#18181B" strokeWidth={2.2} />
              ) : (
                <ChevronDown size={13} color="#18181B" strokeWidth={2.2} />
              )}
            </Pressable>
            <Pressable className="absolute right-0 h-8 w-8 items-end justify-center">
              <ShoppingBag size={18} color="#18181B" strokeWidth={2} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          className="absolute left-0 right-0 z-10 px-6"
          style={{ top: floatingCategoriesTop, transform: [{ translateY: categoriesTranslateY }] }}>
          <ScrollView
            ref={tabScrollRef}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            onLayout={(event) => {
              setTabViewportWidth(event.nativeEvent.layout.width);
            }}
            onContentSizeChange={(width) => {
              setTabContentWidth(width);
            }}>
            <View
              className="w-full flex-row items-center gap-3 pb-2"
              onLayout={(event) => {
                const nextHeight = event.nativeEvent.layout.height;
                if (Math.abs(nextHeight - categoriesRowHeight) > 1) {
                  setCategoriesRowHeight(nextHeight);
                }
              }}>
              {FILTERS.map((label, index) => {
                const isActive = index === activeIndex;
                return (
                  <Pressable
                    key={label}
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      tabLayoutsRef.current[index] = { x, width };
                    }}
                    onPress={() => {
                      if (index === activeIndexRef.current) {
                        scrollTabIntoView(index);
                        return;
                      }
                      isPressNavigationRef.current = true;
                      activeIndexRef.current = index;
                      setActiveIndex(index);
                      triggerTabHaptic(index);
                      scrollTabIntoView(index);
                      pagerRef.current?.setPage(index);
                    }}
                    className="flex-1 overflow-hidden rounded-full border"
                    style={{
                      borderColor: isActive ? 'rgba(17, 24, 39, 0.78)' : 'rgba(255, 255, 255, 0.86)',
                    }}>
                    <BlurView intensity={isActive ? 38 : 45} tint={isActive ? 'dark' : 'light'} style={styles.blurFill} />
                    <View
                      className="absolute inset-0"
                      style={{ backgroundColor: isActive ? 'rgba(10, 10, 10, 0.65)' : 'rgba(255, 255, 255, 0.62)' }}
                    />
                    <View pointerEvents="none" style={styles.dispersionLayer}>
                      <View style={isActive ? styles.dispersionTopDark : styles.dispersionTop} />
                    </View>
                    <ThemedText
                      className="px-2 py-2 text-center text-[11px] font-semibold"
                      numberOfLines={1}
                      style={{ color: isActive ? '#FFFFFF' : '#111827' }}>
                      {label.toUpperCase()}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        <Animated.View style={{ flex: 1 }}>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            onPageScroll={(event) => {
              if (isPressNavigationRef.current) {
                return;
              }

              const { position, offset } = event.nativeEvent;
              const nextIndex = Math.max(0, Math.min(FILTERS.length - 1, Math.round(position + offset)));

              if (nextIndex !== activeIndexRef.current) {
                activeIndexRef.current = nextIndex;
                setActiveIndex(nextIndex);
                triggerTabHaptic(nextIndex);
              }
            }}
            onPageSelected={(event) => {
              const nextIndex = event.nativeEvent.position;
              isPressNavigationRef.current = false;
              if (nextIndex !== activeIndexRef.current) {
                activeIndexRef.current = nextIndex;
                setActiveIndex(nextIndex);
                triggerTabHaptic(nextIndex);
              }

              const activeFilter = FILTERS[nextIndex];
              const activeOffset = scrollOffsetsRef.current[activeFilter] ?? 0;
              syncFeedTopInset(activeFilter, activeOffset);
              setChromeVisible(activeOffset <= 4);
            }}>
            {FILTERS.map((filter) => (
              <View key={filter} style={{ flex: 1 }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    handleFeedScroll(filter, event.nativeEvent.contentOffset.y);
                  }}>
                  <Animated.View className="px-4 pb-32" style={{ paddingTop: animatedFeedTopInsetByFilter[filter] }}>
                  {(() => {
                    const productsForFilter = rankedByFilter[filter];
                    if (productsForFilter.length === 0) {
                      return (
                        <View className="items-center px-6 pt-20">
                          <ThemedText className="text-[13px] text-zinc-500">
                            No products found in {selectedCategory.toUpperCase()}.
                          </ThemedText>
                        </View>
                      );
                    }

                    const columns = splitIntoColumns(productsForFilter);

                    const renderCard = (product: Product) => {
                      const isAllTab = filter === 'All';
                      const isFriendOrExpertTab = filter === 'Friends' || filter === 'Experts';
                      const reviewMeta = isAllTab ? null : getReviewMeta(product, filter);

                      return (
                        <View key={product.id}>
                          <View className="mb-2 flex-row items-center justify-between">
                            <ThemedText className="text-[12px] font-medium text-zinc-900">{product.brand}</ThemedText>
                            <BrandLogoMark product={product} />
                          </View>

                          <View
                            className="w-full overflow-hidden rounded-[4px] bg-white"
                            style={{ aspectRatio: product.aspectRatio }}>
                            <Image source={product.image} style={{ width: '100%', height: '100%' }} contentFit={product.contentFit} />
                          </View>

                          {isAllTab ? (
                            <View className="mt-3 flex-row items-center">
                              <Star size={12} color="#111827" fill="#111827" strokeWidth={1.8} />
                              <ThemedText className="ml-1 text-[11px] font-semibold text-zinc-900">
                                {product.rating.toFixed(1)} ({product.reviewCount})
                              </ThemedText>
                            </View>
                          ) : isFriendOrExpertTab ? (
                            <View className="mt-3 flex-row items-center">
                              <Star size={12} color="#111827" fill="#111827" strokeWidth={1.8} />
                              <ThemedText className="ml-1 text-[11px] font-semibold text-zinc-900">
                                {product.rating.toFixed(1)}
                              </ThemedText>
                              <View className="ml-2 flex-row items-center">
                                <AvatarStack seed={product.id} />
                                <ThemedText className="ml-2 text-[11px] font-semibold text-zinc-900">
                                  ({reviewMeta?.count ?? 0})
                                </ThemedText>
                              </View>
                            </View>
                          ) : (
                            <View className="mt-3 flex-row items-center justify-between">
                              <View className="flex-row items-center">
                                <Star size={12} color="#111827" fill="#111827" strokeWidth={1.8} />
                                <ThemedText className="ml-1 text-[11px] font-semibold text-zinc-900">
                                  {product.rating.toFixed(1)}
                                </ThemedText>
                              </View>
                              <View className="flex-row items-center">
                                <AvatarStack seed={product.id} />
                                <ThemedText className="ml-2 text-[11px] font-medium text-zinc-900">
                                  +{reviewMeta?.count} {reviewMeta?.audience}
                                </ThemedText>
                              </View>
                            </View>
                          )}

                          <ThemedText className="mt-2 text-[13px] font-medium leading-[18px] text-zinc-900">
                            {product.title}
                          </ThemedText>
                        </View>
                      );
                    };

                    return (
                      <View className="flex-row gap-4">
                        <View className="flex-1 gap-12">{columns.left.map(renderCard)}</View>
                        <View className="flex-1 gap-12">{columns.right.map(renderCard)}</View>
                      </View>
                    );
                  })()}
                  </Animated.View>
                </ScrollView>
              </View>
            ))}
          </PagerView>
        </Animated.View>
      </View>

      <Animated.View
        className="absolute inset-0 z-20"
        pointerEvents={isFilterDrawerOpen ? 'auto' : 'none'}
        style={{ opacity: filterOverlayOpacity }}>
        <Pressable className="flex-1 bg-black" onPress={closeFilterDrawer} />
      </Animated.View>
      <Animated.View
        className="absolute bottom-0 left-0 top-0 z-30 overflow-hidden border-r border-zinc-300 bg-[#ECECEC]"
        pointerEvents={isFilterDrawerOpen ? 'auto' : 'none'}
        style={{
          width: filterDrawerWidth,
          transform: [{ translateX: filterDrawerTranslateX }],
        }}>
        <SafeAreaView className="flex-1 bg-[#ECECEC]" edges={['top']}>
          <View className="h-16 flex-row items-center justify-between border-b border-zinc-300 px-5">
            <View className="w-8" />
            <ThemedText className="text-[14px] font-medium text-zinc-800">Filters</ThemedText>
            <View className="h-8 w-8 items-center justify-center">
              <SlidersHorizontal size={14} color="#5A5D63" strokeWidth={2} />
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Pressable className="border-b border-zinc-300 px-5 py-6" onPress={() => setIsPriceRangeOpen((prev) => !prev)}>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-[10px] font-semibold tracking-[1px] text-zinc-700">PRICE RANGE</ThemedText>
                {isPriceRangeOpen ? (
                  <ChevronUp size={14} color="#33363D" strokeWidth={2.2} />
                ) : (
                  <ChevronDown size={14} color="#33363D" strokeWidth={2.2} />
                )}
              </View>
              {isPriceRangeOpen ? (
                <View className="items-center pt-5">
                  <View className="w-[132px]">
                    <View className="h-[2px] bg-zinc-700/80" />
                    <View className="absolute left-[16px] top-[-4px] h-[9px] w-[9px] rounded-full bg-black" />
                    <View className="absolute left-[48px] top-[-4px] h-[9px] w-[9px] rounded-full bg-black" />
                  </View>
                  <ThemedText className="mt-3 text-[12px] font-medium text-zinc-800">$300</ThemedText>
                </View>
              ) : null}
            </Pressable>

            <Pressable className="border-b border-zinc-300 px-5 py-6" onPress={() => setIsColorOpen((prev) => !prev)}>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-[10px] font-semibold tracking-[1px] text-zinc-700">COLOR</ThemedText>
                {isColorOpen ? (
                  <ChevronUp size={14} color="#33363D" strokeWidth={2.2} />
                ) : (
                  <ChevronDown size={14} color="#33363D" strokeWidth={2.2} />
                )}
              </View>
            </Pressable>

            <Pressable className="border-b border-zinc-300 px-5 py-6" onPress={() => setIsShoeSizeOpen((prev) => !prev)}>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-[10px] font-semibold tracking-[1px] text-zinc-700">SHOE SIZE</ThemedText>
                {isShoeSizeOpen ? (
                  <ChevronUp size={14} color="#33363D" strokeWidth={2.2} />
                ) : (
                  <ChevronDown size={14} color="#33363D" strokeWidth={2.2} />
                )}
              </View>
            </Pressable>

            <Pressable className="border-b border-zinc-300 px-5 py-6" onPress={() => setIsShirtSizeOpen((prev) => !prev)}>
              <View className="flex-row items-center justify-between">
                <ThemedText className="text-[10px] font-semibold tracking-[1px] text-zinc-700">SHIRT SIZE</ThemedText>
                {isShirtSizeOpen ? (
                  <ChevronUp size={14} color="#33363D" strokeWidth={2.2} />
                ) : (
                  <ChevronDown size={14} color="#33363D" strokeWidth={2.2} />
                )}
              </View>
              {isShirtSizeOpen ? (
                <View className="mt-5 flex-row items-center gap-4">
                  {['XS', 'S', 'M', 'L'].map((size) => (
                    <View key={size} className="h-9 w-9 items-center justify-center rounded-full bg-zinc-300">
                      <ThemedText className="text-[10px] text-zinc-700">{size}</ThemedText>
                    </View>
                  ))}
                </View>
              ) : null}
            </Pressable>

            <View className="border-b border-zinc-300 px-5 py-6">
              <Pressable className="flex-row items-center justify-between" onPress={() => setIsStyleOpen((prev) => !prev)}>
                <ThemedText className="text-[10px] font-semibold tracking-[1px] text-zinc-700">STYLE</ThemedText>
                {isStyleOpen ? (
                  <ChevronUp size={14} color="#33363D" strokeWidth={2.2} />
                ) : (
                  <ChevronDown size={14} color="#33363D" strokeWidth={2.2} />
                )}
              </Pressable>
              {isStyleOpen ? (
                <View className="mt-5 flex-row flex-wrap gap-2">
                  {STYLE_FILTER_OPTIONS.map((category) => {
                    const isSelected = selectedCategory === category;
                    return (
                      <Pressable
                        key={category}
                        onPress={() => setSelectedCategory(category)}
                        className="rounded-full border px-3 py-2"
                        style={{
                          borderColor: isSelected ? '#18181B' : '#A1A1AA',
                          backgroundColor: isSelected ? '#18181B' : 'transparent',
                        }}>
                        <ThemedText
                          className="text-[11px] font-medium"
                          style={{ color: isSelected ? '#FAFAFA' : '#3F3F46' }}>
                          {category.toUpperCase()}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      <Animated.View
        className="absolute inset-0 z-40"
        pointerEvents={isCategoryDrawerOpen ? 'auto' : 'none'}
        style={{ opacity: categoryDrawerOpacity }}>
        <Pressable className="absolute inset-0" onPress={closeCategoryDrawer}>
          <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFillObject} />
          <View className="absolute inset-0 bg-white/28" />
        </Pressable>
        <Animated.View
          className="flex-1 items-center"
          pointerEvents="box-none"
          style={{
            paddingTop: insets.top + 52,
            paddingBottom: insets.bottom + 6,
            transform: [{ translateY: categoryDrawerTranslateY }],
          }}>
          <View style={{ width: categoryModalWidth, flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 6, paddingBottom: insets.bottom + 12 }}
              bounces={false}>
              {CATEGORY_OPTIONS.map((category) => {
                const isSelected = category === selectedCategory;
                return (
                  <Pressable
                    key={category}
                    className="items-center px-4 py-[16px]"
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCategory(category);
                      closeCategoryDrawer();
                    }}>
                    <ThemedText
                      className="text-[12px] tracking-[0.8px]"
                      numberOfLines={1}
                      style={{ color: isSelected ? '#111111' : '#525252', fontWeight: isSelected ? '700' : '500' }}>
                      {category.toUpperCase()}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        className="absolute bottom-6 left-0 right-0 px-6"
        pointerEvents={isChromeVisible ? 'auto' : 'none'}
        style={{ opacity: chromeVisibility, transform: [{ translateY: bottomChromeTranslateY }] }}>
        <View className="overflow-hidden rounded-2xl border border-white/80 shadow-lg shadow-black/20">
          <BlurView intensity={45} tint="light" style={styles.blurFill} />
          <View className="absolute inset-0 bg-white/62" />
          <View pointerEvents="none" style={styles.dispersionLayer}>
            <View style={styles.dispersionTop} />
          </View>
          <View className="flex-row items-center justify-between px-5 py-4">
            <ThemedText className="text-[12px] font-medium text-zinc-700">
              "Formal and casual sweaters for the winter..."
            </ThemedText>
            <Search size={18} color="#111827" strokeWidth={2.2} />
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
