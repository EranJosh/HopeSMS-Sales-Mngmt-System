export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div
        className="rounded-full animate-spin mb-3"
        style={{ width: 32, height: 32, borderWidth: 3, borderStyle: 'solid', borderColor: '#00ff88', borderTopColor: 'transparent', boxShadow: '0 0 12px rgba(0,255,136,0.3)' }}
      />
      <p className="text-sm" style={{ color: '#2a5a7e' }}>{message}</p>
    </div>
  )
}
