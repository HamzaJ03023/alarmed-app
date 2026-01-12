// Format time from 24h to 12h format
export const formatTime12h = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
};

// Format time from Date object to HH:MM string
export const formatTimeFromDate = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Get day name from day index (0 = Sunday, 1 = Monday, etc.)
export const getDayName = (dayIndex: number, short = false): string => {
  const days = [
    { short: 'Sun', long: 'Sunday' },
    { short: 'Mon', long: 'Monday' },
    { short: 'Tue', long: 'Tuesday' },
    { short: 'Wed', long: 'Wednesday' },
    { short: 'Thu', long: 'Thursday' },
    { short: 'Fri', long: 'Friday' },
    { short: 'Sat', long: 'Saturday' },
  ];
  
  return short ? days[dayIndex].short : days[dayIndex].long;
};

// Get day index from RepeatDay
export const getDayIndex = (day: string): number => {
  const dayMap: Record<string, number> = {
    'sun': 0,
    'mon': 1,
    'tue': 2,
    'wed': 3,
    'thu': 4,
    'fri': 5,
    'sat': 6,
  };
  
  return dayMap[day] || 0;
};

// Format repeat days for display
export const formatRepeatDays = (repeatDays: string[]): string => {
  if (repeatDays.length === 0) {
    return 'Once';
  }
  
  if (repeatDays.length === 7) {
    return 'Every day';
  }
  
  if (repeatDays.length === 5 && 
      repeatDays.includes('mon') && 
      repeatDays.includes('tue') && 
      repeatDays.includes('wed') && 
      repeatDays.includes('thu') && 
      repeatDays.includes('fri')) {
    return 'Weekdays';
  }
  
  if (repeatDays.length === 2 && 
      repeatDays.includes('sat') && 
      repeatDays.includes('sun')) {
    return 'Weekends';
  }
  
  return repeatDays
    .map(day => day.charAt(0).toUpperCase() + day.slice(1, 3))
    .join(', ');
};

// Check if an alarm should ring today
export const shouldRingToday = (repeatDays: string[]): boolean => {
  if (repeatDays.length === 0) {
    return true; // One-time alarm
  }
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  
  return repeatDays.includes(dayNames[dayOfWeek]);
};

// Get next alarm time
export const getNextAlarmTime = (time: string, repeatDays: string[]): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const alarmTime = new Date();
  
  alarmTime.setHours(hours, minutes, 0, 0);
  
  // If no repeat days, it's a one-time alarm
  if (repeatDays.length === 0) {
    // If the time has already passed today, set it for tomorrow
    if (alarmTime < now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    return alarmTime;
  }
  
  // Convert repeat days to day indices (0-6)
  const repeatDayIndices = repeatDays.map(day => getDayIndex(day));
  
  // If today's alarm hasn't passed yet, check if it should ring today
  if (alarmTime > now && repeatDayIndices.includes(now.getDay())) {
    return alarmTime;
  }
  
  // Find the next day the alarm should ring
  let daysToAdd = 1;
  let nextDay = (now.getDay() + daysToAdd) % 7;
  
  while (!repeatDayIndices.includes(nextDay)) {
    daysToAdd++;
    nextDay = (now.getDay() + daysToAdd) % 7;
  }
  
  alarmTime.setDate(now.getDate() + daysToAdd);
  return alarmTime;
};

// Format relative time (e.g., "in 8 hours", "tomorrow at 7:00 AM")
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffHours < 1) {
    return `in ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  if (diffHours < 24) {
    return `in ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
  }
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  if (date < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
    return `tomorrow at ${formatTime12h(formatTimeFromDate(date))}`;
  }
  
  // Format for days further in the future
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    hour: 'numeric', 
    minute: 'numeric' 
  };
  return date.toLocaleString('en-US', options);
};