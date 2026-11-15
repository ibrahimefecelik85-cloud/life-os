// Life OS logosu: siyah zemin üzerinde üst üste cam paneller ("tüm modüller tek yerde").
// Aynı çizim src/app/icon.svg (tarayıcı sekmesi ikonu) dosyasında da var; birini değiştirirsen diğerini de güncelle.
import { useId } from "react";

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  // Sayfada birden fazla logo olursa renk geçişi kimlikleri çakışmasın
  const id = useId();
  const bg = `${id}-bg`;
  const wood = `${id}-wood`;

  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className} role="img" aria-label="Life OS logosu">
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2622" />
          <stop offset="1" stopColor="#0d0c0b" />
        </linearGradient>
        <linearGradient id={wood} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d2a979" />
          <stop offset="1" stopColor="#82572f" />
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="480" height="480" rx="120" fill={`url(#${bg})`} stroke="#181614" strokeWidth="12" />
      <rect x="112" y="112" width="288" height="80" rx="28" fill={`url(#${wood})`} stroke="#faf5ee" strokeOpacity="0.5" strokeWidth="6" />
      <rect x="112" y="216" width="200" height="80" rx="28" fill="#faf5ee" fillOpacity="0.85" />
      <rect x="112" y="320" width="128" height="80" rx="28" fill="#faf5ee" fillOpacity="0.35" stroke="#faf5ee" strokeOpacity="0.5" strokeWidth="6" />
      <circle cx="356" cy="360" r="40" fill={`url(#${wood})`} />
    </svg>
  );
}
