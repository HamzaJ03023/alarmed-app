import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, AlertTriangle } from 'lucide-react-native';
import { useAlarmStore } from '@/store/alarm-store';
import AlarmItem from '@/components/AlarmItem';
import EmptyState from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { shouldRingToday } from '@/utils/time';

export default function AlarmsScreen() {
  const router = useRouter();
  const alarms = useAlarmStore(state => state.alarms);
  const setActiveAlarm = useAlarmStore(state => state.setActiveAlarm);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const activeAlarms = useMemo(() => {
    return alarms.filter(alarm => alarm.isActive);
  }, [alarms]);
  
  const checkAlarms = useCallback(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    for (const alarm of activeAlarms) {
      const alarmTime = alarm.time;
      
      if (alarmTime === currentTime && shouldRingToday(alarm.repeatDays)) {
        console.log('Alarm triggered:', alarm.id, alarmTime);
        setActiveAlarm(alarm.id);
        router.push('/alarm-ringing');
        break;
      }
    }
  }, [activeAlarms, setActiveAlarm, router]);
  
  useEffect(() => {
    checkAlarms();
    
    intervalRef.current = setInterval(() => {
      checkAlarms();
    }, 10000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkAlarms]);
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkAlarms();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [checkAlarms]);
  
  const handleCreateAlarm = useCallback(() => {
    router.push('/create-alarm');
  }, [router]);
  
  if (alarms.length === 0) {
    return (
      <EmptyState
        title="No Alarms Set"
        description="Create your first alarm to start waking up on time and building better habits."
        actionText="Create Alarm"
        onAction={handleCreateAlarm}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.warningBanner}>
        <AlertTriangle size={18} color={colors.warning} />
        <Text style={styles.warningText}>
          Keep the app running for alarms to work
        </Text>
      </View>
      
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlarmItem alarm={item} />}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      
      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleCreateAlarm}
        activeOpacity={0.8}
      >
        <Plus size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  warningBanner: {
    backgroundColor: colors.warningBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});