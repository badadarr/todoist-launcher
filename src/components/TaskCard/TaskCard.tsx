import { Play, CheckCircle, ArrowUpCircle, ArrowDownCircle, Plus, Inbox, Target, Trash2, Clock, Lock, XCircle, FolderOpen, ChevronRight, Eye } from 'lucide-react';
import { Task } from '../../store/useTaskStore';
import { useTaskStore } from '../../store/useTaskStore';

interface TaskCardProps {
  task: Task;
  onMoveToBacklog?: (id: string) => void;
  onStartFocus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  onAddSubIdea?: (parentId: string) => void;
  onViewCompleted?: (parentId: string) => void;
  showBacklogActions?: boolean;
}

export const TaskCard = ({ task, onMoveToBacklog, onStartFocus, onDelete, onMoveToToday, onAddSubIdea, onViewCompleted, showBacklogActions = false }: TaskCardProps) => {
  const hasNotes = task.notes && task.notes.length > 0;
  const lastNote = hasNotes && task.notes ? task.notes[task.notes.length - 1] : '';
  const { getProgress, getSubIdeas, tasks } = useTaskStore();
  const progress = task.isMainIdea ? getProgress(task.id) : null;
  const subIdeas = task.isMainIdea ? getSubIdeas(task.id) : [];
  const completedCount = task.isMainIdea ? tasks.filter(t => t.parentId === task.id && t.status === 'done').length : 0;

  const handleDoubleClick = () => {
    if (task.isMainIdea && onAddSubIdea) {
      onAddSubIdea(task.id);
    } else if (!task.isMainIdea && showBacklogActions && onMoveToToday) {
      onMoveToToday(task.id);
    } else if (!task.isMainIdea && !showBacklogActions && onMoveToBacklog) {
      onMoveToBacklog(task.id);
    }
  };

  return (
    <div 
      className={`group ${showBacklogActions ? 'bg-zinc-900/50' : 'bg-zinc-900'} p-4 rounded-xl border ${task.isMainIdea ? 'border-blue-500/30' : 'border-zinc-800/50'} flex flex-col gap-2 hover:bg-zinc-900 transition shadow-lg ${!task.isMainIdea || task.isMainIdea ? 'cursor-pointer' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-1">
          {task.isMainIdea && <FolderOpen size={18} className="text-blue-400 flex-shrink-0" />}
          <span className={`${showBacklogActions ? 'text-sm text-zinc-400' : 'font-medium text-lg'} ${task.parentId ? 'text-zinc-300' : ''}`}>
            {task.title}
          </span>
        </div>
        <div className={`flex gap-2 ${showBacklogActions ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}>
          {showBacklogActions ? (
            <>
              {onDelete && (
                <button onClick={() => onDelete(task.id)} title="Hapus tugas" className="text-zinc-600 hover:text-red-500 p-1">
                  <Trash2 size={16} />
                </button>
              )}
              {task.isMainIdea && onViewCompleted && completedCount > 0 && (
                <button onClick={() => onViewCompleted(task.id)} title="Lihat yang Selesai" className="text-zinc-600 hover:text-blue-400 p-1">
                  <Eye size={16} />
                </button>
              )}
              {task.isMainIdea && onAddSubIdea && (
                <button onClick={() => onAddSubIdea(task.id)} title="Tambah Sub Ide" className="text-zinc-600 hover:text-green-400 p-1">
                  <Plus size={16} />
                </button>
              )}
              {!task.isMainIdea && onMoveToToday && (
                <button onClick={() => onMoveToToday(task.id)} title="Pindahkan ke Hari Ini" className="text-zinc-500 hover:text-blue-400 p-1">
                  <ArrowUpCircle size={20} />
                </button>
              )}
            </>
          ) : (
            onMoveToBacklog && (
              <button onClick={() => onMoveToBacklog(task.id)} title="Pindahkan ke Backlog" className="text-zinc-600 hover:text-white">
                <ArrowDownCircle size={18} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Double-click hint */}
      {!task.isMainIdea && (
        <div className="text-xs text-zinc-600 italic mt-1">
          {showBacklogActions ? 'Double-click untuk pindah ke Fokus Hari Ini' : 'Double-click untuk kembali ke Gudang Ide'}
        </div>
      )}
      {task.isMainIdea && showBacklogActions && (
        <div className="text-xs text-zinc-600 italic mt-1">
          Double-click untuk tambah sub-idea
        </div>
      )}

      {/* Progress Bar for Main Ideas */}
      {task.isMainIdea && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-zinc-500">
              {progress && progress.total > 0 ? (
                <>{progress.completed} / {progress.total} selesai</>
              ) : (
                <span className="text-zinc-600">Belum ada sub-idea</span>
              )}
            </span>
            {progress && progress.total > 0 && (
              <span className="font-bold text-blue-400">{progress.percentage}%</span>
            )}
          </div>
          {progress && progress.total > 0 && (
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Checkpoint Notes */}
      {hasNotes && !task.isMainIdea && (
        <div className={`text-xs text-zinc-600 border-t border-zinc-800 pt-2 mt-2 italic ${!showBacklogActions && 'bg-zinc-950/50 p-3 rounded border border-zinc-800/50'}`}>
          {showBacklogActions ? `Last checkpoint: ${lastNote}` : `📌 ${lastNote}`}
        </div>
      )}

      {/* Timer & Start Button (hanya untuk today tasks dan bukan main idea) */}
      {!showBacklogActions && !task.isMainIdea && (
        <div className="flex justify-between mt-4 pt-4 border-t border-zinc-800/50 items-center">
          <div className="flex gap-2 text-xs text-zinc-500">
            <Clock size={14} />
            <span>{task.estimatedMinutes || 25} Min</span>
          </div>
          {onStartFocus && (
            <button
              onClick={() => onStartFocus(task.id)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Play size={14} fill="currentColor" /> MULAI
            </button>
          )}
        </div>
      )}
    </div>
  );
};
