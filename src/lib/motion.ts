export const motionTokens = {
  duration: {
    fast: 0.2,
    normal: 0.4,
    cinematic: 0.8,
    epic: 1.2,
  },
  ease: {
    standard: [0.4, 0.0, 0.2, 1] as const,
    smooth: [0.25, 1, 0.5, 1] as const,
    bouncy: [0.175, 0.885, 0.32, 1.275] as const,
  },
};

export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.normal, ease: motionTokens.ease.smooth } },
  exit: { opacity: 0, y: -20, transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.normal, ease: motionTokens.ease.smooth } }
};
