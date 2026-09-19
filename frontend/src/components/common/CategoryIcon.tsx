import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', color }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIcon = (Icons as any)[name] || Icons.Tag;

  return (
    <div
      className="inline-flex items-center justify-center rounded-lg p-2"
      style={{ backgroundColor: color ? `${color}15` : '#f1f5f9' }}
    >
      <LucideIcon className={className} style={{ color: color || '#64748b' }} />
    </div>
  );
};
