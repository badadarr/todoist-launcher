import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  count?: number;
  maxCount?: number;
}

export const SectionHeader = ({ icon: Icon, title, count, maxCount }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3 text-zinc-500">
      <Icon size={20} />
      <h2 className="font-bold text-xs tracking-widest">{title}</h2>
    </div>
    {count !== undefined && (
      <div className="text-xs font-mono text-zinc-500">
        {count} {maxCount ? `/ ${maxCount}` : ''}
      </div>
    )}
  </div>
);
