import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, Goal } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OnboardingFlow from './screens/OnboardingFlow';
import DashboardScreen from './screens/DashboardScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import StatsScreen from './screens/StatsScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import AITrainerScreen from './screens/AITrainerScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import HealthCalendarScreen from './screens/HealthCalendarScreen';
import PremiumSalesPage from './screens/PremiumSalesPage';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { supabase } from './src/lib/supabase';

const AppContent: React.FC = () => {
  const { session, loading, user: authUser } = useAuth();
  const [appUser, setAppUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authUser) {
        console.log("Utilisateur connecté, récupération du profil...");
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle(); // Changed from .single() to prevent 406 errors if multiple rows exist (unlikely but possible) or 0 rows

        if (data) {
          setAppUser({
            email: authUser.email!,
            isAuthenticated: true,
            isOnboardingComplete: data.onboarding_completed || false,
            username: data.username || data.full_name || authUser.email!.split('@')[0],
            firstName: data.display_name || data.full_name?.split(' ')[0] || "Athlète",
            goal: data.goal || Goal.FORCE,
            habits: data.habits || {},
            personalRecords: data.personal_records || {},
            weight: data.weight || 70,
            height: data.height || 175,
            age: data.age || 25,
            is_premium: data.is_premium || false,
            subscription_type: data.subscription_type || 'free',
            // Enhanced Fields
            equipment: data.equipment || ['poids_corps'],
            avatar_url: data.avatar_url || null,
            level: data.level || 1, // Default Level 1
            xp: data.xp || 0
          });
        } else {
          // Fallback / New User Init
          const newUser: User = {
            email: authUser.email!,
            isAuthenticated: true,
            isOnboardingComplete: false,
            username: authUser.email!.split('@')[0],
            firstName: "Athlète",
            level: 1, // Default reset
            equipment: ['poids_corps']
          };
          setAppUser(newUser);
        }
      } else {
        setAppUser(null);
      }
    };

    fetchProfile();
  }, [authUser]);

  // Handle centralized profile updates
  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!appUser || !authUser) return;

    // 1. Optimistic Update
    const updatedUser = { ...appUser, ...updates };
    setAppUser(updatedUser);

    // 2. Persist to Supabase
    try {
      // Map User fields to DB columns if necessary (snake_case)
      const dbUpdates: any = {};
      if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
      if (updates.height !== undefined) dbUpdates.height = updates.height;
      if (updates.age !== undefined) dbUpdates.age = updates.age;
      if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
      if (updates.equipment !== undefined) dbUpdates.equipment = updates.equipment;
      if (updates.avatar_url !== undefined) dbUpdates.avatar_url = updates.avatar_url;
      if (updates.level !== undefined) dbUpdates.level = updates.level;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', authUser.id);

      if (error) throw error;
      console.log("Profile updated successfully in Supabase");
    } catch (err) {
      console.error("Error syncing profile:", err);
      // Revert? For now, we assume success or user will retry.
    }
  };

  if (loading) {
    return <div className="h-screen w-full bg-[#102216] flex items-center justify-center text-white">Chargement session...</div>;
  }

  // Si on est connecté mais que le profil n'est pas encore chargé
  if (session && !appUser) {
    return <div className="h-screen w-full bg-[#102216] flex items-center justify-center text-white">Préparation de votre profil...</div>;
  }

  return (
    <div className="min-h-[100dvh] w-full bg-background-dark font-sans selection:bg-primary/30 selection:text-white">
      <Routes>
        {/* Public Routes */}
        <Route path="/welcome" element={!session ? <WelcomeScreen /> : <Navigate to="/" />} />
        <Route path="/login" element={!session ? <LoginScreen onLogin={() => { }} /> : <Navigate to="/" />} />
        <Route path="/signup" element={!session ? <SignupScreen onSignup={() => { }} /> : <Navigate to="/" />} />

        {/* Protected Routes Logic */}
        {session && appUser ? (
          <>
            <Route path="/onboarding" element={appUser.isOnboardingComplete ? <Navigate to="/" /> : <OnboardingFlow />} />

            {/* Si onboarding fini, accès au reste avec Layout, sinon redirection forcée */}
            <Route path="/" element={
              appUser.isOnboardingComplete ? (
                <Layout user={appUser}>
                  <DashboardScreen user={appUser} />
                </Layout>
              ) : <Navigate to="/onboarding" />
            } />
            <Route path="/workout" element={
              appUser.isOnboardingComplete ? (
                <Layout user={appUser}>
                  <WorkoutScreen user={appUser} onUpdateProfile={handleUpdateProfile} />
                </Layout>
              ) : <Navigate to="/onboarding" />
            } />
            <Route path="/stats" element={
              appUser.isOnboardingComplete ? (
                <Layout user={appUser}>
                  <StatsScreen user={appUser} />
                </Layout>
              ) : <Navigate to="/onboarding" />
            } />
            <Route path="/community" element={
              appUser.isOnboardingComplete ? (
                <Layout user={appUser}>
                  <CommunityScreen user={appUser} />
                </Layout>
              ) : <Navigate to="/onboarding" />
            } />
            <Route
              path="/profile"
              element={
                appUser.isOnboardingComplete ? (
                  <Layout user={appUser}>
                    <ProfileScreen
                      user={appUser}
                      onLogout={() => supabase.auth.signOut()}
                      onUpdateProfile={handleUpdateProfile}
                    />
                  </Layout>
                ) : <Navigate to="/onboarding" />
              }
            />
            <Route path="/ai-trainer" element={
              appUser.isOnboardingComplete ? (
                <Layout user={appUser}>
                  <AITrainerScreen user={appUser} />
                </Layout>
              ) : <Navigate to="/onboarding" />
            } />
            <Route path="/achievements" element={
              appUser.isOnboardingComplete ? (
                <Layout user={appUser}>
                  <AchievementsScreen user={appUser} />
                </Layout>
              ) : <Navigate to="/onboarding" />
            } />
            <Route path="/calendar" element={
              appUser.isOnboardingComplete ? (
                <Layout user={appUser}>
                  <HealthCalendarScreen user={appUser} onUpdateHabits={() => { }} />
                </Layout>
              ) : <Navigate to="/onboarding" />
            } />
            <Route path="/premium" element={
              appUser.isOnboardingComplete ? (
                <Layout user={appUser}>
                  <PremiumSalesPage />
                </Layout>
              ) : <Navigate to="/onboarding" />
            } />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/welcome" />} />
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;