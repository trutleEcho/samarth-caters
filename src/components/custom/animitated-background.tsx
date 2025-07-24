'use client';

import {motion} from "framer-motion";
import {useMemo, useEffect, useState} from "react";

export default function AnimatedBackground()  {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const particles = useMemo(() => {
        if (!isClient) {
            // Return deterministic values for SSR
            return Array.from({ length: 50 }).map((_, i) => {
                const left = (i * 2) % 100;
                const top = (i * 3) % 100;
                const x = (i * 4) % 100 - 50;
                const duration = 15 + (i % 10);
                const delay = i % 10;

                return { key: `particle-${i}`, left, top, x, duration, delay };
            });
        }

        // Use random values only on client
        return Array.from({ length: 50 }).map((_, i) => {
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const x = Math.random() * 100 - 50;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 10;

            return { key: `particle-${i}`, left, top, x, duration, delay };
        });
    }, [isClient]);

    const orbs = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 6 }).map((_, i) => ({
                key: `orb-${i}`,
                width: 250 + (i * 50),
                height: 250 + (i * 50),
                left: (i * 16.67) % 100,
                top: (i * 20) % 100,
                x: (i * 10) % 100 - 50,
                y: (i * 15) % 100 - 50,
                duration: 30 + (i * 5),
                delay: i * 2,
                scale: 1 + (i * 0.1),
                rotate: i * 60
            }));
        }

        return Array.from({ length: 6 }).map((_, i) => ({
            key: `orb-${i}`,
            width: Math.random() * 300 + 200,
            height: Math.random() * 300 + 200,
            left: Math.random() * 100,
            top: Math.random() * 100,
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            duration: Math.random() * 20 + 20,
            delay: Math.random() * 5,
            scale: 1 + Math.random() * 0.2,
            rotate: Math.random() * 360
        }));
    }, [isClient]);

    const lines = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 8 }).map((_, i) => ({
                key: `line-${i}`,
                width: 150 + (i * 10),
                left: (i * 12.5) % 100,
                top: (i * 15) % 100,
                rotate: i * 45,
                duration: 15 + (i * 2),
                delay: i * 1.5
            }));
        }

        return Array.from({ length: 8 }).map((_, i) => ({
            key: `line-${i}`,
            width: Math.random() * 200 + 100,
            left: Math.random() * 100,
            top: Math.random() * 100,
            rotate: Math.random() * 360,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 10
        }));
    }, [isClient]);

    const blobs = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 4 }).map((_, i) => ({
                key: `blob-${i}`,
                width: 350 + (i * 50),
                height: 350 + (i * 50),
                left: (i * 25) % 100,
                top: (i * 30) % 100,
                x: (i * 20) % 200 - 100,
                y: (i * 25) % 200 - 100,
                duration: 35 + (i * 5),
                delay: i * 3,
                scale: 1 + (i * 0.2),
                rotate: i * 90
            }));
        }

        return Array.from({ length: 4 }).map((_, i) => ({
            key: `blob-${i}`,
            width: Math.random() * 400 + 300,
            height: Math.random() * 400 + 300,
            left: Math.random() * 100,
            top: Math.random() * 100,
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            duration: Math.random() * 25 + 20,
            delay: Math.random() * 10,
            scale: 1 + Math.random() * 0.7,
            rotate: Math.random() * 360
        }));
    }, [isClient]);

    const stars = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 30 }).map((_, i) => ({
                key: `star-${i}`,
                left: (i * 3.33) % 100,
                top: (i * 4) % 100,
                duration: 3 + (i % 3),
                delay: i % 5
            }));
        }

        return Array.from({ length: 30 }).map((_, i) => ({
            key: `star-${i}`,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5
        }));
    }, [isClient]);

    const connections = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 15 }).map((_, i) => ({
                key: `connection-${i}`,
                width: 100 + (i * 5),
                left: (i * 6.67) % 100,
                top: (i * 8) % 100,
                rotate: i * 24,
                duration: 4 + (i % 3),
                delay: i % 8
            }));
        }

        return Array.from({ length: 15 }).map((_, i) => ({
            key: `connection-${i}`,
            width: Math.random() * 150 + 50,
            left: Math.random() * 100,
            top: Math.random() * 100,
            rotate: Math.random() * 360,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 8
        }));
    }, [isClient]);

    const ripples = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 6 }).map((_, i) => ({
                key: `ripple-${i}`,
                left: (i * 16.67) % 100,
                top: (i * 20) % 100,
                duration: 6 + (i % 4),
                delay: i * 2
            }));
        }

        return Array.from({ length: 6 }).map((_, i) => ({
            key: `ripple-${i}`,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: Math.random() * 6 + 4,
            delay: Math.random() * 10
        }));
    }, [isClient]);

    const shapes = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 12 }).map((_, i) => ({
                key: `shape-${i}`,
                left: (i * 8.33) % 100,
                top: (i * 10) % 100,
                x: (i * 5) % 100 - 50,
                duration: 12 + (i % 8),
                delay: i % 8,
                rotate: i * 30
            }));
        }

        return Array.from({ length: 12 }).map((_, i) => ({
            key: `shape-${i}`,
            left: Math.random() * 100,
            top: Math.random() * 100,
            x: Math.random() * 100 - 50,
            duration: Math.random() * 12 + 8,
            delay: Math.random() * 8,
            rotate: Math.random() * 360
        }));
    }, [isClient]);

    const pulses = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 8 }).map((_, i) => ({
                key: `pulse-${i}`,
                left: (i * 12.5) % 100,
                top: (i * 15) % 100,
                duration: 5 + (i % 3),
                delay: i % 6,
                rotate: i * 45
            }));
        }

        return Array.from({ length: 8 }).map((_, i) => ({
            key: `pulse-${i}`,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: Math.random() * 5 + 3,
            delay: Math.random() * 6,
            rotate: Math.random() * 180
        }));
    }, [isClient]);

    const matrixLines = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 25 }).map((_, i) => ({
                key: `matrix-${i}`,
                height: 150 + (i * 5),
                left: (i * 4) % 100,
                duration: 8 + (i % 5),
                delay: i % 10
            }));
        }

        return Array.from({ length: 25 }).map((_, i) => ({
            key: `matrix-${i}`,
            height: Math.random() * 200 + 100,
            left: Math.random() * 100,
            duration: Math.random() * 8 + 5,
            delay: Math.random() * 10
        }));
    }, [isClient]);

    const dots = useMemo(() => {
        if (!isClient) {
            return Array.from({ length: 20 }).map((_, i) => ({
                key: `dot-${i}`,
                left: (i * 5) % 100,
                top: (i * 6) % 100,
                duration: 4 + (i % 2),
                delay: i % 5
            }));
        }

        return Array.from({ length: 20 }).map((_, i) => ({
            key: `dot-${i}`,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: Math.random() * 4 + 2,
            delay: Math.random() * 5
        }));
    }, [isClient]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Animated Gradient Waves */}
            <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                    background: [
                        "radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--secondary)) 0%, transparent 50%), radial-gradient(circle at 40% 80%, hsl(var(--accent)) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 20% 80%, hsl(var(--secondary)) 0%, transparent 50%), radial-gradient(circle at 60% 40%, hsl(var(--accent)) 0%, transparent 50%)",
                        "radial-gradient(circle at 40% 40%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 60% 70%, hsl(var(--secondary)) 0%, transparent 50%), radial-gradient(circle at 20% 20%, hsl(var(--accent)) 0%, transparent 50%)",
                    ]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Animated Grid Pattern */}
            <motion.div
                className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"
                animate={{
                    backgroundPosition: ["0px 0px", "50px 50px"],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Floating Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.key}
                    className="absolute w-1 h-1 bg-primary/20 rounded-full"
                    style={{ left: `${p.left}%`, top: `${p.top}%` }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, p.x, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Large Floating Orbs */}
            {orbs.map((orb) => (
                <motion.div
                    key={orb.key}
                    className="absolute rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 blur-2xl"
                    style={{
                        width: orb.width,
                        height: orb.height,
                        left: `${orb.left}%`,
                        top: `${orb.top}%`,
                    }}
                    animate={{
                        x: [0, orb.x, 0],
                        y: [0, orb.y, 0],
                        scale: [1, orb.scale, 1],
                        rotate: [0, orb.rotate, 360],
                    }}
                    transition={{
                        duration: orb.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: orb.delay,
                    }}
                />
            ))}

            {/* Flowing Lines */}
            {lines.map((line) => (
                <motion.div
                    key={line.key}
                    className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                    style={{
                        width: `${line.width}px`,
                        left: `${line.left}%`,
                        top: `${line.top}%`,
                        transform: `rotate(${line.rotate}deg)`,
                    }}
                    animate={{
                        x: ["-100%", "100vw"],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: line.duration,
                        repeat: Infinity,
                        delay: line.delay,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Animated Wave Patterns */}
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={`wave-${i}`}
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: `linear-gradient(${45 + i * 45}deg, transparent 40%, hsl(var(--primary))/10 50%, transparent 60%)`,
                    }}
                    animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 15 + i * 5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 2,
                    }}
                />
            ))}

            {/* Morphing Blobs */}
            {blobs.map((blob) => (
                <motion.div
                    key={blob.key}
                    className="absolute rounded-full bg-gradient-to-r from-primary/5 to-secondary/5 blur-3xl"
                    style={{
                        width: blob.width,
                        height: blob.height,
                        left: `${blob.left}%`,
                        top: `${blob.top}%`,
                    }}
                    animate={{
                        x: [0, blob.x, 0],
                        y: [0, blob.y, 0],
                        scale: [1, blob.scale, 0.8, 1],
                        rotate: [0, blob.rotate, 360],
                        borderRadius: ["50%", "30% 70% 70% 30%", "70% 30% 30% 70%", "50%"],
                    }}
                    transition={{
                        duration: blob.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: blob.delay,
                    }}
                />
            ))}

            {/* Constellation Effect */}
            {stars.map((star) => (
                <motion.div
                    key={star.key}
                    className="absolute w-1 h-1 bg-primary/60 rounded-full"
                    style={{
                        left: `${star.left}%`,
                        top: `${star.top}%`,
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Connecting Lines Between Stars */}
            {connections.map((connection) => (
                <motion.div
                    key={connection.key}
                    className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                    style={{
                        width: `${connection.width}px`,
                        left: `${connection.left}%`,
                        top: `${connection.top}%`,
                        transform: `rotate(${connection.rotate}deg)`,
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scaleX: [0, 1, 0],
                    }}
                    transition={{
                        duration: connection.duration,
                        repeat: Infinity,
                        delay: connection.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Ripple Effects */}
            {ripples.map((ripple) => (
                <motion.div
                    key={ripple.key}
                    className="absolute border border-primary/20 rounded-full"
                    style={{
                        left: `${ripple.left}%`,
                        top: `${ripple.top}%`,
                    }}
                    animate={{
                        width: [0, 200, 400],
                        height: [0, 200, 400],
                        opacity: [1, 0.5, 0],
                    }}
                    transition={{
                        duration: ripple.duration,
                        repeat: Infinity,
                        delay: ripple.delay,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Floating Geometric Shapes */}
            {shapes.map((shape, i) => (
                <motion.div
                    key={shape.key}
                    className={`absolute ${
                        i % 3 === 0 ? 'w-3 h-3 bg-primary/30 rotate-45' :
                            i % 3 === 1 ? 'w-4 h-4 bg-secondary/30 rounded-full' :
                                'w-2 h-6 bg-accent/30'
                    }`}
                    style={{
                        left: `${shape.left}%`,
                        top: `${shape.top}%`,
                    }}
                    animate={{
                        y: [0, -150, 0],
                        x: [0, shape.x, 0],
                        rotate: [0, shape.rotate],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: shape.duration,
                        repeat: Infinity,
                        delay: shape.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Energy Pulses */}
            {pulses.map((pulse) => (
                <motion.div
                    key={pulse.key}
                    className="absolute w-20 h-20 border-2 border-primary/30 rounded-full"
                    style={{
                        left: `${pulse.left}%`,
                        top: `${pulse.top}%`,
                    }}
                    animate={{
                        scale: [0, 2, 0],
                        opacity: [1, 0.3, 0],
                        rotate: [0, pulse.rotate],
                    }}
                    transition={{
                        duration: pulse.duration,
                        repeat: Infinity,
                        delay: pulse.delay,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Matrix Rain Effect */}
            {matrixLines.map((matrix) => (
                <motion.div
                    key={matrix.key}
                    className="absolute w-px bg-gradient-to-b from-primary/40 via-secondary/20 to-transparent"
                    style={{
                        height: `${matrix.height}px`,
                        left: `${matrix.left}%`,
                    }}
                    animate={{
                        y: ["-100%", "100vh"],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: matrix.duration,
                        repeat: Infinity,
                        delay: matrix.delay,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Pulsing Dots */}
            {dots.map((dot) => (
                <motion.div
                    key={dot.key}
                    className="absolute w-2 h-2 bg-secondary/40 rounded-full"
                    style={{
                        left: `${dot.left}%`,
                        top: `${dot.top}%`,
                    }}
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: dot.duration,
                        repeat: Infinity,
                        delay: dot.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Spiral Animation */}
            <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                    background: "conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent)",
                }}
                animate={{
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 50,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
};
