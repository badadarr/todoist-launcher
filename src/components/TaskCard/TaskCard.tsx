import { Play, CheckCircle, ArrowUpCircle, ArrowDownCircle, Plus, Inbox, Target, Trash2, Clock, Lock, XCircle } from 'lucide-react';
import { Task } from '../../store/useTaskStore';

interface TaskCardProps {
  task: Task;
  onMoveToBacklog?: (id: string) => void;
  onStartFocus?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  showBacklogActions?: boolean;
}

export const TaskCard = ({ task, onMoveToBacklog, onStartFocus, onDelete, onMoveToToday, showBacklogActions = false }: TaskCardProps) => {
  const hasNotes = task.notes && task.notes.length > 0;
  const lastNote = hasNotes && task.notes ? task.notes[task.notes.length - 1] : '';

  return (
    <div className={`group ${showBacklogActions ? 'bg-zinc-900/50' : 'bg-zinc-900'} p-4 rounded-xl border border-zinc-800/50 flex flex-col gap-2 hover:bg-zinc-900 transition shadow-lg`}>
      <div className="flex justify-between items-center">
        <span className={`${showBacklogActions ? 'text-sm text-zinc-400' : 'font-medium text-lg'}`}>
          {task.title}
        </span>
        <div className={`flex gap-2 ${showBacklogActions ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}>
          {showBacklogActions ? (
            <>
              {onDelete && (
                <button onClick={() => onDelete(task.id)} title="Hapus tugas" className="text-zinc-600 hover:text-red-500 p-1">
                  <Trash2 size={16} />
                </button>
              )}
              {onMoveToToday && (
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

      {/* Checkpoint Notes */}
      {hasNotes && (
        <div className={`text-xs text-zinc-600 border-t border-zinc-800 pt-2 mt-1 italic ${!showBacklogActions && 'bg-zinc-950/50 p-3 rounded border border-zinc-800/50'}`}>
          {showBacklogActions ? `Last checkpoint: ${lastNote}` : `📌 ${lastNote}`}
        </div>
      )}

      {/* Timer & Start Button (hanya untuk today tasks) */}
      {!showBacklogActions && (
        <div className="flex justify-between mt-4 pt-4 border-t border-zinc-800/50 items-center">
          <div className="flex gap-2 text-xs text-zinc-500">
            <Clock size={14} />
            <span>25 Min</span>
          </div>
          {onStartFocus && (
            <button
              onClick={() => onStartFocus(task.id)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium flex gap-2 transition-transform hover:scale-105"
            >
              <Play size={14} fill="currentColor" /> MULAI
            </button>
          )}
        </div>
      )}
    </div>
  );
};
