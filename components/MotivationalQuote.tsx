import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { Quote } from 'lucide-react-native';

interface MotivationalQuoteProps {
  quote: string;
  onContinue: () => void;
}

function MotivationalQuote({ quote, onContinue }: MotivationalQuoteProps) {
  return (
    <View style={styles.container}>
      <View style={styles.quoteContainer}>
        <Quote size={40} color={colors.primary} style={styles.quoteIcon} />
        
        <Text style={styles.quoteText}>{quote}</Text>
        
        <Quote size={40} color={colors.primary} style={[styles.quoteIcon, styles.quoteIconBottom]} />
      </View>
      
      <Text style={styles.congratsText}>
        Congratulations on waking up!
      </Text>
      
      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={onContinue}
        activeOpacity={0.7}
      >
        <Text style={styles.continueButtonText}>
          Start My Day
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  quoteContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 32,
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  quoteIcon: {
    marginBottom: 16,
  },
  quoteIconBottom: {
    transform: [{ rotate: '180deg' }],
    marginBottom: 0,
    marginTop: 16,
  },
  quoteText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  congratsText: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});

export default React.memo(MotivationalQuote);