import confetti from "canvas-confetti";

export function fireConfetti() {
  const colors = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899"];

  // First burst from left
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.2, y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  // Second burst from right
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.8, y: 0.6 },
      colors,
      disableForReducedMotion: true,
    });
  }, 150);

  // Center burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors,
      disableForReducedMotion: true,
    });
  }, 300);
}

export function fireSuccessConfetti() {
  const colors = ["#10b981", "#34d399", "#6ee7b7"];
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.7 },
    colors,
    disableForReducedMotion: true,
  });
}
