import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAlarmStore } from '@/store/alarm-store';
import StreakCard from '@/components/StreakCard';
import EmptyState from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { Clock, CheckCircle, XCircle, BarChart2 } from 'lucide-react-native';
import { AlarmHistory } from '@/types/alarm';

export default function HistoryScreen() {
  const history = useAlarmStore(state => state.history);
  const alarms = useAlarmStore(state => state.alarms);
  const getStreakCount = useAlarmStore(state => state.getStreakCount);
  
  const streakCount = useMemo(() => getStreakCount(), [getStreakCount]);
  
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [history]);
  
  const renderHistoryItem = useCallback(({ item }: { item: AlarmHistory }) => {
    const alarm = alarms.find(a => a.id === item.alarmId);
    const date = new Date(item.date);
    const wakeUpTime = new Date(item.wakeUpTime);
    
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>
            {date.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
          {item.dismissed ? (
            <View style={styles.statusBadge}>
              <XCircle size={16} color={colors.error} style={styles.statusIcon} />
              <Text style={[styles.statusText, styles.missedText]}>Missed</Text>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <CheckCircle size={16} color={colors.success} style={styles.statusIcon} />
              <Text style={[styles.statusText, styles.successText]}>Completed</Text>
            </View>
          )}
        </View>
        
        <View style={styles.historyDetails}>
          <View style={styles.detailRow}>
            <Clock size={16} color={colors.textSecondary} style={styles.detailIcon} />
            <Text style={styles.detailText}>
              {alarm ? alarm.label || 'Alarm' : 'Deleted Alarm'} • 
              {wakeUpTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </Text>
          </View>
          
          {!item.dismissed && (
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                {item.questionsCorrect}/{item.questionsAnswered} questions correct
              </Text>
              {item.snoozeCount > 0 && (
                <Text style={styles.statText}>
                  • {item.snoozeCount} {item.snoozeCount === 1 ? 'snooze' : 'snoozes'}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }, [alarms]);
  
  if (history.length === 0) {
    return (
      <EmptyState
        title="No History Yet"
        description="Your alarm history will appear here once you've used your alarms."
        actionText="Create Alarm"
        icon={<BarChart2 size={64} color={colors.primary} />}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={sortedHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => <StreakCard streak={streakCount} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  historyItem: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  successText: {
    color: colors.success,
  },
  missedText: {
    color: colors.error,
  },
  historyDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});