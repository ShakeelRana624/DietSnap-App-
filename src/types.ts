export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goalType: 'lose' | 'maintain' | 'gain';
  goal: number;
  streak: number;
  lastGoalUpdate?: string;
  createdAt: string;
  notificationsEnabled?: boolean;
  reminderFrequency?: 'low' | 'medium' | 'high' | 'custom';
  reminderTimes?: {
    breakfast?: string; // HH:mm
    lunch?: string;
    dinner?: string;
  };
}

export interface MealLog {
  id?: string;
  uid: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: 'Small' | 'Medium' | 'Large' | 'Custom';
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | 'Manual';
  timestamp: string;
  imageUrl?: string;
}

export interface WeightLog {
  uid: string;
  weight: number;
  timestamp: string;
}

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';
