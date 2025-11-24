import { useState } from 'react';
import { CheckCircle, XCircle, Lock, Share2 } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Task } from '../../types';
import { FocusTimer } from '../FocusTimer/FocusTimer';
import { ExitModal } from '../ExitModal/ExitModal';
import { useTaskStore } from '../../store/useTaskStore';

interface FocusModeProps {
  activeTask: Task;
  onComplete: (id: string) => void;
  onExit: (reason: string) => void;
}

export const FocusMode = ({ activeTask, onComplete, onExit }: FocusModeProps) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitReason, setExitReason] = useState('');
  const { shareCommitment } = useTaskStore();

  // Fullscreen effect
  useState(() => {
    const appWindow = getCurrentWindow();
    appWindow.setFullscreen(true);
    return () => {
      appWindow.setFullscreen(false);
    };
  });

  const handleExitConfirm = () => {
    if (exitReason.length < 5) {
      alert("Tulis alasan yang jelas minimal 5 karakter!");
      return;
    }
    onExit(exitReason);
    setShowExitModal(false);
    setExitReason('');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-900 p-10 relative">
      {/* Lock Indicator */}
      <div className="absolute top-8 flex items-center gap-2 text-red-500 animate-pulse">
        <Lock size={16} />
        <span className="text-xs font-bold tracking-[0.3em] uppercase">LOCKED MODE</span>
      </div>

      <FocusTimer />

      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 max-w-4xl leading-tight">
        {activeTask.title}
      </h1>

      <p className="text-zinc-400 mb-8 text-sm italic text-center max-w-2xl">
        "Fokus pada satu hal ini sampai selesai. Jika harus berhenti, catat progress yang sudah dicapai."
      </p>

      <button
        onClick={() => shareCommitment(activeTask.title)}
        className="mb-8 px-4 py-2 text-xs text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-2 border border-zinc-200"
      >
        <Share2 size={14} />
        Share Commitment
      </button>

      <div className="flex gap-6 flex-wrap justify-center">
        <button
          onClick={() => setShowExitModal(true)}
          className="px-6 py-4 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-all flex items-center gap-2 border border-zinc-200"
        >
          <XCircle size={18} />
          Pause / Switch Task
        </button>

        <button
          onClick={() => onComplete(activeTask.id)}
          className="px-12 py-4 bg-black text-white rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition shadow-2xl"
        >
          <CheckCircle /> SELESAI
        </button>
      </div>

      <ExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
        reason={exitReason}
        setReason={setExitReason}
      />
    </div>
  );
};
