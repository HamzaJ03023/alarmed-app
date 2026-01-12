import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Question } from '@/types/alarm';
import { colors } from '@/constants/colors';

interface QuestionCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
  timeLimit?: number;
}

function QuestionCard({ 
  question, 
  onAnswer,
  questionNumber,
  totalQuestions,
  timeLimit = 90
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const handleSubmit = useCallback(() => {
    if (hasSubmitted) return;
    
    let correct = false;
    
    if (typeof question.answer === 'number') {
      correct = parseInt(answer, 10) === question.answer;
    } else {
      correct = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    }
    
    setIsCorrect(correct);
    setHasSubmitted(true);
  }, [hasSubmitted, answer, question.answer]);
  
  const handleOptionSelect = useCallback((option: string) => {
    if (hasSubmitted) return;
    
    setAnswer(option);
    const correct = option.toLowerCase() === question.answer.toString().toLowerCase();
    
    setIsCorrect(correct);
    setHasSubmitted(true);
  }, [hasSubmitted, question.answer]);
  
  const handleContinue = useCallback(() => {
    onAnswer(isCorrect);
    setAnswer('');
    setHasSubmitted(false);
    setIsCorrect(false);
  }, [onAnswer, isCorrect]);
  
  useEffect(() => {
    setAnswer('');
    setHasSubmitted(false);
    setIsCorrect(false);
    setTimeLeft(timeLimit);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [question.id, timeLimit]);
  
  useEffect(() => {
    if (timeLeft === 0 && !hasSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, hasSubmitted, handleSubmit]);
  
  useEffect(() => {
    if (hasSubmitted && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [hasSubmitted]);
  
  const timerColor = timeLeft <= 10 ? colors.error : timeLeft <= 30 ? '#FFA500' : colors.primary;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Question {questionNumber} of {totalQuestions}
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.timerContainer}>
        <View style={[styles.timerBadge, { backgroundColor: timerColor }]}>
          <Text style={styles.timerText}>{timeLeft}s</Text>
        </View>
      </View>
      
      <Text style={styles.question}>{question.question}</Text>
      
      {question.options ? (
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                hasSubmitted && option === answer && (isCorrect ? styles.correctOption : styles.incorrectOption)
              ]}
              onPress={() => handleOptionSelect(option)}
              disabled={hasSubmitted}
            >
              <Text style={[
                styles.optionText,
                hasSubmitted && option === answer && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              hasSubmitted && (isCorrect ? styles.correctInput : styles.incorrectInput)
            ]}
            value={answer}
            onChangeText={setAnswer}
            placeholder="Enter your answer..."
            placeholderTextColor={colors.textSecondary}
            keyboardType={typeof question.answer === 'number' ? 'numeric' : 'default'}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!hasSubmitted}
          />
          
          {!hasSubmitted && (
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={!answer.trim()}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {hasSubmitted && (
        <View>
          <View style={[
            styles.resultContainer,
            isCorrect ? styles.correctResult : styles.incorrectResult
          ]}>
            <Text style={styles.resultText}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
            </Text>
            {!isCorrect && (
              <Text style={styles.correctAnswerText}>
                The correct answer is: {question.answer.toString()}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.7}
          >
            <Text style={styles.continueButtonText}>
              {isCorrect ? 'Continue' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.buttonInactive,
    borderRadius: 12,
    padding: Platform.OS === 'ios' ? 16 : 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.buttonBorder,
  },
  correctInput: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}20`,
  },
  incorrectInput: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}20`,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: colors.buttonInactive,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.buttonBorder,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: `${colors.success}20`,
  },
  incorrectOption: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}20`,
  },
  resultContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  correctResult: {
    backgroundColor: `${colors.success}20`,
  },
  incorrectResult: {
    backgroundColor: `${colors.error}20`,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 14,
    color: colors.text,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default React.memo(QuestionCard);