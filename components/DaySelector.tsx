import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { RepeatDay } from '@/types/alarm';
import { Check } from 'lucide-react-native';

interface DaySelectorProps {
  selectedDays: RepeatDay[];
  onDayToggle: (day: RepeatDay) => void;
  onSelectAll: (selected: boolean) => void;
}

function DaySelector({ selectedDays, onDayToggle, onSelectAll }: DaySelectorProps) {
  const days: { key: RepeatDay; label: string }[] = [
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' },
    { key: 'sun', label: 'S' },
  ];
  
  const isDaily = useMemo(() => selectedDays.length === 7, [selectedDays.length]);
  
  const handleDailyToggle = useCallback(() => {
    onSelectAll(!isDaily);
  }, [isDaily, onSelectAll]);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dailyOption}
        onPress={handleDailyToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isDaily && styles.checkboxSelected]}>
          {isDaily && <Check size={16} color={colors.text} />}
        </View>
        <Text style={styles.dailyText}>Daily</Text>
      </TouchableOpacity>
      
      <View style={styles.daysContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.key}
            style={[
              styles.dayButton,
              selectedDays.includes(day.key) && styles.selectedDay,
            ]}
            onPress={() => onDayToggle(day.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayText,
                selectedDays.includes(day.key) && styles.selectedDayText,
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  dailyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dailyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectedDayText: {
    color: colors.text,
    fontWeight: '700',
  },
});

export default React.memo(DaySelector);