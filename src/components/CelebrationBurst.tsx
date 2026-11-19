import { motion, useReducedMotion } from 'motion/react';

interface CelebrationBurstProps {
  triggerKey: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  color: string;
  shape: 'heart' | 'star' | 'diamond';
  delay: number;
}

const PARTICLES: Particle[] = [
  { id: 1, x: -135, y: -70, rotate: -28, scale: 1.0, color: '#EC4899', shape: 'heart', delay: 0.02 },
  { id: 2, x: -95, y: -115, rotate: 22, scale: 0.85, color: '#A855F7', shape: 'star', delay: 0.05 },
  { id: 3, x: -45, y: -135, rotate: -15, scale: 0.9, color: '#F43F5E', shape: 'diamond', delay: 0.04 },
  { id: 4, x: 45, y: -135, rotate: 18, scale: 0.95, color: '#C084FC', shape: 'heart', delay: 0.03 },
  { id: 5, x: 95, y: -110, rotate: -24, scale: 0.85, color: '#F59E0B', shape: 'star', delay: 0.06 },
  { id: 6, x: 140, y: -65, rotate: 32, scale: 1.0, color: '#EC4899', shape: 'diamond', delay: 0.02 },
  { id: 7, x: -150, y: 15, rotate: -35, scale: 0.8, color: '#8B5CF6', shape: 'star', delay: 0.08 },
  { id: 8, x: 150, y: 15, rotate: 35, scale: 0.8, color: '#F472B6', shape: 'heart', delay: 0.07 },
  { id: 9, x: -110, y: 80, rotate: -18, scale: 0.75, color: '#FB7185', shape: 'diamond', delay: 0.09 },
  { id: 10, x: 110, y: 80, rotate: 20, scale: 0.75, color: '#A855F7', shape: 'star', delay: 0.09 },
];

export function CelebrationBurst({ triggerKey }: CelebrationBurstProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      key={triggerKey}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
    >
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.2, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: p.x,
            y: p.y,
            scale: [0.3, p.scale, p.scale * 0.9],
            rotate: p.rotate,
          }}
          transition={{
            duration: 1.15,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute"
        >
          {p.shape === 'heart' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill={p.color}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
          {p.shape === 'star' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill={p.color}>
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
            </svg>
          )}
          {p.shape === 'diamond' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill={p.color}>
              <path d="M12 2L22 12L12 22L2 12L12 2Z" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
