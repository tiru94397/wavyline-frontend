import { motion } from 'motion/react';

interface WaveBackgroundProps {
  className?: string;
}

export function WaveBackground({ className = '' }: WaveBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Animated wave gradients */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-1/2 -left-1/2 w-full h-full opacity-10"
      >
        <div className="w-full h-full bg-gradient-radial from-blue-400 via-cyan-300 to-transparent rounded-full blur-3xl"></div>
      </motion.div>
      
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-1/2 -right-1/2 w-full h-full opacity-10"
      >
        <div className="w-full h-full bg-gradient-radial from-cyan-400 via-blue-300 to-transparent rounded-full blur-3xl"></div>
      </motion.div>

      {/* Floating wave particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, -40, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
          }}
          className={`absolute w-2 h-2 bg-blue-400 rounded-full blur-sm`}
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}

      {/* Wave lines */}
      <motion.div
        animate={{
          pathLength: [0, 1, 0],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0"
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M0,50 Q25,30 50,50 T100,50"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            className="text-blue-300"
          />
        </svg>
      </motion.div>
    </div>
  );
}