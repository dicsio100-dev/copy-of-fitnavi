import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOG_ENTRIES = [
    "[SYSTEM] :: OPTIMIZING MUSCLE RECOVERY...",
    "[WARNING] :: CORTISOL LEVELS ELEVATED",
    "[DATA] :: SYNCING BIOMETRICS...",
    "[NETWORK] :: CONNECTION SECURE...",
    "[SYSTEM] :: CALCULATING OVERLOAD...",
    "[DATA] :: VITAL SIGNS NOMINAL...",
    "[SYSTEM] :: UPDATING PERFORMANCE CURVE...",
    "[BIOS] :: SCANNING PHYSIOLOGY...",
    "[ALERT] :: ANABOLIC STATE DETECTED",
];

const SystemTerminal: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([LOG_ENTRIES[0]]);
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextLog = LOG_ENTRIES[Math.floor(Math.random() * LOG_ENTRIES.length)];
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
            setLogs(prev => [...prev, `[${timestamp}] ${nextLog}`].slice(-10));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="w-full h-full bg-black flex flex-col p-4 border border-[#14f163]/10 overflow-hidden font-mono text-[11px] text-[#14f163]">
            <div className="flex items-center gap-2 mb-2 border-b border-[#14f163]/20 pb-1">
                <div className="w-2 h-2 rounded-full bg-[#14f163] animate-pulse" />
                <span className="opacity-70 tracking-tighter">&gt; SYSTEM_COMM_RELAY</span>
            </div>

            <div
                ref={terminalRef}
                className="flex-1 overflow-y-auto space-y-1 scrollbar-hide"
            >
                <AnimatePresence mode="popLayout">
                    {logs.map((log, i) => (
                        <motion.div
                            key={log + i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-2"
                        >
                            <span className="opacity-50">#</span>
                            <span>{log}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.span
                    animate={{ opacity: [0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-1.5 h-3 bg-[#14f163] align-middle ml-1"
                />
            </div>

            <div className="mt-2 text-[8px] opacity-30 flex justify-between border-t border-[#14f163]/10 pt-1">
                <span>&gt; RX_TX_BUFFER: READY</span>
                <span>ENC: RSA-4096</span>
            </div>
        </div>
    );
};

export default SystemTerminal;
