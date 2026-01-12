export type RepeatDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionCategory = 'math' | 'general' | 'puzzle';

export interface Alarm {
  id: string;
  time: string; // Format: "HH:MM"
  label: string;
  isActive: boolean;
  repeatDays: RepeatDay[];
  questionCount: number;
  questionDifficulty: QuestionDifficulty;
  questionCategories: QuestionCategory[];
  sound: string;
  vibrate: boolean;
}

export interface AlarmHistory {
  id: string;
  alarmId: string;
  date: string; // ISO date string
  wakeUpTime: string; // ISO date string
  questionsAnswered: number;
  questionsCorrect: number;
  snoozeCount: number;
  dismissed: boolean;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  question: string;
  options?: string[];
  answer: string | number;
}