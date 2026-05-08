import { motion } from 'framer-motion'

export default function FloatingPaths({ position = 1 }) {
  const paths = Array.from({ length: 36 }, (_, i) => {
    const p = position
    // Alternate green and cyan for depth variety
    const isAccent = i % 5 === 0
    const baseOpacity = Math.min(0.18 + i * 0.012, 0.55)
    const color = isAccent
      ? `rgba(0,229,255,${baseOpacity})`
      : `rgba(0,255,136,${baseOpacity * 0.85})`

    return {
      id: i,
      d: `M-${380 - i * 5 * p} -${189 + i * 6}C-${380 - i * 5 * p} -${189 + i * 6} -${312 - i * 5 * p} ${216 - i * 6} ${152 - i * 5 * p} ${343 - i * 6}C${616 - i * 5 * p} ${470 - i * 6} ${684 - i * 5 * p} ${875 - i * 6} ${684 - i * 5 * p} ${875 - i * 6}`,
      width: 0.6 + i * 0.032,
      opacity: baseOpacity,
      color,
      duration: 20 + (i % 10) * 2,
      delay: (i % 12) * 0.9,
    }
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg
        style={{ width: '100%', height: '100%' }}
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            initial={{ pathLength: 0.3, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: [0, path.opacity, path.opacity * 0.6, 0],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: path.delay,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
