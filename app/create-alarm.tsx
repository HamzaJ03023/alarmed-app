import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAlarmStore } from '@/store/alarm-store';
import { colors } from '@/constants/colors';
import { formatTimeFromDate } from '@/utils/time';
import { RepeatDay, QuestionDifficulty, QuestionCategory } from '@/types/alarm';

export default function CreateAlarmScreen() {
  const router = useRouter();
  const addAlarm = useAlarmStore(state => state.addAlarm);
  
  const [date, setDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>([]);
  const [questionCount, setQuestionCount] = useState(3);
  const [questionDifficulty, setQuestionDifficulty] = useState<QuestionDifficulty>('medium');
  const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>(['math', 'general', 'puzzle']);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  
  const handleDayToggle = useCallback((day: RepeatDay) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter(d => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  }, [repeatDays]);
  
  const handleCategoryToggle = (category: QuestionCategory) => {
    if (questionCategories.includes(category)) {
      // Don't allow removing the last category
      if (questionCategories.length > 1) {
        setQuestionCategories(questionCategories.filter(c => c !== category));
      }
    } else {
      setQuestionCategories([...questionCategories, category]);
    }
  };
  
  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const handleSave = () => {
    const time = formatTimeFromDate(date);
    
    addAlarm({
      time,
      label,
      isActive: true,
      repeatDays,
      questionCount,
      questionDifficulty,
      questionCategories,
      sound: 'default',
      vibrate: true,
    });
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  
  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Set Time</Text>
        
        <TouchableOpacity 
          style={styles.timeCard}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.timeLabel}>Alarm Time</Text>
          <Text style={styles.timeDisplay}>{formatTimeFromDate(date)}</Text>
        </TouchableOpacity>
        
        {Platform.OS === 'ios' && showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={handleTimeChange}
            style={styles.timePicker}
            textColor={colors.text}
          />
        )}
        
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )}
        
        {Platform.OS === 'web' && showTimePicker && (
          <View style={styles.webTimePickerContainer}>
            <DateTimePicker
              value={date}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleTimeChange}
              style={styles.timePicker}
            />
          </View>
        )}
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Alarm Details</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={label}
            onChangeText={setLabel}
            placeholder="Alarm label (optional)"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <View style={styles.repeatContainer}>
          <View style={styles.repeatHeader}>
            <Text style={styles.repeatLabel}>Repeat</Text>
            <Switch
              value={repeatEnabled}
              onValueChange={setRepeatEnabled}
              trackColor={{ false: colors.switchTrack, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : colors.switchThumb}
              ios_backgroundColor={colors.switchTrack}
            />
          </View>
          {repeatEnabled && (
            <View style={styles.daysRow}>
              {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as RepeatDay[]).map((day, index) => {
                const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      repeatDays.includes(day) && styles.dayButtonActive,
                    ]}
                    onPress={() => handleDayToggle(day)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        repeatDays.includes(day) && styles.dayTextActive,
                      ]}
                    >
                      {labels[index]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Wake-Up Challenge</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Number of Questions</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setQuestionCount(Math.max(1, questionCount - 1))}
              disabled={questionCount <= 1}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.counterValue}>{questionCount}</Text>
            
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setQuestionCount(Math.min(5, questionCount + 1))}
              disabled={questionCount >= 5}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Difficulty</Text>
          <View style={styles.segmentedControl}>
            {(['easy', 'medium', 'hard'] as QuestionDifficulty[]).map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.segmentButton,
                  questionDifficulty === difficulty && styles.segmentButtonActive,
                ]}
                onPress={() => setQuestionDifficulty(difficulty)}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    questionDifficulty === difficulty && styles.segmentButtonTextActive,
                  ]}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Question Categories</Text>
          <View style={styles.categoriesContainer}>
            {(['math', 'general', 'puzzle'] as QuestionCategory[]).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  questionCategories.includes(category) && styles.categoryButtonActive,
                  // Disable if it's the only category left
                  questionCategories.length === 1 && questionCategories.includes(category) && styles.categoryButtonDisabled,
                ]}
                onPress={() => handleCategoryToggle(category)}
                disabled={questionCategories.length === 1 && questionCategories.includes(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    questionCategories.includes(category) && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Alarm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  timePicker: {
    width: Platform.OS === 'ios' ? '100%' : undefined,
    height: Platform.OS === 'ios' ? 180 : undefined,
    marginBottom: 20,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 0,
  },
  repeatContainer: {
    marginBottom: 0,
  },
  repeatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  repeatLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 40,
    minWidth: 60,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentButtonTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryButtonDisabled: {
    opacity: 0.5,
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.inputBackground,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeCard: {
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  webTimePickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
});