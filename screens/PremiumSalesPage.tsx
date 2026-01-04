
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../src/lib/supabase';

const PremiumSalesPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    };

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Simulation d'un paiement réussi + Mise à jour DB via fonction sécurisée
                const { error } = await supabase.rpc('upgrade_user_to_premium');

                if (error) throw error;

                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                // Si pas connecté, rediriger vers login
                navigate('/login');
            }
        } catch (error) {
            console.error("Erreur abonnement:", error);
            alert("Erreur Supabase: " + (error.message || JSON.stringify(error)));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#102216] relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#13EC5B]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#13EC5B]/5 rounded-full blur-[100px]" />

            <motion.div
                className="max-w-6xl w-full z-10 flex flex-col md:flex-row gap-8 items-center justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >

                {/* Free Tier Card */}
                <motion.div
                    variants={itemVariants}
                    className="w-full md:w-[350px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6 relative group hover:border-white/20 transition-all"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none" />

                    <div>
                        <h3 className="text-2xl font-black text-gray-400">Standard</h3>
                        <p className="text-4xl font-black text-white mt-2">0€ <span className="text-lg font-medium text-gray-500">/mois</span></p>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 text-gray-300">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400">check_circle</span>
                            <span>Suivi manuel des séances</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-400">check_circle</span>
                            <span>Coach Navi (3 msgs/jour)</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                            <span className="material-symbols-outlined">cancel</span>
                            <span>Analyse Vision IA</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-50">
                            <span className="material-symbols-outlined">cancel</span>
                            <span>Plans personnalisés</span>
                        </div>
                    </div>

                    <button
                        disabled
                        className="w-full bg-white/10 text-gray-400 font-bold py-4 rounded-xl cursor-default"
                    >
                        Plan Actuel
                    </button>
                </motion.div>

                {/* PREMIUM Tier Card (Hero) */}
                <motion.div
                    variants={itemVariants}
                    className="w-full md:w-[420px] bg-[#13EC5B]/10 backdrop-blur-2xl border border-[#13EC5B]/30 rounded-[2.5rem] p-10 flex flex-col gap-8 relative shadow-[0_0_50px_rgba(19,236,91,0.2)] transform md:-translate-y-8"
                >
                    {/* Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#13EC5B] text-[#102216] px-6 py-1.5 rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-[#13EC5B]/40">
                        Recommandé
                    </div>

                    <div>
                        <h3 className="text-3xl font-black text-[#13EC5B]">Premium</h3>
                        <p className="text-5xl font-black text-white mt-2">9.99€ <span className="text-xl font-medium text-gray-400">/mois</span></p>
                        <p className="text-sm text-[#13EC5B]/80 mt-2 font-medium">7 jours d'essai gratuit, annulable à tout moment.</p>
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-6 h-6 rounded-full bg-[#13EC5B] flex items-center justify-center text-[#102216]">
                                <span className="material-symbols-outlined text-sm font-black">check</span>
                            </div>
                            <span className="font-medium">Coach Navi <span className="text-[#13EC5B]">ILLIMITÉ</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-6 h-6 rounded-full bg-[#13EC5B] flex items-center justify-center text-[#102216]">
                                <span className="material-symbols-outlined text-sm font-black">check</span>
                            </div>
                            <span className="font-medium">Analyse Vision IA (Repas/Forme)</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-6 h-6 rounded-full bg-[#13EC5B] flex items-center justify-center text-[#102216]">
                                <span className="material-symbols-outlined text-sm font-black">check</span>
                            </div>
                            <span className="font-medium">Programmes Évolutifs</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-6 h-6 rounded-full bg-[#13EC5B] flex items-center justify-center text-[#102216]">
                                <span className="material-symbols-outlined text-sm font-black">check</span>
                            </div>
                            <span className="font-medium">Support Prioritaire 24/7</span>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubscribe}
                        disabled={isLoading || isSuccess}
                        className="w-full bg-[#13EC5B] hover:bg-[#0fd650] text-[#102216] font-black py-5 rounded-2xl text-lg shadow-xl shadow-[#13EC5B]/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-[#102216] border-t-transparent rounded-full animate-spin" />
                                Activation...
                            </span>
                        ) : isSuccess ? (
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span>
                                Premium Activé !
                            </span>
                        ) : (
                            <>
                                JE PASSE AU NIVEAU SUPÉRIEUR
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </>
                        )}
                    </motion.button>
                </motion.div>

            </motion.div>

            {/* Footer Navigation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 1 } }}
                className="absolute bottom-8 left-0 w-full text-center z-20"
            >
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-500 hover:text-white text-sm font-medium transition-colors hover:underline"
                >
                    Non merci, je continuerai avec le plan gratuit
                </button>
            </motion.div>
        </div>
    );
};

export default PremiumSalesPage;
