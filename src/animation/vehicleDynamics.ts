import gsap from 'gsap';
import { sampleDrive } from './driveMotion';

export function createVehicleDynamics(root: HTMLElement, mobile: boolean) {
  const body = root.querySelector<HTMLElement>('.vehicle-entrance');
  const ground = root.querySelector<HTMLElement>('.vehicle-ground');
  const light = root.querySelector<HTMLElement>('.vehicle-light');
  const trail = root.querySelector<HTMLElement>('.vehicle-trail');
  const reflections = root.querySelectorAll<SVGGElement>('.car-reflection-sweep');
  const reflectionMasks = root.querySelectorAll<SVGGElement>('.car-reflection');
  if (!body || !ground || !light || !trail) return () => {};

  // These sets register every property with the enclosing GSAP context so that
  // quickSetter updates are also restored on unmount and reduced-motion changes.
  gsap.set(body, { y: 0, rotation: 0, rotationY: 0, scale: 1, transformPerspective: 1100 });
  gsap.set(ground, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 0.28 });
  gsap.set(light, { scaleX: 1, opacity: 0.08 });
  gsap.set(trail, { scaleX: 0.7, opacity: 0, transformOrigin: '100% 50%' });
  gsap.set(reflections, { x: -280 });
  gsap.set(reflectionMasks, { opacity: 0 });

  const bodyY = gsap.quickSetter(body, 'y', 'px');
  const bodyPitch = gsap.quickSetter(body, 'rotationY', 'deg');
  const bodyRoll = gsap.quickSetter(body, 'rotation', 'deg');
  const bodyScale = gsap.quickSetter(body, 'scale');
  const shadowX = gsap.quickSetter(ground, 'x', 'px');
  const shadowY = gsap.quickSetter(ground, 'y', 'px');
  const shadowScaleX = gsap.quickSetter(ground, 'scaleX');
  const shadowScaleY = gsap.quickSetter(ground, 'scaleY');
  const shadowOpacity = gsap.quickSetter(ground, 'opacity');
  const lightScale = gsap.quickSetter(light, 'scaleX');
  const lightOpacity = gsap.quickSetter(light, 'opacity');
  const trailScale = gsap.quickSetter(trail, 'scaleX');
  const trailOpacity = gsap.quickSetter(trail, 'opacity');
  const reflectionX = gsap.quickSetter(reflections, 'x');
  const reflectionOpacity = gsap.quickSetter(reflectionMasks, 'opacity');
  const amplitude = mobile ? 0.65 : 1;

  return (progress: number) => {
    const { distance, speed, acceleration, suspension } = sampleDrive(progress);
    const pass = Math.sin(distance * Math.PI);

    // Sub-pixel suspension and small pitch suggest load transfer, not bobbing.
    bodyY((suspension + acceleration * 0.3) * amplitude);
    bodyPitch(acceleration * 0.7 * amplitude);
    bodyRoll(Math.sin(distance * Math.PI * 2) * pass * 0.1 * amplitude);
    bodyScale(1 + speed * 0.0025 * amplitude);

    shadowX((speed * 1.4 - acceleration * 0.6) * amplitude);
    shadowY((speed * 0.8 + suspension * 0.3) * amplitude);
    shadowScaleX(1 + speed * 0.022);
    shadowScaleY(1 - Math.abs(acceleration) * 0.015);
    shadowOpacity(0.28 + speed * 0.055);
    lightScale(1 + pass * 0.035);
    lightOpacity(0.07 + pass * 0.09);
    trailScale(0.65 + speed * 0.3);
    trailOpacity(speed * 0.1);

    // A neutral reflection moves over the car's actual alpha silhouette, not a
    // rectangular overlay. Its mask is static; only transform/opacity change.
    reflectionX(-280 + distance * 1560);
    reflectionOpacity(pass * 0.105);
  };
}