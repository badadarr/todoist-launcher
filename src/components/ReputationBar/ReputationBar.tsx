import { useTaskStore } from '../../store/useTaskStore';
import { Star, Flame } from 'lucide-react';

export const ReputationBar = () => {
  const { reputationScore, currentStreak } = useTaskStore();
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-zinc-800">
        <div 
          className={`h-full transition-all duration-500 ${
            reputationScore > 80 ? 'bg-green-500' :
            reputationScore > 60 ? 'bg-yellow-500' :
            reputationScore > 40 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${reputationScore}%` }}
        />
      </div>
      <div className="bg-zinc-900/95 backdrop-blur-sm px-4 py-2 flex justify-between items-center text-xs border-b border-zinc-800">
        <span className="text-zinc-400 flex items-center gap-1.5">
          <Star size={14} className={`${
            reputationScore > 80 ? 'text-green-400' :
            reputationScore > 60 ? 'text-yellow-400' :
            reputationScore > 40 ? 'text-orange-400' : 'text-red-400'
          }`} />
          Reputasi: <span className={`font-bold ${
            reputationScore > 80 ? 'text-green-400' :
            reputationScore > 60 ? 'text-yellow-400' :
            reputationScore > 40 ? 'text-orange-400' : 'text-red-400'
          }`}>{reputationScore}/100</span>
        </span>
        <span className="text-zinc-400 flex items-center gap-1.5">
          <Flame size={14} className="text-orange-400" />
          Streak: <span className="font-bold text-orange-400">{currentStreak} hari</span>
        </span>
      </div>
    </div>
  );
};