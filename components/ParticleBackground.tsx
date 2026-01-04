import React, { useMemo, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const ParticleBackground: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const particles = useMemo(() => {
        return Array.from({ length: 45 }).map((_, i) => ({
            id: i,
            size: Math.random() * 3 + 0.5,
            baseX: Math.random() * 100,
            baseY: Math.random() * 100,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.4 + 0.1
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[-5] overflow-hidden">
            {particles.map((p) => {
                // Calculation of distance to push particles
                const dx = p.baseX - mousePos.x;
                const dy = p.baseY - mousePos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const push = dist < 15 ? (15 - dist) / 5 : 0;

                return (
                    <motion.div
                        key={p.id}
                        animate={{
                            x: [`${p.baseX + (dx * push)}vw`, `${p.baseX + (dx * push) + 2}vw`, `${p.baseX + (dx * push)}vw`],
                            y: [`${p.baseY + (dy * push)}vh`, `${p.baseY + (dy * push) + 2}vh`, `${p.baseY + (dy * push)}vh`],
                            opacity: [p.opacity, p.opacity * 0.4, p.opacity],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{
                            position: 'absolute',
                            width: p.size,
                            height: p.size,
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            boxShadow: `0 0 ${p.size * 4}px #10b981`,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default ParticleBackground;
