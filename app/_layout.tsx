import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Platform, StatusBar, AppState } from "react-native";
import { colors } from "@/constants/colors";
import * as Notifications from 'expo-notifications';
import { useAlarmStore } from "@/store/alarm-store";



export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const appState = useRef(AppState.currentState);
  const alarms = useAlarmStore((state) => state.alarms);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('Notification permission status:', status);
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        nextAppState === 'background'
      ) {
        const activeAlarms = alarms.filter(alarm => alarm.isActive);
        console.log('App went to background. Active alarms:', activeAlarms.length);
        
        if (activeAlarms.length > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⚠️ Keep Alarmed Running",
              body: `You have ${activeAlarms.length} active alarm${activeAlarms.length > 1 ? 's' : ''}. Please keep the app running for alarms to work.`,
              sound: false,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 2,
            },
          });
          console.log('Background notification scheduled');
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [alarms]);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    
      <>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <RootLayoutNav />
      </>
    
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="create-alarm" 
        options={{ 
          title: "Create Alarm",
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }} 
      />
      <Stack.Screen 
        name="edit-alarm/[id]" 
        options={{ 
          title: "Edit Alarm",
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }} 
      />
      <Stack.Screen 
        name="alarm-ringing" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="quotes" 
        options={{ 
          title: "Motivational Quotes",
          presentation: Platform.OS === 'ios' ? 'modal' : 'card',
        }} 
      />
    </Stack>
  );
}