"use client";

import * as React from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 800,
  className,
  format = (n) => String(Math.round(n)),
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const prevValue = React.useRef(0);

  React.useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{format(displayValue)}</span>;
}
