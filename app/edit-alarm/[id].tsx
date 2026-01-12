import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAlarmStore } from '@/store/alarm-store';
import { colors } from '@/constants/colors';
import { formatTimeFromDate } from '@/utils/time';
import DaySelector from '@/components/DaySelector';
import { RepeatDay, QuestionDifficulty, QuestionCategory } from '@/types/alarm';
import { Trash2, Quote } from 'lucide-react-native';

export default function EditAlarmScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alarms = useAlarmStore(state => state.alarms);
  const updateAlarm = useAlarmStore(state => state.updateAlarm);
  const deleteAlarm = useAlarmStore(state => state.deleteAlarm);
  const addQuote = useAlarmStore(state => state.addQuote);
  const quotes = useAlarmStore(state => state.quotes);
  
  const alarm = alarms.find(a => a.id === id);
  
  const [date, setDate] = useState(() => {
    if (alarm) {
      const [hours, minutes] = alarm.time.split(':').map(Number);
      const newDate = new Date();
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    }
    return new Date();
  });
  
  const [showTimePicker, setShowTimePicker] = useState(Platform.OS === 'ios');
  const [label, setLabel] = useState(alarm?.label || '');
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>(alarm?.repeatDays || []);
  const [questionCount, setQuestionCount] = useState(alarm?.questionCount || 3);
  const [questionDifficulty, setQuestionDifficulty] = useState<QuestionDifficulty>(
    alarm?.questionDifficulty || 'medium'
  );
  const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>(
    alarm?.questionCategories || ['math', 'general', 'puzzle']
  );
  const [vibrate, setVibrate] = useState(alarm?.vibrate ?? true);
  const [newQuote, setNewQuote] = useState('');
  const [showQuoteInput, setShowQuoteInput] = useState(false);
  
  useEffect(() => {
    if (!alarm) {
      Alert.alert('Error', 'Alarm not found');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    }
  }, [alarm, router]);
  
  const handleDayToggle = (day: RepeatDay) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter(d => d !== day));
    } else {
      setRepeatDays([...repeatDays, day]);
    }
  };
  
  const handleSelectAllDays = (selected: boolean) => {
    if (selected) {
      setRepeatDays(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
    } else {
      setRepeatDays([]);
    }
  };
  
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
  
  const handleAddQuote = () => {
    if (newQuote.trim()) {
      addQuote(newQuote.trim());
      setNewQuote('');
      setShowQuoteInput(false);
    }
  };
  
  const handleSave = () => {
    if (!alarm) return;
    
    const time = formatTimeFromDate(date);
    
    updateAlarm(alarm.id, {
      time,
      label,
      repeatDays,
      questionCount,
      questionDifficulty,
      questionCategories,
      vibrate,
    });
    
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  
  const handleDelete = () => {
    if (!alarm) return;
    
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteAlarm(alarm.id);
            router.push('/');
          }
        }
      ]
    );
  };
  
  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  
  if (!alarm) {
    return null;
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.timePickerContainer}>
        <View style={styles.timeSection}>
          <Text style={styles.timeSectionLabel}>Set Time</Text>
          <TouchableOpacity 
            style={styles.timeDisplay} 
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.timeText}>
              {date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </Text>
            <Text style={styles.tapToChangeText}>Tap to change</Text>
          </TouchableOpacity>
        </View>
        
        {showTimePicker && Platform.OS === 'ios' && (
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
        
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={date}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Alarm Details</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Label</Text>
          <TextInput
            style={styles.textInput}
            value={label}
            onChangeText={setLabel}
            placeholder="Alarm label (optional)"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Repeat</Text>
          <DaySelector 
            selectedDays={repeatDays} 
            onDayToggle={handleDayToggle} 
            onSelectAll={handleSelectAllDays}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Vibrate</Text>
          <Switch
            value={vibrate}
            onValueChange={setVibrate}
            trackColor={{ false: colors.switchTrack, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.switchThumb}
            ios_backgroundColor={colors.switchTrack}
          />
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
      
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Motivational Quote</Text>
        
        <View style={styles.quoteInfoContainer}>
          <Quote size={20} color={colors.primary} style={styles.quoteIcon} />
          <Text style={styles.quoteInfo}>
            You have {quotes.length} motivational quotes that will be randomly shown after completing your alarm challenge.
          </Text>
        </View>
        
        {showQuoteInput ? (
          <View style={styles.quoteInputContainer}>
            <TextInput
              style={styles.quoteInput}
              value={newQuote}
              onChangeText={setNewQuote}
              placeholder="Enter a new motivational quote..."
              placeholderTextColor={colors.textSecondary}
              multiline
              autoFocus
            />
            <View style={styles.quoteButtonsContainer}>
              <TouchableOpacity 
                style={[styles.quoteButton, styles.cancelQuoteButton]} 
                onPress={() => {
                  setShowQuoteInput(false);
                  setNewQuote('');
                }}
              >
                <Text style={styles.quoteButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.quoteButton, 
                  styles.addQuoteButton,
                  !newQuote.trim() && styles.disabledButton
                ]} 
                onPress={handleAddQuote}
                disabled={!newQuote.trim()}
              >
                <Text style={styles.quoteButtonText}>Add Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addQuoteButtonLarge} 
            onPress={() => setShowQuoteInput(true)}
          >
            <Quote size={16} color={colors.text} style={styles.addQuoteIcon} />
            <Text style={styles.addQuoteText}>Add New Quote</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]} 
          onPress={handleDelete}
        >
          <Trash2 size={20} color={colors.text} style={styles.buttonIcon} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        
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
          <Text style={styles.saveButtonText}>Save</Text>
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
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  timeSection: {
    width: '100%',
    alignItems: 'center',
  },
  timeSectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  timeDisplay: {
    backgroundColor: colors.card,
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  tapToChangeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  timePicker: {
    width: Platform.OS === 'ios' ? '100%' : undefined,
    height: Platform.OS === 'ios' ? 180 : undefined,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    padding: Platform.OS === 'ios' ? 16 : 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  counterValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 32,
    minWidth: 50,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'visible',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  quoteInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.inputBackground,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  quoteIcon: {
    marginRight: 12,
  },
  quoteInfo: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  quoteInputContainer: {
    marginBottom: 8,
  },
  quoteInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  quoteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  quoteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginLeft: 8,
  },
  cancelQuoteButton: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  addQuoteButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quoteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  addQuoteButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addQuoteIcon: {
    marginRight: 8,
  },
  addQuoteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  saveButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
});