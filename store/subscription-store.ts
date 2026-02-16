import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FREE_ALARM_LIMIT = 3;

interface AnalyticsEvent {
  event: string;
  timestamp: string;
  data?: Record<string, any>;
}

interface SubscriptionState {
  isPro: boolean;
  hasCompletedOnboarding: boolean;
  entitlements: string[];
  analyticsEvents: AnalyticsEvent[];
  onboardingStartedAt: string | null;
  onboardingCompletedAt: string | null;
  paywallViewCount: number;

  setIsPro: (isPro: boolean) => void;
  setEntitlements: (entitlements: string[]) => void;
  completeOnboarding: () => void;
  startOnboarding: () => void;
  trackEvent: (event: string, data?: Record<string, any>) => void;
  incrementPaywallViews: () => void;
  getAnalytics: () => AnalyticsEvent[];
  canCreateAlarm: (currentAlarmCount: number) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      isPro: false,
      hasCompletedOnboarding: false,
      entitlements: [],
      analyticsEvents: [],
      onboardingStartedAt: null,
      onboardingCompletedAt: null,
      paywallViewCount: 0,

      setIsPro: (isPro) => set({ isPro }),

      setEntitlements: (entitlements) => set({ entitlements }),

      startOnboarding: () => {
        const now = new Date().toISOString();
        set({ onboardingStartedAt: now });
        get().trackEvent('onboarding_started');
      },

      completeOnboarding: () => {
        const now = new Date().toISOString();
        const startedAt = get().onboardingStartedAt;
        const durationMs = startedAt
          ? new Date(now).getTime() - new Date(startedAt).getTime()
          : null;

        set({
          hasCompletedOnboarding: true,
          onboardingCompletedAt: now,
        });

        get().trackEvent('onboarding_completed', {
          durationMs,
          durationSeconds: durationMs ? Math.round(durationMs / 1000) : null,
        });
      },

      trackEvent: (event, data) => {
        const analyticsEvent: AnalyticsEvent = {
          event,
          timestamp: new Date().toISOString(),
          data,
        };
        set((state) => ({
          analyticsEvents: [...state.analyticsEvents.slice(-99), analyticsEvent],
        }));
        console.log('[Analytics]', event, data || '');
      },

      incrementPaywallViews: () => {
        set((state) => ({ paywallViewCount: state.paywallViewCount + 1 }));
        get().trackEvent('paywall_viewed', {
          viewCount: get().paywallViewCount,
        });
      },

      getAnalytics: () => get().analyticsEvents,

      canCreateAlarm: (currentAlarmCount) => {
        const { isPro } = get();
        if (isPro) return true;
        return currentAlarmCount < FREE_ALARM_LIMIT;
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
