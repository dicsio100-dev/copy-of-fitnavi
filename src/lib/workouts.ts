import { Goal, Workout } from '../../types';

export const WORKOUT_CONTENT: Record<string, Workout> = {
    [Goal.FORCE]: {
        title: "Force Absolue : Compounds",
        intensity: "Élevée",
        totalDuration: "65 Min",
        exercises: [
            { id: '1', name: 'Back Squat (Barre)', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', defaultWeight: 80, defaultReps: 5, sets: 5, restTime: '03:00', focus: 'Gardez le torse fier et descendez sous la parallèle.' },
            { id: '2', name: 'Développé Couché', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', defaultWeight: 60, defaultReps: 5, sets: 5, restTime: '03:00', focus: 'Rétraction scapulaire maximale.' },
            { id: '3', name: 'Soulevé de Terre', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', defaultWeight: 100, defaultReps: 5, sets: 3, restTime: '04:00', focus: 'Engagement total de la chaîne postérieure.' }
        ]
    },
    [Goal.HYPERTROPHIE]: {
        title: "Split Hypertrophie : Volume",
        intensity: "Modérée",
        totalDuration: "55 Min",
        exercises: [
            { id: '1', name: 'Goblet Squat', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', defaultWeight: 24, defaultReps: 12, sets: 4, restTime: '01:30', focus: 'Temps sous tension : 3s à la descente.' },
            { id: '2', name: 'Pompes Lestées', image: 'https://images.unsplash.com/photo-1598971639058-aba3c3943343?w=800', defaultWeight: 10, defaultReps: 12, sets: 4, restTime: '01:30', focus: 'Extension complète des bras.' },
            { id: '3', name: 'Curl Haltères', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800', defaultWeight: 12, defaultReps: 15, sets: 3, restTime: '01:00', focus: 'Pas de balancement du corps.' }
        ]
    },
    [Goal.ENDURANCE]: {
        title: "Métabolique : HIIT & Cardio",
        intensity: "Soutenue",
        totalDuration: "45 Min",
        exercises: [
            { id: '1', name: 'Air Squats', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800', defaultWeight: 0, defaultReps: 25, sets: 4, restTime: '00:45', focus: 'Vitesse d\'exécution constante.' },
            { id: '2', name: 'Burpees', image: 'https://images.unsplash.com/photo-1541534741688-6078c64b5cc5?w=800', defaultWeight: 0, defaultReps: 15, sets: 4, restTime: '01:00', focus: 'Explosivité sur le saut.' },
            { id: '3', name: 'Mountain Climbers', image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800', defaultWeight: 0, defaultReps: 40, sets: 4, restTime: '00:30', focus: 'Gainage abdominal serré.' }
        ]
    },
    [Goal.PERTE_DE_POIDS]: {
        title: "Brûle-Graisses : Full Body",
        intensity: "Élevée",
        totalDuration: "50 Min",
        exercises: [
            { id: '1', name: 'Kettlebell Swings', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', defaultWeight: 16, defaultReps: 20, sets: 4, restTime: '01:00', focus: 'Hanche explosive, dos plat.' },
            { id: '2', name: 'Planche Dynamique', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', defaultWeight: 0, defaultReps: 60, sets: 3, restTime: '00:45', focus: 'Respiration ventrale contrôlée.' },
            { id: '3', name: 'Thrusters Haltères', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', defaultWeight: 8, defaultReps: 12, sets: 4, restTime: '01:00', focus: 'Mouvement fluide squat-presse.' }
        ]
    }
};
