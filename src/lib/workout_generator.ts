export interface UserProfile {
    weight: number; // in kg
    height?: number; // in cm, for BMI
    age: number;
    level: 'Débutant' | 'Intermédiaire' | 'Avancé';
    goal: 'Force' | 'Muscle' | 'Perte_Gras';
    gender: 'Homme' | 'Femme';
    sleepQuality?: 'Bon' | 'Moyen' | 'Mauvais'; // New for daily adjustment
    equipment?: string[]; // ['haltères', 'barre', 'machine']
    personalRecords?: Record<string, number>; // History
}

export interface Exercise {
    id: string;
    name: string;
    target: string; // Display target
    type: 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cardio';
    impact: 'low' | 'high';
    focus_area: 'upper_body' | 'lower_body' | 'full_body' | 'core' | 'glutes';
    ratio: number; // For 1RM calculation
    technical_tip?: string; // Voice Coach Tip
}

export interface WorkoutSet {
    exercise: Exercise;
    weight: number;
    reps: string;
    rest: string; // seconds
}

// 4. BASE DE DONNÉES DE RÉFÉRENCE (ENRICHIE)
// Tags: type, impact, focus_area added for filtering
export const TOP_20_EXERCISES: Exercise[] = [
    // Compounds (Barbell/Heavy)
    { id: 'squat', name: 'Squat', target: 'Legs', type: 'barbell', impact: 'high', focus_area: 'lower_body', ratio: 1.2, technical_tip: "Pousse les fesses en arrière, garde le dos droit et pousse fort sur les talons." },
    { id: 'deadlift', name: 'Soulevé de Terre', target: 'Back', type: 'barbell', impact: 'low', focus_area: 'full_body', ratio: 1.4, technical_tip: "Barre collée aux tibias, chest up, pousse le sol avec les jambes." },
    { id: 'bench_press', name: 'Développé Couché', target: 'Chest', type: 'barbell', impact: 'low', focus_area: 'upper_body', ratio: 1.0, technical_tip: "Omoplates serrées, pieds ancrés au sol, descends la barre contrôlée." },
    { id: 'military_press', name: 'Développé Militaire', target: 'Shoulders', type: 'barbell', impact: 'low', focus_area: 'upper_body', ratio: 0.6, technical_tip: "Contracte les abdos et les fessiers pour ne pas cambrer le dos." },
    { id: 'barbell_row', name: 'Rowing Barre', target: 'Back', type: 'barbell', impact: 'low', focus_area: 'upper_body', ratio: 0.8, technical_tip: "Dos parallèle au sol, tire avec les coudes vers l'arrière." },

    // Machine / Isolation / Dumbbell
    { id: 'leg_press', name: 'Leg Press', target: 'Legs', type: 'machine', impact: 'low', focus_area: 'lower_body', ratio: 2.0, technical_tip: "Ne verrouille pas les genoux en haut du mouvement." },
    { id: 'lat_pulldown', name: 'Tirage Vertical', target: 'Back', type: 'machine', impact: 'low', focus_area: 'upper_body', ratio: 0.7, technical_tip: "Tire la barre vers le haut des pectoraux, coudes vers le bas." },
    { id: 'dumbbell_curl', name: 'Curling Haltères', target: 'Biceps', type: 'dumbbell', impact: 'low', focus_area: 'upper_body', ratio: 0.3, technical_tip: "Garde les coudes fixes contre les côtes, rotation du poignet." },
    { id: 'tricep_extension', name: 'Extension Triceps', target: 'Triceps', type: 'dumbbell', impact: 'low', focus_area: 'upper_body', ratio: 0.35, technical_tip: "Bras verticaux, seule l'avant-bras bouge." },
    { id: 'reverse_fly', name: 'Oiseau', target: 'Shoulders', type: 'dumbbell', impact: 'low', focus_area: 'upper_body', ratio: 0.15, technical_tip: "Buste penché, ouvre les bras comme des ailes, focus arrière d'épaule." },

    // Glute / Leg Focus (Women / Aesthetic)
    { id: 'hip_thrust', name: 'Hip Thrust', target: 'Glutes', type: 'barbell', impact: 'low', focus_area: 'glutes', ratio: 1.5, technical_tip: "Menton rentré, pousse le bassin vers le plafond, contracte fort les fessiers." },
    { id: 'bulgarian_split_squat', name: 'Fentes Bulgares', target: 'Legs', type: 'dumbbell', impact: 'low', focus_area: 'lower_body', ratio: 0.5, technical_tip: "Descends jusqu'à ce que le genou arrière frôle le sol." },
    { id: 'goblet_squat', name: 'Gobelet Squat', target: 'Legs', type: 'dumbbell', impact: 'low', focus_area: 'lower_body', ratio: 0.6, technical_tip: "Haltère contre la poitrine, descends en gardant le buste droit." },
    { id: 'step_ups', name: 'Step-ups', target: 'Legs', type: 'bodyweight', impact: 'low', focus_area: 'lower_body', ratio: 0.4, technical_tip: "Pousse uniquement avec la jambe sur le banc, contrôle la descente." },

    // Bodyweight / Calisthenics
    { id: 'pullup', name: 'Tractions', target: 'Back', type: 'bodyweight', impact: 'low', focus_area: 'upper_body', ratio: 0.15, technical_tip: "Initie le mouvement par les omoplates, menton au-dessus de la barre." }, // +weighted
    { id: 'dips', name: 'Dips', target: 'Triceps', type: 'bodyweight', impact: 'low', focus_area: 'upper_body', ratio: 0.2, technical_tip: "Penche-toi légèrement en avant, descends à 90 degrés." },
    { id: 'pushups', name: 'Pompes', target: 'Chest', type: 'bodyweight', impact: 'low', focus_area: 'upper_body', ratio: 0.0, technical_tip: "Corps gainé, coudes rentrés à 45 degrés." },
    { id: 'plank', name: 'Planche', target: 'Core', type: 'bodyweight', impact: 'low', focus_area: 'core', ratio: 0.0, technical_tip: "Aspire le nombril, contracte les fessiers et les cuisses." },

    // Cardio / High Impact
    { id: 'burpees', name: 'Burpees', target: 'Full Body', type: 'cardio', impact: 'high', focus_area: 'full_body', ratio: 0.0, technical_tip: "Rythme constant, atterris souple." },
    { id: 'mountain_climbers', name: 'Mountain Climbers', target: 'Core', type: 'cardio', impact: 'high', focus_area: 'core', ratio: 0.0, technical_tip: "Genoux vers la poitrine, garde le bassin bas." },
];

export const getExperienceMultiplier = (level: UserProfile['level']) => {
    switch (level) {
        case 'Débutant': return 0.5;
        case 'Intermédiaire': return 0.8;
        case 'Avancé': return 1.2;
        default: return 0.5;
    }
};

/**
 * generates a dedicated low-impact recovery session
 */
export const generateRecoverySession = (): WorkoutSet[] => {
    // Fixed simple mobility flow
    const flow: Exercise[] = [
        { id: 'cat_cow', name: 'Chat-Vache', target: 'Spine', type: 'bodyweight', impact: 'low', focus_area: 'core', ratio: 0, technical_tip: "Inspire en creusant le dos, expire en arrondissant." },
        { id: 'world_greatest_stretch', name: 'World Greatest Stretch', target: 'Full Body', type: 'bodyweight', impact: 'low', focus_area: 'full_body', ratio: 0, technical_tip: "Oouvre grand la cage thoracique." },
        { id: 'child_pose', name: 'Pose de l\'Enfant', target: 'Back', type: 'bodyweight', impact: 'low', focus_area: 'full_body', ratio: 0, technical_tip: "Relâche les tensions dans le bas du dos." },
        { id: 'glute_bridge_iso', name: 'Pont Fessier Iso', target: 'Glutes', type: 'bodyweight', impact: 'low', focus_area: 'glutes', ratio: 0, technical_tip: "Maintiens la contraction en haut." },
        { id: 'plank', name: 'Planche', target: 'Core', type: 'bodyweight', impact: 'low', focus_area: 'core', ratio: 0, technical_tip: "Gainage statique doux." }
    ];

    return flow.map(ex => ({
        exercise: ex,
        weight: 0,
        reps: "45-60s",
        rest: "30"
    }));
};

export const generateWorkoutSession = (user: UserProfile): WorkoutSet[] => {
    let pool = [...TOP_20_EXERCISES];

    // --- 1. BIOMETRIC SAFETY FILTER (AGE & BMI) ---
    // Rule: Age > 50 OR BMI > 30 => NO High Impact (Sauts / Cardio intense)
    const bmi = (user.height && user.weight) ? user.weight / ((user.height / 100) ** 2) : 22;
    if (user.age > 50 || bmi > 30) {
        pool = pool.filter(ex => ex.impact === 'low');
    }

    // --- 2. EQUIPMENT FILTER ---
    const userEquipment = user.equipment || ['poids_corps'];
    pool = pool.filter(ex => {
        if (ex.type === 'bodyweight' || ex.type === 'cardio') return true;
        if (ex.type === 'barbell' && userEquipment.includes('barre')) return true;
        if (ex.type === 'dumbbell' && userEquipment.includes('haltères')) return true;
        if (ex.type === 'machine' && userEquipment.includes('machine')) return true;
        return false;
    });


    // --- 3. GOAL DECISION MATRIX ---
    let selectedExercises: Exercise[] = [];
    let targetReps = "8-12";
    let targetRest = "90";
    let intensity = 0.70;

    if (user.goal === 'Force') {
        // --- MATRIX: FORCE ---
        // Profile: Low Reps, Heavy, Long Rest. Polyarticular Priority.
        targetReps = "3-6";
        targetRest = "180";
        intensity = 0.85;

        // Priority 1: Barbell Compounds
        const compounds = pool.filter(ex => ex.type === 'barbell' && ['Squat', 'Soulevé de Terre', 'Développé Couché', 'Développé Militaire', 'Rowing Barre'].includes(ex.name));

        // Priority 2: Heavy Machines/Dumbbells if Barbells missing
        const heavyAccessory = pool.filter(ex => !compounds.includes(ex) && ex.ratio > 0.5);

        // Selection: 4-5 Exercises max
        selectedExercises = [...compounds, ...heavyAccessory].slice(0, 5);

    } else if (user.goal === 'Perte_Gras') {
        // --- MATRIX: WEIGHT LOSS ---
        // Profile: Circuit, High Reps, Short Rest. Mix Cardio/Strength.
        targetReps = "15-20";
        targetRest = "45";
        intensity = 0.55; // Lighter for endurance

        // Priority: Cardio + Bodyweight + Dumbbell (Flow)
        // Ensure at least 2 Cardio/High Energy if available
        const cardio = pool.filter(ex => ex.type === 'cardio');
        const activePool = pool.filter(ex => ex.type !== 'cardio');

        // Shuffle active pool for variety
        const shuffled = activePool.sort(() => 0.5 - Math.random());

        // Interleave if possible (Superset Logic simplified to Circuit list)
        selectedExercises = [...shuffled.slice(0, 6), ...cardio].slice(0, 8);

        // --- INTELLIGENCE INJECTION: EXTRA CARDIO ---
        // Force 2 Cardio Finishers if not already present enough
        const finishers = pool.filter(ex => ['Burpees', 'Mountain Climbers'].includes(ex.name));
        finishers.forEach(f => {
            if (!selectedExercises.includes(f)) selectedExercises.push(f);
        });

    } else {
        // --- MATRIX: MUSCLE / DEFAULT ---
        targetReps = "8-12";
        targetRest = "90";
        intensity = 0.75;

        // Gender bias applied here primarily
        let rankedPool = [...pool];
        if (user.gender === 'Femme') {
            rankedPool.sort((a, b) => (b.focus_area === 'glutes' || b.focus_area === 'lower_body' ? 1 : 0) - (a.focus_area === 'glutes' || a.focus_area === 'lower_body' ? 1 : 0));
        } else {
            rankedPool.sort((a, b) => (b.focus_area === 'upper_body' ? 1 : 0) - (a.focus_area === 'upper_body' ? 1 : 0));
        }
        selectedExercises = rankedPool.slice(0, 7);
    }


    // --- 4. LOAD CALCULATION & OVERLOAD ---
    const experienceMult = getExperienceMultiplier(user.level);
    const recoveryFactor = user.sleepQuality === 'Mauvais' ? 0.85 : 1.0;

    return selectedExercises.map(exercise => {
        let weight = 0;

        // A. Check History (Progressive Overload)
        // If we have a record, strictly use it? 
        // Logic: If record exists, that's the "Last good weight". 
        // We do typically want to use that directly for same rep range.
        // If the goal changed (High Reps), the record (Max) might be too heavy.
        // Assuming 'personalRecords' stores the WEIGHT used, not 1RM.
        // So we only use it if it matches context. For now, let's use it as a reference 1RM estimation base if available?
        // Simpler approach for V1: If record exists, use that.

        const historyWeight = user.personalRecords ? user.personalRecords[exercise.id] : undefined;

        if (historyWeight !== undefined) {
            // USE HISTORY directly (Assumes stored weight is appropriate for current goal context? Danger if switching goals)
            // Safety: Apply intensity modifier only if switching goals?
            // Let's assume history is "Last Working Weight".
            // If User switches from Force (100kg) to Fat Loss (Need 50kg), using 100kg is dangerous.
            // Better: Use Record as estimated 1RM.
            // Record / previous_intensity ~= 1RM ? Too complex to guess previous intensity.

            // Fallback: If history exists, use it as BASE, but cap it if intensity is low.
            // Actually, for this iteration, let's stick to the algo calculation but use History as a floor if it's close?
            // "Le système doit retenir les performances... si validée, +2.5%".
            // This implies the specific weight for THIS exercise.
            // Let's use the HISTORY weight as the target, simply.
            weight = historyWeight;

            // Safety override for high rep goals if history was heavy
            if (user.goal === 'Perte_Gras' && historyWeight > (user.weight * exercise.ratio * 0.6)) {
                // Likely a heavy record, reduce it
                weight = historyWeight * 0.6;
            }
        } else {
            // NO HISTORY: Calculate from Algo
            const base1RM = user.weight * exercise.ratio;
            weight = base1RM * experienceMult * intensity;
        }

        // Apply Recovery Factor to whatever we decided
        weight = weight * recoveryFactor;

        // Clean up
        if (exercise.type === 'bodyweight' || exercise.type === 'cardio') {
            if (exercise.ratio === 0) weight = 0;
        }

        weight = Math.round(weight / 1.25) * 1.25; // Granular plates

        return {
            exercise,
            weight,
            reps: targetReps,
            rest: targetRest
        };
    });
};
