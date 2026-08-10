import QuickActionsModal from '@/components/quick-actions-modal';
import { TabBarVisibilityProvider, useTabBarVisibility } from '@/context/tab-bar-visibility';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { Add, Card, DocumentText, DocumentText1, Home2, Profile2User } from 'iconsax-react-native';
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
  const { tabBarOffset, isTabBarVisible, showTabBar, hideTabBar } = useTabBarVisibility();
  const [tabLayouts, setTabLayouts] = useState<{ [key: string]: { x: number; y: number; width: number; height: number } }>({});

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarOffset.value }],
    };
  });

  const activeRoute = state.routes[state.index];
  const activeRouteKey = activeRoute?.key;
  const activeRouteName = (activeRoute?.name || '').toLowerCase();
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

  // Strictly determine if the user is on one of the 4 main tab root screens
  const isStrictMainTabRoot = (() => {
    // Top-level tab route name
    const tabName = activeRoute?.name || '';

    // Only these 4 top-level tab routes are valid
    const isAllowedTab = [
      '(tabs)/dashboard',
      '(tabs)/batches',
      '(tabs)/students',
      '(tabs)/fees',
    ].includes(tabName);

    if (!isAllowedTab) {
      return false;
    }

    // Check if there is any nested stack navigation state (e.g. inside (tabs)/dashboard, (tabs)/batches, (tabs)/fees, (tabs)/students)
    if (activeRoute?.state) {
      const nestedIndex = activeRoute.state.index ?? 0;
      const nestedRoutes = activeRoute.state.routes || [];
      const currentNestedRoute = nestedRoutes[nestedIndex];
      const nestedRouteName = (currentNestedRoute?.name || '').toLowerCase();

      // If pushed into a subscreen (e.g. pending-fees, upcoming-sessions, StudentListScreen, completed-class, start-class, add, CollectFee, recent-payments, [id])
      if (nestedIndex > 0 || (nestedRouteName && nestedRouteName !== 'index')) {
        return false;
      }
    }

    return true;
  })();

  // Ensure tab bar visibility state and position are perfectly synchronized with the route
  React.useEffect(() => {
    if (isStrictMainTabRoot) {
      showTabBar();
    } else {
      hideTabBar();
    }
  }, [isStrictMainTabRoot, activeRouteKey, activeRoute?.state?.index]);

  if (!isStrictMainTabRoot) {
    return null;
  }

  // Filter routes matching our app layout
  const visibleRoutes = state.routes.filter((r: any) =>
    ['(tabs)/dashboard', '(tabs)/batches', '(tabs)/students', '(tabs)/fees'].includes(r.name)
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
          springDamping: 0.7,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.7,
        },
      });

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    const getIcon = (routeName: string, isFocused: boolean) => {
      const color = isFocused ? '#FFFFFF' : '#8E8E93';
      const variant = isFocused ? 'Bold' : 'Linear';
      const size = 24;

      if (routeName.includes('dashboard')) return <Home2 size={size} color={color} variant={variant} />;
      if (routeName.includes('batches')) {
        return isFocused ? (
          <DocumentText size={size} color={color} variant="Bold" />
        ) : (
          <DocumentText1 size={size} color={color} variant="Linear" />
        );
      }
      if (routeName.includes('students')) return <Profile2User size={size} color={color} variant={variant} />;
      if (routeName.includes('fees')) return <Card size={size} color={color} variant={variant} />;
      return <DocumentText size={size} color={color} variant={variant} />;
    };

    return (
      <AnimatedTouchableOpacity
        key={route.key}
        layout={LinearTransition.springify().damping(16).mass(0.6).stiffness(120)}
        onPress={onPress}
        onLongPress={onLongPress}
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          setTabLayouts((prev) => ({
            ...prev,
            [route.key]: { x, y, width, height },
          }));
        }}
        activeOpacity={1}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          paddingHorizontal: isFocused ? 14 : 10,
          borderRadius: 30,
          zIndex: 2,
        }}
      >
        <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
          {getIcon(route.name, isFocused)}
        </View>

        {isFocused && (
          <Animated.Text
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            numberOfLines={1}
            style={{
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: '700',
              fontFamily: 'Urbanist-Bold',
              marginLeft: 8,
            }}
          >
            {label}
          </Animated.Text>
        )}
      </AnimatedTouchableOpacity>
    );
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 15,
          left: 20,
          right: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000,
          elevation: 10,
        },
        animatedStyle,
      ]}
    >
      {/* Pill Container for Tab Items */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 36,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#1C1C1E',
          overflow: 'hidden',
          paddingVertical: 6,
          paddingHorizontal: 8,
          marginRight: 14,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(28, 28, 30, 0.85)',
            }}
          />
        )}

        {/* Sliding Indicator Background */}
        <Animated.View style={indicatorStyle} />

        {tabContent}
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
        backBehavior="history"
        tabBar={props => <CustomInstructorTabBar {...props as any} onAddPress={() => setQuickActionsVisible(true)} />}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
        }}
      >
        {/* Visible Tabs */}
        <Tabs.Screen name="(tabs)/dashboard" options={{ title: 'Home' }} />
        <Tabs.Screen name="(tabs)/batches" options={{ title: 'Batches' }} />
        <Tabs.Screen name="(tabs)/students" options={{ title: 'Student' }} />
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
