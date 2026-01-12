import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAlarmStore } from '@/store/alarm-store';
import { colors } from '@/constants/colors';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react-native';

export default function QuotesScreen() {
  const quotes = useAlarmStore(state => state.quotes);
  const addQuote = useAlarmStore(state => state.addQuote);
  const updateQuote = useAlarmStore(state => state.updateQuote);
  const deleteQuote = useAlarmStore(state => state.deleteQuote);
  
  const [newQuote, setNewQuote] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  
  const handleAddQuote = () => {
    if (newQuote.trim()) {
      addQuote(newQuote.trim());
      setNewQuote('');
    }
  };
  
  const handleEditQuote = (index: number) => {
    setEditIndex(index);
    setEditText(quotes[index]);
  };
  
  const handleSaveEdit = () => {
    if (editIndex !== null && editText.trim()) {
      updateQuote(editIndex, editText.trim());
      setEditIndex(null);
      setEditText('');
    }
  };
  
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditText('');
  };
  
  const handleDeleteQuote = (index: number) => {
    Alert.alert(
      'Delete Quote',
      'Are you sure you want to delete this quote?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteQuote(index)
        }
      ]
    );
  };
  
  const renderQuoteItem = ({ item, index }: { item: string; index: number }) => {
    if (editIndex === index) {
      return (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            multiline
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={[styles.editButton, styles.saveButton]} 
              onPress={handleSaveEdit}
            >
              <Save size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]} 
              onPress={handleCancelEdit}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.quoteItem}>
        <Text style={styles.quoteText}>{item}</Text>
        <View style={styles.quoteActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEditQuote(index)}
          >
            <Edit2 size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleDeleteQuote(index)}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Text style={styles.description}>
        Add your own motivational quotes to see when you wake up. These quotes will be randomly shown after completing your alarm challenges.
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newQuote}
          onChangeText={setNewQuote}
          placeholder="Enter a new motivational quote..."
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <TouchableOpacity 
          style={[styles.addButton, !newQuote.trim() && styles.addButtonDisabled]} 
          onPress={handleAddQuote}
          disabled={!newQuote.trim()}
        >
          <Plus size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={quotes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Your Quotes ({quotes.length})</Text>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    marginRight: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.buttonBorder,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonDisabled: {
    backgroundColor: colors.inactive,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  quoteItem: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  quoteText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  editContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  editInput: {
    backgroundColor: colors.buttonInactive,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.buttonBorder,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
});