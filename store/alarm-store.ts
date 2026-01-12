import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmHistory } from '@/types/alarm';

interface AlarmState {
  alarms: Alarm[];
  history: AlarmHistory[];
  activeAlarmId: string | null;
  quotes: string[];
  volume: number;
  crescendoEnabled: boolean;
  addAlarm: (alarm: Omit<Alarm, 'id'>) => string;
  updateAlarm: (id: string, alarm: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  addHistory: (history: Omit<AlarmHistory, 'id'>) => void;
  setActiveAlarm: (id: string | null) => void;
  getStreakCount: () => number;
  clearHistory: () => void;
  clearAlarms: () => void;
  addQuote: (quote: string) => void;
  updateQuote: (index: number, quote: string) => void;
  deleteQuote: (index: number) => void;
  setVolume: (volume: number) => void;
  setCrescendoEnabled: (enabled: boolean) => void;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: [],
      history: [],
      activeAlarmId: null,
      quotes: [
        "Rise and shine! Today is full of possibilities.",
        "Every morning is a new beginning, a new chance to change your life.",
        "The only way to do great work is to love what you do.",
        "Your future is created by what you do today, not tomorrow.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts."
      ],
      volume: 1.0, // Maximum volume by default
      crescendoEnabled: false, // Crescendo disabled by default
      
      addAlarm: (alarm) => {
        const id = Date.now().toString();
        set((state) => ({
          alarms: [...state.alarms, { ...alarm, id }],
        }));
        return id;
      },
      
      updateAlarm: (id, updatedAlarm) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) => 
            alarm.id === id ? { ...alarm, ...updatedAlarm } : alarm
          ),
        }));
      },
      
      deleteAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        }));
      },
      
      toggleAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) => 
            alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
          ),
        }));
      },
      
      addHistory: (historyItem) => {
        const id = Date.now().toString();
        set((state) => ({
          history: [...state.history, { ...historyItem, id }],
        }));
      },
      
      setActiveAlarm: (id) => {
        set({ activeAlarmId: id });
      },
      
      getStreakCount: () => {
        const { history } = get();
        if (history.length === 0) return 0;
        
        // Sort history by date
        const sortedHistory = [...history].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let currentDate = new Date(today);
        
        // Check for consecutive days
        for (const record of sortedHistory) {
          const recordDate = new Date(record.date);
          recordDate.setHours(0, 0, 0, 0);
          
          // If this is today's record, count it and move to yesterday
          if (recordDate.getTime() === currentDate.getTime()) {
            if (!record.dismissed) {
              streak++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else {
              break; // Streak broken by dismissal
            }
          } 
          // If we missed a day, streak is broken
          else if ((currentDate.getTime() - recordDate.getTime()) > 86400000) {
            break;
          } 
          // If this is the expected previous day
          else if (recordDate.getTime() === currentDate.getTime() - 86400000) {
            if (!record.dismissed) {
              streak++;
              currentDate = recordDate;
            } else {
              break; // Streak broken by dismissal
            }
          }
        }
        
        return streak;
      },
      
      clearHistory: () => {
        set({ history: [] });
      },
      
      clearAlarms: () => {
        set({ alarms: [] });
      },
      
      addQuote: (quote) => {
        set((state) => ({
          quotes: [...state.quotes, quote],
        }));
      },
      
      updateQuote: (index, quote) => {
        set((state) => ({
          quotes: state.quotes.map((q, i) => 
            i === index ? quote : q
          ),
        }));
      },
      
      deleteQuote: (index) => {
        set((state) => ({
          quotes: state.quotes.filter((_, i) => i !== index),
        }));
      },
      
      setVolume: (volume) => {
        set({ volume });
      },
      
      setCrescendoEnabled: (crescendoEnabled) => {
        set({ crescendoEnabled });
      },
    }),
    {
      name: 'alarmed-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);