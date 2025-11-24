import { useState } from 'react';
import { X, Plus, FolderOpen } from 'lucide-react';

interface AddSubIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, estimatedMinutes?: number) => void;
  parentTitle: string;
}

export const AddSubIdeaModal = ({ isOpen, onClose, onAdd, parentTitle }: AddSubIdeaModalProps) => {
  const [input, setInput] = useState('');
  const [estimation, setEstimation] = useState<number>(25);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim(), estimation);
      setInput('');
      setEstimation(25);
      onClose();
    }
  };

  const handleClose = () => {
    setInput('');
    setEstimation(25);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Plus size={20} className="text-green-500" />
            <h3 className="text-lg font-semibold text-zinc-200">Tambah Sub Ide</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400 bg-zinc-800/50 p-3 rounded-lg">
          <FolderOpen size={16} className="text-blue-400" />
          <span>{parentTitle}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nama sub-idea..."
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-3"
          />
          
          <div className="mb-4">
            <label className="block text-xs text-zinc-400 mb-2">Estimasi Waktu (menit)</label>
            <div className="flex gap-2">
              {[25, 50, 75, 100].map(min => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setEstimation(min)}
                  className={`flex-1 py-2 rounded-lg text-sm transition ${
                    estimation === min 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {min}m
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};