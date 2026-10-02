import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ARTWORK_WIDTH } from '../data/cars';
import { calculateDriveGeometry } from '../animation/driveGeometry';
import { DRIVE_MOTION, driveDistanceProgress, driveProgressForDistance } from '../animation/driveMotion';
import { createVehicleDynamics } from '../animation/vehicleDynamics';

gsap.registerPlugin(ScrollTrigger);

export function motionBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

// All driving effects share one rendered, scroll-scrubbed playhead.
export function useHeroAnimation(root: RefObject<HTMLElement | null>) {
  const trigger = useRef<ScrollTrigger | null>(null);
  const hasIntroduced = useRef(false);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const mm = gsap.matchMedia(element);
    let cancelled = false;
    let resumeProgress: number | null = null;

    try {
      mm.add(
        {
          desktop: '(min-width: 701px)',
          mobile: '(max-width: 700px)',
          reduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { mobile, reduced } = context.conditions!;
          const road = element.querySelector<HTMLElement>('.road');
          const travel = element.querySelector<HTMLElement>('.vehicle-travel');
          const cover = element.querySelector<HTMLElement>('.band-cover');
          const bandLines = element.querySelector<HTMLElement>('.band-lines');
          const sheen = element.querySelector<HTMLElement>('.band-sheen');
          const progress = element.querySelector<HTMLElement>('.journey-fill');
          const phase = element.querySelector<HTMLElement>('.journey-phase');
          const cards = Array.from(element.querySelectorAll<HTMLElement>('[data-reveal="metric"]'));
          const counts = element.querySelectorAll<HTMLElement>('.metric-count');
          if (!road || !travel || !cover) return;

          const geometry = () => calculateDriveGeometry(road.clientWidth, travel.offsetWidth);

          if (reduced) {
            element.dataset.motion = 'still';
            resumeProgress = null;
            gsap.set(travel, {
              x: () => road.clientWidth - travel.offsetWidth,
              xPercent: 0,
              y: 0,
              yPercent: -50,
            });
            gsap.set(cover, { x: 0, xPercent: 100 });
            gsap.set(cards, { autoAlpha: 1, scale: 1, y: 0, rotation: 0 });
            counts.forEach((node) => {
              node.textContent = node.dataset.value ?? '';
            });
            if (phase) phase.textContent = 'TAKE IT ALL IN';
            return () => {
              delete element.dataset.motion;
            };
          }

          element.dataset.motion = 'cinematic';
          const renderVehicle = createVehicleDynamics(element, mobile);

          // Fixed slots remain untouched; only the card interiors reveal.
          gsap.set(travel, { x: () => geometry().startX, xPercent: 0, y: 0, yPercent: -50, force3D: true });
          gsap.set(cover, { x: 0, xPercent: 8, force3D: true });
          cards.forEach((card, index) => {
            const fromAbove = index < 2;
            gsap.set(card, {
              autoAlpha: 0,
              scale: 0.955,
              y: (fromAbove ? -1 : 1) * (mobile ? 12 : 20),
              rotation: 0,
              transformOrigin: '50% 50%',
              force3D: true,
            });
          });
          counts.forEach((node) => {
            node.textContent = '0';
          });

          let intro: gsap.core.Timeline | null = null;
          const finishIntro = () => {
            if (intro && intro.progress() < 1) intro.progress(1).pause();
          };

          if (!hasIntroduced.current && window.scrollY < 40) {
            const entrance = gsap.timeline({
              defaults: { ease: 'power3.out' },
              onComplete: () => {
                hasIntroduced.current = true;
              },
            });
            intro = entrance;
            entrance
              .from('[data-intro="nav"]', { y: -6, opacity: 0, duration: 0.45 }, 0)
              .from(
                '.headline-letter',
                { yPercent: 105, opacity: 0, stagger: 0.023, duration: 0.62 },
                0.08,
              )
              .from('[data-intro="support"]', { y: 7, opacity: 0, duration: 0.48, stagger: 0.045 }, 0.18)
              .from('.vehicle-appear', { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0.12);
          }

          let lastPhase = -1;
          let latestProgress = 0;
          let wasPinned = false;
          let resizeProgress: number | null = null;
          let viewportWidth = window.innerWidth;
          let viewportHeight = window.innerHeight;
          const labels = ['01 / IGNITION', '02 / REVEAL', '03 / REVEAL', '04 / ARRIVAL'];
          const updatePhase = (value: number) => {
            const currentPhase = value < 0.18 ? 0 : value < 0.45 ? 1 : value < 0.78 ? 2 : 3;
            if (phase && currentPhase !== lastPhase) {
              phase.textContent = labels[currentPhase];
              lastPhase = currentPhase;
            }
          };

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: 'itzfizz-drive',
              trigger: element,
              start: 'top top',
              end: () => `+=${element.offsetHeight * (mobile ? 2.4 : 3.0)}`,
              pin: true,
              pinType: 'fixed',
              pinSpacing: true,
              scrub: mobile ? DRIVE_MOTION.mobileScrub : DRIVE_MOTION.desktopScrub,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate(self) {
                latestProgress = self.progress;
                wasPinned = self.isActive;
                if (self.progress > 0) finishIntro();
              },
              onToggle(self) {
                element.dataset.motionActive = self.isActive ? 'true' : 'false';
              },
              onLeave(self) {
                // A fast fling must not leave the car or metrics catching up
                // after unpinning. The final rest window normally settles first.
                self.getTween()?.progress(1);
                self.animation?.totalProgress(1);
              },
              onLeaveBack(self) {
                self.getTween()?.progress(1);
                self.animation?.totalProgress(0);
              },
              onRefreshInit(self) {
                if (
                  self.isActive &&
                  (viewportWidth !== window.innerWidth || viewportHeight !== window.innerHeight)
                ) {
                  resizeProgress = self.progress;
                }
              },
              onRefresh(self) {
                viewportWidth = window.innerWidth;
                viewportHeight = window.innerHeight;
                if (resizeProgress !== null) {
                  const position = self.start + (self.end - self.start) * resizeProgress;
                  resizeProgress = null;
                  self.scroll(position);
                  self.update();
                  self.getTween()?.progress(1);
                }
                updatePhase(driveDistanceProgress(self.progress));
              },
            },
            onUpdate() {
              const value = this.progress();
              updatePhase(driveDistanceProgress(value));
              renderVehicle(value);
            },
          });
          trigger.current = timeline.scrollTrigger ?? null;

          // Identical easing keeps the tire displacement and painted road locked
          // to the car through launch, cruise, braking, and reverse scrolling.
          timeline
            .fromTo(travel, { x: () => geometry().startX }, { x: () => geometry().endX, duration: 1, ease: driveDistanceProgress }, 0)
            .fromTo(cover, { xPercent: 8 }, { xPercent: 100, duration: 1, ease: driveDistanceProgress }, 0)
            .fromTo(
              '.rolling-tread-pattern',
              { attr: { patternTransform: 'translate(0 0)' } },
              {
                attr: {
                  patternTransform: () => `translate(${-geometry().treadDistance * ARTWORK_WIDTH} 0)`,
                },
                duration: 1,
                ease: driveDistanceProgress,
              },
              0,
            );

          const revealDistances = [0.1, 0.32, 0.54, 0.74];
          cards.forEach((card, index) => {
            const distance = revealDistances[index] ?? 0.1;
            const at = driveProgressForDistance(distance);
            const revealLength = driveProgressForDistance(distance + 0.18) - at;
            timeline.fromTo(
              card,
              {
                autoAlpha: 0,
                scale: 0.955,
                y: (index < 2 ? -1 : 1) * (mobile ? 12 : 20),
                rotation: 0,
              },
              {
                autoAlpha: 1,
                scale: 1,
                y: 0,
                rotation: 0,
                duration: revealLength,
                ease: 'power3.out',
              },
              at,
            );
            const label = card.querySelector<HTMLElement>('.metric-label');
            if (label) {
              timeline.fromTo(label,
                { y: 5, opacity: 0 },
                { y: 0, opacity: 0.92, duration: revealLength * 0.75, ease: 'power2.out' },
                at + revealLength * 0.2);
            }

            const count = counts[index];
            if (count) {
              const target = Number(count.dataset.value ?? '0');
              const counter = { value: 0 };
              timeline.fromTo(
                counter,
                { value: 0 },
                {
                  value: target,
                  duration: revealLength,
                  ease: 'power1.out',
                  onUpdate: () => {
                    const value = String(Math.round(counter.value));
                    if (count.textContent !== value) count.textContent = value;
                  },
                },
                at,
              );
            }
          });

          if (sheen) {
            timeline.fromTo(
              sheen,
              { x: () => geometry().startX - road.clientWidth * 0.25 },
              { x: () => geometry().endX + road.clientWidth * 0.1, duration: 1, ease: driveDistanceProgress },
              0,
            );
          }
          if (bandLines) {
            timeline.fromTo(bandLines, { xPercent: 0 }, { xPercent: -2, duration: 1, ease: driveDistanceProgress }, 0);
            timeline.fromTo(bandLines.children,
              { xPercent: 0 },
              { xPercent: (index) => -(index + 1) * 0.5, duration: 1, ease: driveDistanceProgress }, 0);
          }
          timeline.fromTo('.road-vignette', { opacity: 0.4 }, { opacity: 0.3, duration: 1 }, 0);
          if (progress) timeline.fromTo(progress, { scaleX: 0.02 }, { scaleX: 1, duration: 1 }, 0);

          const active = trigger.current;
          active?.refresh();
          active?.update();
          if (active && resumeProgress !== null) {
            const position = active.start + (active.end - active.start) * resumeProgress;
            resumeProgress = null;
            active.scroll(position);
            active.update();
            active.getTween()?.progress(1);
            finishIntro();
          }
          if (active) {
            renderVehicle(timeline.progress());
            updatePhase(driveDistanceProgress(timeline.progress()));
          }

          return () => {
            if (!cancelled && wasPinned && latestProgress > 0 && latestProgress < 1) {
              resumeProgress = latestProgress;
            }
            intro?.kill();
            trigger.current = null;
            delete element.dataset.motion;
            delete element.dataset.motionActive;
            counts.forEach((node) => {
              node.textContent = node.dataset.value ?? '';
            });
          };
        },
      );

      void document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    } catch (error) {
      mm.revert();
      element.dataset.motion = 'still';
      console.error('The cinematic sequence could not initialize. The static experience remains available.', error);
    }

    return () => {
      cancelled = true;
      mm.revert();
      trigger.current = null;
    };
  }, [root]);

  const beginDrive = useCallback(() => {
    const active = trigger.current;
    if (!active) {
      document.getElementById('the-idea')?.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
      return;
    }
    const nextProgress = Math.min(1, active.progress + 0.25);
    const position = active.start + (active.end - active.start) * nextProgress;
    window.scrollTo({ top: position, behavior: motionBehavior() });
  }, []);

  return { beginDrive };
}
