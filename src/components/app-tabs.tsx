import QuickActionsModal from '@/components/quick-actions-modal';
import { TabBarVisibilityProvider, useTabBarVisibility } from '@/context/tab-bar-visibility';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs, usePathname, useRouter, useSegments } from 'expo-router';
import { Add, Card, ClipboardText, DocumentText, DocumentText1, Home2, Profile2User } from 'iconsax-react-native';
import React, { useState } from 'react';
import { LayoutAnimation, LogBox, Platform, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

LogBox.ignoreLogs([
  'setLayoutAnimationEnabledExperimental',
  'setLayoutAnimationEnabledExperimental is currently a no-op',
]);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {
    // Ignore in New Architecture
  }
}

// Must be created OUTSIDE the component so it is never recreated on each render.
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function CustomInstructorTabBar({ state, descriptors, navigation, onAddPress }: BottomTabBarProps & { onAddPress: () => void }) {
  const { tabBarOffset, isTabBarVisible } = useTabBarVisibility();
  const segments = useSegments();
  const [tabLayouts, setTabLayouts] = useState<{ [key: string]: { x: number; y: number; width: number; height: number } }>({});

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarOffset.value }],
    };
  });

  const activeRouteKey = state.routes[state.index]?.key;
  const activeLayout = tabLayouts[activeRouteKey];

  // Shared values for the sliding indicator
  const indicatorX = useSharedValue(0);
  const indicatorY = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const indicatorH = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (activeLayout) {
      indicatorX.value = withTiming(activeLayout.x, { duration: 350, easing: Easing.out(Easing.exp) });
      indicatorY.value = withTiming(activeLayout.y, { duration: 350, easing: Easing.out(Easing.exp) });
      indicatorW.value = withTiming(activeLayout.width, { duration: 350, easing: Easing.out(Easing.exp) });
      indicatorH.value = withTiming(activeLayout.height, { duration: 350, easing: Easing.out(Easing.exp) });
      indicatorOpacity.value = withTiming(1, { duration: 200 });
    } else {
      indicatorOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [activeLayout]);

  const indicatorStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      position: 'absolute',
      left: indicatorX.value,
      top: indicatorY.value,
      width: indicatorW.value,
      height: indicatorH.value,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      borderRadius: 30,
      opacity: indicatorOpacity.value,
    };
  });

  // Hide tab bar on authentication routes or full-screen routes (like start-class)
  const pathname = usePathname();
  const isAuthOrFullScreenRoute =
    (segments as string[]).includes('(auth)') ||
    (segments as string[]).includes('login') ||
    (pathname && pathname.toLowerCase().includes('login')) ||
    (pathname && pathname.toLowerCase().includes('start-class')) ||
    (pathname && pathname.toLowerCase().includes('startclass')) ||
    (pathname && pathname.toLowerCase().includes('studentlistscreen')) ||
    (pathname && pathname.toLowerCase().includes('recent-payments')) ||
    (pathname && pathname.toLowerCase().includes('recentpaymentsscreen')) ||
    (pathname && pathname.toLowerCase().includes('collectfee')) ||
    pathname === '/' ||
    pathname === '';
  const isMainRoute = !isAuthOrFullScreenRoute;

  if (!isMainRoute || !isTabBarVisible) {
    return null;
  }

  // Filter routes matching our app layout
  const visibleRoutes = state.routes.filter((r: any) =>
    ['(tabs)/dashboard/index', '(tabs)/students/index', '(tabs)/batches', '(tabs)/fees', '(tabs)/batches/index', '(tabs)/fees/index'].includes(r.name)
  );

  const tabContent = visibleRoutes.map((route: any) => {
    const { options } = descriptors[route.key];
    const label = options.title !== undefined ? options.title : route.name;
    const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

    const onPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      LayoutAnimation.configureNext({
        duration: 500,
        create: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.opacity,
          springDamping: 0.85,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.85,
        },
        delete: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.opacity,
          springDamping: 0.85,
        },
      });

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    let IconComponent: any = Home2;
    if (route.name.includes('student')) IconComponent = Profile2User;
    if (route.name.includes('batch')) IconComponent = isFocused ? DocumentText : DocumentText1;
    if (route.name.includes('fee')) IconComponent = Card;

    const onLayout = (event: any) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      setTabLayouts(prev => ({ ...prev, [route.key]: { x, y, width, height } }));
    };

    return (
      <AnimatedTouchableOpacity
        key={route.key}
        onPress={onPress}
        onLayout={onLayout}
        activeOpacity={0.8}
        layout={LinearTransition.duration(350).easing(Easing.out(Easing.exp))}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          paddingHorizontal: isFocused ? 16 : 10,
          paddingVertical: 10,
          borderRadius: 30,
          zIndex: 1,
        }}
      >
        <IconComponent size={22} color={isFocused ? "#FFFFFF" : "#8A8A8E"} variant={isFocused ? "Bold" : "Linear"} />
        {isFocused && (
          <Animated.Text
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{ color: '#FFFFFF', fontWeight: '600', marginLeft: 6, fontSize: 14 }}
            numberOfLines={1}
          >
            {label as string}
          </Animated.Text>
        )}
      </AnimatedTouchableOpacity>
    );
  });

  const tabStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: Platform.OS === 'android' ? '#1C1C1E' : 'rgba(30, 30, 45, 0.85)',
    borderRadius: 40,
    paddingHorizontal: 6,
    paddingVertical: 6,
    overflow: 'hidden' as const,
  };

  return (
    <Animated.View style={[{
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }, animatedStyle]}>

      {/* Sliding indicator tab container */}
      <View style={{
        flex: 1,
        marginRight: 12,
        borderRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: Platform.OS === 'android' ? 0 : 10,
        backgroundColor: 'transparent',
      }}>
        {Platform.OS === 'android' ? (
          <View style={tabStyle}>
            <Animated.View style={indicatorStyle} />
            {tabContent}
          </View>
        ) : (
          <BlurView
            intensity={80}
            tint="dark"
            blurMethod="dimezisBlurView"
            style={tabStyle}
          >
            <Animated.View style={indicatorStyle} />
            {tabContent}
          </BlurView>
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onAddPress();
        }}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#F67300',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#F6730050',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <Add size={30} color="#FFFFFF" variant="Linear" />
      </TouchableOpacity>

    </Animated.View>
  );
}

export default function AppTabs() {
  const [isQuickActionsVisible, setQuickActionsVisible] = useState(false);

  return (
    <TabBarVisibilityProvider>
      <Tabs
        initialRouteName="(auth)/login"
        tabBar={props => <CustomInstructorTabBar {...props as any} onAddPress={() => setQuickActionsVisible(true)} />}
        screenOptions={{
          headerShown: false,
          animation:'shift',
        }}
      >
        {/* Visible Tabs */}
        <Tabs.Screen name="(tabs)/dashboard/index" options={{ title: 'Home' }} />
        <Tabs.Screen name="(tabs)/batches" options={{ title: 'Batches' }} />
        <Tabs.Screen name="(tabs)/students/index" options={{ title: 'Student' }} />
        <Tabs.Screen name="(tabs)/fees" options={{ title: 'Fees' }} />

        {/* Hidden Tabs / Screens */}
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="(tabs)/notifications/index" options={{ href: null }} />
        <Tabs.Screen name="(tabs)/reports/index" options={{ href: null }} />
        <Tabs.Screen name="(tabs)/settings/index" options={{ href: null }} />
        <Tabs.Screen name="(auth)/login" options={{ href: null }} />
      </Tabs>

      <QuickActionsModal
        visible={isQuickActionsVisible}
        onClose={() => setQuickActionsVisible(false)}
      />
    </TabBarVisibilityProvider>
  );
}

