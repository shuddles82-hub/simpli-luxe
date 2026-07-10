'use client';

import { useEffect, useRef, useState } from 'react';
import { HERO_QUOTES } from '@/lib/fallback';

// Rotating script quote in the homepage hero (0.55s fade, 4.2s cycle).
export default function HeroQuotes() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % HERO_QUOTES.length);
        setFading(false);
      }, 550);
    }, 4200);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <div className="hqw an d3">
      <div className={`hq${fading ? ' fade' : ''}`}>{HERO_QUOTES[index]}</div>
    </div>
  );
}
