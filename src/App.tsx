import { useCallback, useState } from 'react';
import { Hero } from './components/Hero';
import { Conclusion } from './components/Conclusion';
import { ShareDialog } from './components/ShareDialog';
import { readInitialConfiguration } from './data/cars';
import { useTheme } from './hooks/useTheme';
import { motionBehavior } from './hooks/useHeroAnimation';

export default function App() {
  const [configuration, setConfiguration] = useState(readInitialConfiguration);
  const [shareOpen, setShareOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: motionBehavior() });
  }, []);

  const goToGarage = useCallback(() => {
    if (document.getElementById('experience')?.dataset.motion === 'still') {
      document.getElementById('garage')?.scrollIntoView({ behavior: motionBehavior(), block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: motionBehavior() });
    }
    document.querySelector<HTMLInputElement>('input[name="vehicle"]:checked')?.focus({ preventScroll: true });
  }, []);

  const goToIdea = useCallback(() => {
    const conclusion = document.getElementById('the-idea');
    conclusion?.scrollIntoView({ behavior: motionBehavior(), block: 'start' });
    conclusion?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <a className="skip-link" href="#the-idea" onClick={(event) => { event.preventDefault(); goToIdea(); }}>Skip the scroll experience</a>
      <main>
        <Hero
          car={configuration.car} paint={configuration.paint} theme={theme}
          onToggleTheme={toggleTheme}
          onCarChange={(car) => setConfiguration((current) => ({ ...current, car }))}
          onPaintChange={(paint) => setConfiguration((current) => ({ ...current, paint }))}
          onGarage={goToGarage} onReplay={replay} onIdea={goToIdea}
          onShare={() => setShareOpen(true)}
        />
        <Conclusion onGarage={goToGarage} onReplay={replay} onShare={() => setShareOpen(true)} />
      </main>
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} car={configuration.car} paint={configuration.paint} theme={theme} />
    </>
  );
}
