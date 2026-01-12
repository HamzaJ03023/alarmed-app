import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, Volume2, Vibrate, HelpCircle, Info, Quote, VolumeX, AlertTriangle } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { colors } from '@/constants/colors';
import { useAlarmStore } from '@/store/alarm-store';

export default function SettingsScreen() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const clearHistory = useAlarmStore(state => state.clearHistory);
  const clearAlarms = useAlarmStore(state => state.clearAlarms);
  const quotes = useAlarmStore(state => state.quotes);
  
  // Get and set volume from store
  const volume = useAlarmStore(state => state.volume);
  const setVolume = useAlarmStore(state => state.setVolume);
  
  // Get and set crescendo option from store
  const crescendoEnabled = useAlarmStore(state => state.crescendoEnabled);
  const setCrescendoEnabled = useAlarmStore(state => state.setCrescendoEnabled);
  
  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all alarm history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => clearHistory()
        }
      ]
    );
  }, [clearHistory]);
  
  const handleClearAlarms = useCallback(() => {
    Alert.alert(
      'Clear All Alarms',
      'Are you sure you want to delete all alarms? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => clearAlarms()
        }
      ]
    );
  }, [clearAlarms]);
  
  const handleAbout = useCallback(() => {
    Alert.alert(
      'About Alarmed',
      'Alarmed is an app designed to help you wake up on time by requiring you to answer questions before turning off the alarm. Version 1.0.0',
      [{ text: 'OK' }]
    );
  }, []);
  
  const handleHelp = useCallback(() => {
    Alert.alert(
      'How to Use Alarmed',
      '1. Create alarms with custom settings\n2. When an alarm rings, you must answer questions to turn it off\n3. Track your wake-up streak in the History tab\n4. Add your own motivational quotes to see when you wake up',
      [{ text: 'OK' }]
    );
  }, []);
  
  const handleManageQuotes = useCallback(() => {
    router.push('/quotes');
  }, [router]);
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
      scrollEnabled={true}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.warningCard}>
        <AlertTriangle size={22} color={colors.warning} />
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Important</Text>
          <Text style={styles.warningDescription}>
            Keep the app running in the background for alarms to work. Closing the app will prevent alarms from ringing.
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alarm Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Volume2 size={20} color={colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Sound</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: colors.switchTrack, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.switchThumb}
            ios_backgroundColor={colors.switchTrack}
          />
        </View>
        
        {/* Volume Slider */}
        <View style={styles.volumeContainer}>
          <View style={styles.volumeIcons}>
            <VolumeX size={16} color={colors.textSecondary} />
            <Volume2 size={20} color={colors.primary} />
          </View>
          <Slider
            style={styles.volumeSlider}
            value={volume}
            onValueChange={setVolume}
            minimumValue={0.3}
            maximumValue={1.0}
            step={0.1}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <Text style={styles.volumeText}>
            {Math.round(volume * 100)}%
          </Text>
        </View>
        
        {/* Crescendo Option */}
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Volume2 size={20} color={colors.textSecondary} style={styles.settingIcon} />
            <View>
              <Text style={styles.settingLabel}>Crescendo Alarm</Text>
              <Text style={styles.settingDescription}>
                Gradually increase volume over time
              </Text>
            </View>
          </View>
          <Switch
            value={crescendoEnabled}
            onValueChange={setCrescendoEnabled}
            trackColor={{ false: colors.switchTrack, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.switchThumb}
            ios_backgroundColor={colors.switchTrack}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Vibrate size={20} color={colors.textSecondary} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Vibration</Text>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            trackColor={{ false: colors.switchTrack, true: colors.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : colors.switchThumb}
            ios_backgroundColor={colors.switchTrack}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleManageQuotes}
        >
          <Quote size={20} color={colors.textSecondary} style={styles.buttonIcon} />
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonText}>Motivational Quotes</Text>
            <Text style={styles.buttonSubtext}>{quotes.length} quotes</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleClearHistory}>
          <Trash2 size={20} color={colors.error} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, styles.dangerText]}>Clear Alarm History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleClearAlarms}>
          <Trash2 size={20} color={colors.error} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, styles.dangerText]}>Delete All Alarms</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleHelp}>
          <HelpCircle size={20} color={colors.textSecondary} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>How to Use</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleAbout}>
          <Info size={20} color={colors.textSecondary} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>About Alarmed</Text>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  warningCard: {
    backgroundColor: colors.warningBackground,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 6,
  },
  warningDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.warning,
    lineHeight: 18,
    opacity: 0.9,
  },
  section: {
    marginBottom: 28,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 0,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  volumeContainer: {
    paddingVertical: 18,
    borderBottomWidth: 0,
  },
  volumeIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  volumeSlider: {
    height: 40,
  },
  volumeText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 0,
  },
  buttonIcon: {
    marginRight: 14,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buttonSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dangerText: {
    color: colors.error,
  },
});