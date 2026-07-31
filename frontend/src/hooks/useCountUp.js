import { useEffect, useRef, useState } from "react";

// Animates a number from 0 up to `target` whenever `target` changes.
// Used to give stat cards / dashboards a "live" counting-up feel.
export default function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const numericTarget = Number(target);
    if (Number.isNaN(numericTarget)) {
      setValue(0);
      return;
    }

    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(numericTarget * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(numericTarget);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}
