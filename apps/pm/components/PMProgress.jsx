'use client';

export default function PMProgress({ value = 0, label = true, size = 'md', className = '' }) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`min-w-[120px] ${className}`}>
      <div className={`overflow-hidden rounded-full bg-gray-200 ${height}`}>
        <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      {label ? <div className="mt-2 text-xs font-medium text-gray-600">{progress}%</div> : null}
    </div>
  );
}
