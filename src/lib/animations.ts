export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const fadeInUp = (options?: {
  delay?: number;
  duration?: number;
  distance?: number;
}) => {
  const { delay = 0, duration = 0.36, distance = 14 } = options ?? {};

  return {
    initial: { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: premiumEase },
  };
};
