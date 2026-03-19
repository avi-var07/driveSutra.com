import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Confetti particle component
const Confetti = ({ delay }) => (
    <motion.div
        className="absolute"
        initial={{
            top: '50%', left: '50%', opacity: 1, scale: 0,
            x: (Math.random() - 0.5) * 20, y: 0
        }}
        animate={{
            y: [0, -100 - Math.random() * 200],
            x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 300],
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            rotate: [0, Math.random() * 720]
        }}
        transition={{
            duration: 2 + Math.random(),
            delay: delay + 1.5,
            ease: 'easeOut'
        }}
        style={{
            width: 8 + Math.random() * 8,
            height: 8 + Math.random() * 8,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            background: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)]
        }}
    />
);

export default function TreePlantingAnimation({ treesPlanted = 1, onComplete, ecoScore = 0 }) {
    const [stage, setStage] = useState(0); // 0: seed, 1: sprout, 2: sapling, 3: tree, 4: celebration
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStage(1), 500),
            setTimeout(() => setStage(2), 1500),
            setTimeout(() => setStage(3), 2500),
            setTimeout(() => { setStage(4); setShowStats(true); }, 3500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center py-8 overflow-hidden">
            {/* Confetti particles */}
            {stage >= 4 && Array.from({ length: 30 }).map((_, i) => (
                <Confetti key={i} delay={i * 0.05} />
            ))}

            {/* Ground line */}
            <motion.div
                className="absolute bottom-16 w-64 h-1 bg-gradient-to-r from-transparent via-emerald-700 to-transparent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
            />

            {/* Sun */}
            <motion.div
                className="absolute top-4 right-8"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: stage >= 2 ? 1 : 0, scale: stage >= 2 ? 1 : 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="w-12 h-12 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 flex items-center justify-center text-xl">
                    ☀️
                </div>
            </motion.div>

            {/* Tree stages */}
            <div className="relative h-48 flex items-end justify-center mb-4">
                {/* Stage 0: Seed */}
                <AnimatePresence>
                    {stage === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="text-3xl"
                        >
                            🌱
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stage 1: Sprout */}
                <AnimatePresence>
                    {stage === 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.3, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-5xl"
                        >
                            🌿
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stage 2: Sapling */}
                <AnimatePresence>
                    {stage === 2 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-6xl"
                        >
                            🪴
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stage 3+: Full Tree */}
                <AnimatePresence>
                    {stage >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                                opacity: 1,
                                scale: [0.5, 1.1, 1],
                            }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="text-8xl"
                        >
                            🌳
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Stage labels */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={stage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center text-emerald-300 text-lg font-semibold mb-4"
                >
                    {stage === 0 && 'Planting seed...'}
                    {stage === 1 && 'Sprouting! 🌱'}
                    {stage === 2 && 'Growing strong...'}
                    {stage === 3 && 'Almost there!'}
                    {stage === 4 && `🎉 ${treesPlanted} Tree${treesPlanted > 1 ? 's' : ''} Planted!`}
                </motion.p>
            </AnimatePresence>

            {/* Stats appear after celebration */}
            <AnimatePresence>
                {showStats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center space-y-2"
                    >
                        <p className="text-slate-400 text-sm">
                            Your eco-friendly choice helped plant {treesPlanted} tree{treesPlanted > 1 ? 's' : ''}!
                        </p>
                        {ecoScore > 0 && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                                <span className="text-emerald-400 font-bold">EcoScore: {ecoScore}</span>
                            </div>
                        )}
                        {onComplete && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                onClick={onComplete}
                                className="mt-4 block mx-auto px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold"
                            >
                                Continue →
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Growing progress bar */}
            <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden"
            >
                <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: stage >= 4 ? '100%' : `${(stage / 4) * 100}%` }}
                    transition={{ duration: 0.8 }}
                />
            </motion.div>
        </div>
    );
}
