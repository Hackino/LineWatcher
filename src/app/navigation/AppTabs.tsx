import React from 'react';
import { Pressable } from 'react-native';
import { createBottomTabNavigator, type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import type { AppTabsParamList } from './types';
import { colors, typography, NeonTabBarBackground } from '@ds';
import { HomeScreen } from '@features/dashboard/presentation/screens/HomeScreen';
import { HistoryScreen } from '@features/readings/presentation/screens/HistoryScreen';
import { AnalyticsScreen } from '@features/analytics/presentation/screens/AnalyticsScreen';
import { LeakScreen } from '@features/leak/presentation/screens/LeakScreen';
import { SettingsScreen } from '@features/settings/presentation/screens/SettingsScreen';
import HomeIcon from '../../../assets/svg/home.svg';
import HistoryIcon from '../../../assets/svg/history.svg';
import AnalyticsIcon from '../../../assets/svg/analytics.svg';
import ShieldIcon from '../../../assets/svg/shield.svg';
import SettingsIcon from '../../../assets/svg/settings.svg';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const ICONS: Record<keyof AppTabsParamList, React.FC<SvgProps>> = {
  Home: HomeIcon,
  History: HistoryIcon,
  Analytics: AnalyticsIcon,
  Leak: ShieldIcon,
  Settings: SettingsIcon,
};

const ARCH_RISE = 18;
const BASE_HEIGHT = 58;

/** Custom tab button — kills the default Android ripple; fades on press. */
function NeonTabButton({
  children,
  onPress,
  onLongPress,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
  testID,
  style,
}: BottomTabBarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      android_ripple={null}
      android_disableSound
      style={({ pressed }) => [
        style,
        { flex: 1, alignItems: 'center', justifyContent: 'center' },
        pressed && { opacity: 0.6 },
      ]}
    >
      {children}
    </Pressable>
  );
}

export function AppTabs() {
  const insets = useSafeAreaInsets();
  const totalHeight = BASE_HEIGHT + insets.bottom + ARCH_RISE;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarBackground: () => (
          <NeonTabBarBackground height={totalHeight} archRise={ARCH_RISE} />
        ),
        tabBarButton: (props) => <NeonTabButton {...props} />,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: totalHeight,
          paddingBottom: insets.bottom + 6,
          paddingTop: ARCH_RISE + 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: typography.label.weight,
        },
        tabBarIcon: ({ color }) => {
          const Icon = ICONS[route.name];
          return <Icon color={color} width={22} height={22} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Leak" component={LeakScreen} options={{ title: 'Anti-theft' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
