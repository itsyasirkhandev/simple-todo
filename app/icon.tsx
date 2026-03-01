import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

/**
 * Generates an optimized, premium SVG checkmark icon dynamically for the application.
 * Utilizes `next/og` ImageResponse for zero-latency, dynamically generated icons
 * matching the dark theme, glassmorphic aesthetic of the application.
 * 
 * @returns {ImageResponse} The dynamically generated PNG icon.
 */
export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(135deg, hsl(0, 0%, 9%), hsl(0, 0%, 4%))',
          borderRadius: '24%',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.05)',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          style={{
            strokeWidth: '2.5px',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            opacity: 0.9,
          }}
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
