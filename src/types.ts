export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  weight: number;
  height: number;
  goal: number;
  lastGoalUpdate?: string;
  createdAt: string;
}

export interface MealLog {
  id?: string;
  uid: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: 'Small' | 'Medium' | 'Large';
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  timestamp: string;
  imageUrl?: string;
}

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';
