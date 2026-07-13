import gsap from 'gsap';

export function burstConfetti(host: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'gift-confetti-layer';
  host.appendChild(layer);
  const w = layer.clientWidth || window.innerWidth;
  const h = layer.clientHeight || window.innerHeight;
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('span');
    el.className = `gift-confetti gc${i % 6}`;
    layer.appendChild(el);
    const x = Math.random() * w;
    gsap.set(el, {
      x,
      y: -24 - Math.random() * h * 0.25,
      rotation: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.9,
    });
    gsap.to(el, {
      y: h + 30,
      x: x + (Math.random() - 0.5) * 180,
      rotation: `+=${(Math.random() - 0.5) * 720}`,
      duration: 1.7 + Math.random() * 1.9,
      delay: Math.random() * 0.4,
      ease: 'power1.in',
    });
  }
  gsap.delayedCall(4.2, () => layer.remove());
}
