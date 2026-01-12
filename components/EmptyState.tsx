import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AlarmClock, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  icon?: React.ReactNode;
  onAction?: () => void;
}

function EmptyState({
  title,
  description,
  actionText,
  icon,
  onAction,
}: EmptyStateProps) {
  const router = useRouter();
  
  const handleAction = useCallback(() => {
    if (onAction) {
      onAction();
    } else {
      router.push('/create-alarm');
    }
  }, [onAction, router]);
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon || <AlarmClock size={64} color={colors.primary} />}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAction}
        activeOpacity={0.8}
      >
        <Plus size={20} color={colors.text} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default React.memo(EmptyState);