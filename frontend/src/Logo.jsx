// The compact OrderIt! map mark — used in the app header.
// It's the same map concept as the full logo, scaled down.
export default function Logo({ size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="OrderIt! logo"
    >
      {/* Map background */}
      <rect width="100" height="100" rx="22" fill="#eef0f8"/>
      {/* City blocks (4 quadrants) */}
      <rect x="4"  y="4"  width="38" height="38" fill="#dde1ef"/>
      <rect x="58" y="4"  width="38" height="38" fill="#dde1ef"/>
      <rect x="4"  y="58" width="38" height="38" fill="#dde1ef"/>
      <rect x="58" y="58" width="38" height="38" fill="#dde1ef"/>
      {/* Order St — horizontal bold street */}
      <rect x="0"  y="43" width="100" height="14" fill="#6366f1"/>
      {/* It! St — vertical bold street */}
      <rect x="43" y="0"  width="14" height="100" fill="#4338ca"/>
      {/* Intersection */}
      <rect x="43" y="43" width="14" height="14" fill="#4f46e5"/>
      {/* Location pin */}
      <circle cx="50" cy="50" r="8" fill="white"/>
      <circle cx="50" cy="50" r="5" fill="#6366f1"/>
      <circle cx="50" cy="48" r="1.8" fill="white"/>
    </svg>
  );
}
