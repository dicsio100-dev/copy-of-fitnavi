
export enum Goal {
  FORCE = 'Force',
  HYPERTROPHIE = 'Hypertrophie',
  ENDURANCE = 'Endurance',
  PERTE_DE_POIDS = 'Perte de poids'
}

export enum Gender {
  MALE = 'Homme',
  FEMALE = 'Femme',
  OTHER = 'Autre / Préférer ne pas dire'
}

export enum Frequency {
  LOW = '1–2 fois par semaine',
  MEDIUM = '3–4 fois par semaine',
  HIGH = '5+ fois par semaine'
}

export interface Exercise {
  id: string;
  name: string;
  image: string;
  defaultWeight: number;
  defaultReps: number;
  sets: number;
  restTime: string;
  focus: string;

}

export interface DailyStats {
  id?: string;
  user_id?: string;
  date: string;
  sleep_hours: number;
  hydration_liters: number;
  mood: 'Excellent' | 'Bien' | 'Normal' | 'Fatigué' | 'Stressé';
  protein_met?: boolean;
  no_sugar?: boolean;
}

export interface Workout {
  title: string;
  exercises: Exercise[];
  totalDuration: string;
  intensity: string;
}

export interface HabitEntry {
  hydration: boolean;
  sleep: boolean;
  protein: boolean;
  noSugar: boolean;
}

export interface User {
  email: string;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  goal?: Goal;
  gender?: Gender;
  age?: number;
  weight?: number;
  height?: number;
  frequency?: Frequency;
  preferredDays?: string[];
  firstName?: string;
  username?: string;
  plan?: string;
  is_premium?: boolean; // New field
  subscription_type?: string; // New field
  // New tracking data
  habits?: Record<string, HabitEntry>; // Key: YYYY-MM-DD
  personalRecords?: Record<string, number>; // Key: Lift name

  // Profile & Gamification
  equipment?: string[]; // 'haltères', 'barre', 'machine', 'poids_corps'
  avatar_url?: string;
  level?: number;
  xp?: number;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string; // Added to support visual analysis preview
}
