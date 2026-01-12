import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface StreakCardProps {
  streak: number;
}

function StreakCard({ streak }: StreakCardProps) {
  const message = useMemo(() => {
    if (streak === 0) {
      return "Start your streak by waking up on time!";
    } else if (streak === 1) {
      return "Great start! Keep it going tomorrow.";
    } else if (streak < 5) {
      return "You're building momentum!";
    } else if (streak < 10) {
      return "Impressive streak! You're developing a habit.";
    } else {
      return "Amazing discipline! You're a wake-up champion!";
    }
  }, [streak]);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Flame size={24} color={colors.warning} />
        <Text style={styles.title}>Current Streak</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.streakCount}>{streak}</Text>
        <Text style={styles.streakLabel}>
          {streak === 1 ? 'day' : 'days'}
        </Text>
      </View>
      
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  streakCount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.warning,
    marginRight: 8,
  },
  streakLabel: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default React.memo(StreakCard);