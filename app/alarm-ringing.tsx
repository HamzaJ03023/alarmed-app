import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useAlarmStore } from '@/store/alarm-store';
import { colors } from '@/constants/colors';
import { getRandomQuestions } from '@/data/questions';
import QuestionCard from '@/components/QuestionCard';
import { formatTime12h } from '@/utils/time';
import { Question } from '@/types/alarm';
import MotivationalQuote from '@/components/MotivationalQuote';

export default function AlarmRingingScreen() {
  const router = useRouter();
  const activeAlarmId = useAlarmStore(state => state.activeAlarmId);
  const alarms = useAlarmStore(state => state.alarms);
  const addHistory = useAlarmStore(state => state.addHistory);
  const setActiveAlarm = useAlarmStore(state => state.setActiveAlarm);
  const quotes = useAlarmStore(state => state.quotes);
  const volume = useAlarmStore(state => state.volume);
  const crescendoEnabled = useAlarmStore(state => state.crescendoEnabled);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [snoozeCount, setSnoozeCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<string>('');
  const [currentVolume, setCurrentVolume] = useState(crescendoEnabled ? 0.3 : volume);
  const [soundError, setSoundError] = useState<string>('');
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const volumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const alarm = alarms.find(a => a.id === activeAlarmId);
  
  // Set audio mode FIRST before any sound operations
  useEffect(() => {
    const initAudio = async () => {
      try {
        console.log('Setting up audio mode...');
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
        console.log('Audio mode set successfully');
      } catch (error) {
        console.error('Error setting audio mode:', error);
        setSoundError('Failed to set audio mode');
      }
    };
    
    initAudio();
    
    return () => {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      }).catch(error => console.log('Error resetting audio mode:', error));
    };
  }, []);
  
  useEffect(() => {
    if (!alarm) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
      return;
    }
    
    const randomQuestions = getRandomQuestions(
      50,
      alarm.questionDifficulty,
      alarm.questionCategories
    );
    setQuestions(randomQuestions);
    console.log('Generated questions pool:', randomQuestions.length, 'questions. Need', alarm.questionCount, 'correct answers.');
    
    // Play alarm sound - wait a bit for audio mode to be set
    async function playSound() {
      try {
        console.log('=== Starting alarm sound setup ===');
        console.log('Platform:', Platform.OS);
        console.log('Initial volume:', crescendoEnabled ? 0.3 : volume);
        console.log('Crescendo enabled:', crescendoEnabled);
        
        // Wait a bit to ensure audio mode is set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use alarm sound from URL
        const soundSource = { uri: 'https://cdn.pixabay.com/download/audio/2024/09/23/audio_6215507008.mp3?filename=lo-fi-alarm-clock-243766.mp3' };
        
        console.log('Loading sound from local file');
        
        const { sound: newSound } = await Audio.Sound.createAsync(
          soundSource,
          { 
            shouldPlay: false, 
            isLooping: true, 
            volume: crescendoEnabled ? 0.5 : volume,
            isMuted: false,
          },
          (status) => {
            if (status.isLoaded) {
              console.log('🔊 Sound callback - isPlaying:', status.isPlaying, 'volume:', status.volume);
              setIsPlaying(status.isPlaying);
            } else if (!status.isLoaded && 'error' in status) {
              console.error('❌ Sound playback error in callback:', status.error);
              setSoundError('Playback error: ' + status.error);
            }
          }
        );
        
        // Check if sound loaded
        const loadStatus = await newSound.getStatusAsync();
        if (!loadStatus.isLoaded) {
          console.error('❌ Sound failed to load');
          setSoundError('Sound failed to load');
          return;
        }
        
        console.log('✓ Sound loaded successfully');
        setSoundLoaded(true);
        setSound(newSound);
        setSoundError('');
        
        // CRITICAL: Play the sound and wait for confirmation
        console.log('▶️ Starting playback...');
        await newSound.playAsync();
        
        // Wait a moment for playback to start
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify playback started
        const playStatus = await newSound.getStatusAsync();
        if (playStatus.isLoaded) {
          console.log('📊 Final playback status:', {
            isPlaying: playStatus.isPlaying,
            positionMillis: playStatus.positionMillis,
            durationMillis: playStatus.durationMillis,
            volume: playStatus.volume,
            isLooping: playStatus.isLooping,
            isMuted: playStatus.isMuted,
          });
          
          if (playStatus.isPlaying) {
            console.log('✅ SOUND IS CONFIRMED PLAYING!');
            setIsPlaying(true);
          } else {
            console.error('⚠️ Sound loaded but NOT playing');
            setSoundError('Sound loaded but not playing');
            // Try playing again
            console.log('Attempting to play again...');
            await newSound.playAsync();
          }
        }
        
        // If crescendo is enabled, gradually increase volume
        if (crescendoEnabled) {
          console.log('Starting crescendo effect...');
          let vol = 0.5;
          volumeIntervalRef.current = setInterval(async () => {
            if (vol < volume && newSound) {
              vol = Math.min(vol + 0.05, volume);
              setCurrentVolume(vol);
              try {
                await newSound.setVolumeAsync(vol);
                console.log('Crescendo volume:', vol);
              } catch (err) {
                console.log('Error setting volume:', err);
              }
            } else {
              if (volumeIntervalRef.current) {
                clearInterval(volumeIntervalRef.current);
                console.log('Crescendo complete');
              }
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ CRITICAL ERROR playing sound:', error);
        console.error('Error stack:', (error as Error).stack);
        setSoundError('Critical error: ' + (error as Error).message);
      }
    }
    
    // Start vibration pattern
    if (alarm.vibrate && Platform.OS !== 'web') {
      const PATTERN = [1000, 2000, 3000];
      Vibration.vibrate(PATTERN, true);
    }
    
    playSound();
    
    // Select a random quote from the user's quotes or use default
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setSelectedQuote(quotes[randomIndex]);
    } else {
      setSelectedQuote("Rise and shine! Today is full of possibilities.");
    }
    
    return () => {
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
    };
  }, [alarm, router, quotes, volume, crescendoEnabled]);
  
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
      if (Platform.OS !== 'web') {
        Vibration.cancel();
      }
    };
  }, [sound]);
  
  const handleAnswer = useCallback((isCorrect: boolean) => {
    console.log('handleAnswer called with isCorrect:', isCorrect);
    
    if (Platform.OS !== 'web') {
      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    
    if (isCorrect) {
      setCorrectAnswers(prevCorrect => {
        const newCorrectCount = prevCorrect + 1;
        console.log('✓ Correct answer! Count:', newCorrectCount, '/', alarm?.questionCount);
        
        if (alarm && newCorrectCount >= alarm.questionCount) {
          console.log('✅ Required correct answers reached! Stopping alarm...');
          
          if (sound) {
            sound.stopAsync().catch(err => console.log('Error stopping sound:', err));
          }
          if (Platform.OS !== 'web') {
            Vibration.cancel();
          }
          if (volumeIntervalRef.current) {
            clearInterval(volumeIntervalRef.current);
          }
          
          setCompleted(true);
        } else {
          console.log('Moving to next question...');
          setCurrentQuestionIndex(prev => prev + 1);
        }
        
        return newCorrectCount;
      });
    } else {
      console.log('✗ Wrong answer. Keep trying...');
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [alarm, sound]);
  
  const handleSnooze = useCallback(() => {
    setSnoozeCount(prev => prev + 1);
    
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    
    if (alarm) {
      const newQuestions = getRandomQuestions(
        50,
        alarm.questionDifficulty,
        alarm.questionCategories
      );
      setQuestions(newQuestions);
    }
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [alarm]);
  
  const handleFinish = useCallback(() => {
    if (!alarm) return;
    
    // Add to history
    addHistory({
      alarmId: alarm.id,
      date: new Date().toISOString(),
      wakeUpTime: new Date().toISOString(),
      questionsAnswered: currentQuestionIndex + 1,
      questionsCorrect: correctAnswers,
      snoozeCount,
      dismissed: false,
    });
    
    // Clear active alarm
    setActiveAlarm(null);
    
    // Navigate back to alarms screen
    router.replace('/');
  }, [alarm, currentQuestionIndex, correctAnswers, snoozeCount, addHistory, setActiveAlarm, router]);
  
  if (!alarm || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
        {soundError !== '' && (
          <Text style={styles.errorText}>{soundError}</Text>
        )}
      </View>
    );
  }
  
  if (completed) {
    return (
      <MotivationalQuote 
        quote={selectedQuote} 
        onContinue={handleFinish} 
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        {soundError !== '' && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {soundError}</Text>
          </View>
        )}
        <View style={[styles.statusIndicator, isPlaying ? styles.statusPlaying : styles.statusNotPlaying]}>
          <Text style={styles.statusText}>
            {soundLoaded ? (isPlaying ? '🔊 Sound Playing' : '⚠️ Sound Loaded but Not Playing') : '⏳ Loading Sound...'}
          </Text>
        </View>
      </View>
      <View style={styles.header}>
        <Text style={styles.time}>
          {formatTime12h(alarm.time)}
        </Text>
        <Text style={styles.label}>
          {alarm.label || 'Alarm'}
        </Text>
        
        {/* Show volume indicator if crescendo is enabled */}
        {crescendoEnabled && (
          <View style={styles.volumeIndicator}>
            <Text style={styles.volumeText}>
              Volume: {Math.round(currentVolume * 100)}%
            </Text>
            <View style={styles.volumeBar}>
              <View 
                style={[
                  styles.volumeFill, 
                  { width: `${currentVolume * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.questionContainer}>
        {currentQuestionIndex < questions.length ? (
          <QuestionCard
            key={questions[currentQuestionIndex].id}
            question={questions[currentQuestionIndex]}
            onAnswer={handleAnswer}
            questionNumber={correctAnswers + 1}
            totalQuestions={alarm.questionCount}
          />
        ) : (
          <View style={styles.outOfQuestionsContainer}>
            <Text style={styles.outOfQuestionsText}>Out of questions!</Text>
            <Text style={styles.outOfQuestionsSubtext}>
              You&apos;ve seen all available questions. Tap &quot;Start Over&quot; to continue.
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.snoozeButton} 
        onPress={handleSnooze}
        activeOpacity={0.7}
      >
        <Text style={styles.snoozeButtonText}>
          Start Over ({snoozeCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  time: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  volumeIndicator: {
    width: '80%',
    alignItems: 'center',
    marginTop: 8,
  },
  volumeText: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  volumeBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  snoozeButton: {
    backgroundColor: colors.error,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  snoozeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  errorBanner: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  statusBar: {
    width: '100%',
  },
  statusIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statusPlaying: {
    backgroundColor: '#1a4d2e',
  },
  statusNotPlaying: {
    backgroundColor: '#4d3319',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  outOfQuestionsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  outOfQuestionsText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  outOfQuestionsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});