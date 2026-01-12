import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Edit } from 'lucide-react-native';
import { formatTime12h, formatRepeatDays, getNextAlarmTime, formatRelativeTime } from '@/utils/time';
import { useAlarmStore } from '@/store/alarm-store';
import { colors } from '@/constants/colors';
import { Alarm } from '@/types/alarm';

interface AlarmItemProps {
  alarm: Alarm;
}

function AlarmItem({ alarm }: AlarmItemProps) {
  const router = useRouter();
  const toggleAlarm = useAlarmStore(state => state.toggleAlarm);
  
  const handleToggle = useCallback(() => {
    toggleAlarm(alarm.id);
  }, [toggleAlarm, alarm.id]);
  
  const handleEdit = useCallback(() => {
    router.push(`/edit-alarm/${alarm.id}`);
  }, [router, alarm.id]);
  
  const nextAlarmTime = useMemo(() => {
    return alarm.isActive ? getNextAlarmTime(alarm.time, alarm.repeatDays) : null;
  }, [alarm.isActive, alarm.time, alarm.repeatDays]);
  
  const nextAlarmText = useMemo(() => {
    return nextAlarmTime ? formatRelativeTime(nextAlarmTime) : '';
  }, [nextAlarmTime]);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.contentContainer} 
        onPress={handleEdit}
        activeOpacity={0.7}
      >
        <View style={styles.timeContainer}>
          <Text style={[
            styles.time, 
            !alarm.isActive && styles.inactiveText
          ]}>
            {formatTime12h(alarm.time)}
          </Text>
          <Text style={[
            styles.repeat, 
            !alarm.isActive && styles.inactiveText
          ]}>
            {formatRepeatDays(alarm.repeatDays)}
          </Text>
        </View>
        
        <View style={styles.detailsContainer}>
          {alarm.label ? (
            <Text style={[
              styles.label, 
              !alarm.isActive && styles.inactiveText
            ]}>
              {alarm.label}
            </Text>
          ) : null}
          
          {alarm.isActive && nextAlarmText ? (
            <View style={styles.nextAlarmContainer}>
              <Clock size={14} color={colors.primary} style={styles.icon} />
              <Text style={styles.nextAlarm}>{nextAlarmText}</Text>
            </View>
          ) : null}
          
          <View style={styles.challengeContainer}>
            <Text style={[
              styles.challenge, 
              !alarm.isActive && styles.inactiveText
            ]}>
              {alarm.questionCount} {alarm.questionCount === 1 ? 'question' : 'questions'} • {alarm.questionDifficulty}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEdit}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Edit size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <Switch
          value={alarm.isActive}
          onValueChange={handleToggle}
          trackColor={{ false: colors.switchTrack, true: colors.primary }}
          thumbColor={Platform.OS === 'ios' ? undefined : colors.switchThumb}
          ios_backgroundColor={colors.switchTrack}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  timeContainer: {
    marginRight: 16,
  },
  time: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  repeat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  nextAlarmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 4,
  },
  nextAlarm: {
    fontSize: 12,
    color: colors.primary,
  },
  challengeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challenge: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    marginRight: 16,
    padding: 4,
  },
  inactiveText: {
    color: colors.inactive,
  },
});

export default React.memo(AlarmItem);