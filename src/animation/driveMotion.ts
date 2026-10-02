export const DRIVE_MOTION = {
  ramp: 0.16,
  rest: 0.025,
  desktopScrub: 0.42,
  mobileScrub: 0.32,
} as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => value ** 3 * (10 + value * (-15 + 6 * value));
const rampIntegral = (value: number) => value ** 4 * (2.5 - 3 * value + value ** 2);

function journeyTime(progress: number) {
  return clamp((progress - DRIVE_MOTION.rest) / (1 - DRIVE_MOTION.rest * 2));
}

// Integrating a quintic velocity ramp gives continuous acceleration and jerk at
// launch, cruise, and braking joins. Both short rest periods remain scroll-bound.
export function driveDistanceProgress(progress: number): number {
  const time = journeyTime(progress);
  const { ramp } = DRIVE_MOTION;
  if (time <= ramp) return ramp * rampIntegral(time / ramp) / (1 - ramp);
  if (time >= 1 - ramp) return 1 - ramp * rampIntegral((1 - time) / ramp) / (1 - ramp);
  return (time - ramp / 2) / (1 - ramp);
}

export function driveProgressForDistance(distance: number): number {
  const target = clamp(distance);
  if (target === 0 || target === 1) return target;
  let low = 0;
  let high = 1;
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const midpoint = (low + high) / 2;
    if (driveDistanceProgress(midpoint) < target) low = midpoint;
    else high = midpoint;
  }
  return (low + high) / 2;
}

export interface DriveSample {
  distance: number;
  speed: number;
  acceleration: number;
  suspension: number;
}

export function sampleDrive(progress: number): DriveSample {
  const time = journeyTime(progress);
  const { ramp } = DRIVE_MOTION;
  const launch = time < ramp;
  const braking = time > 1 - ramp;
  const rampTime = clamp((launch ? time : 1 - time) / ramp);
  const speed = launch || braking ? smoothstep(rampTime) : 1;
  const acceleration = launch || braking
    ? (launch ? 1 : -1) * 16 * rampTime ** 2 * (1 - rampTime) ** 2
    : 0;
  const suspension = Math.sin(time * Math.PI * 4) * Math.sin(time * Math.PI) ** 2 * 0.28;
  return { distance: driveDistanceProgress(progress), speed, acceleration, suspension };
}