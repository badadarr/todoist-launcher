import { Plus, FolderPlus } from 'lucide-react';

interface TaskInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSubmitMainIdea?: (e: React.FormEvent) => void;
  placeholder?: string;
}

export const TaskInput = ({ value, onChange, onSubmit, onSubmitMainIdea, placeholder = "Apa yang ingin kamu kerjakan?" }: TaskInputProps) => (
  <form onSubmit={onSubmit} className="mb-6 relative">
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-5 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
      {onSubmitMainIdea && (
        <button
          type="button"
          onClick={onSubmitMainIdea}
          className="text-zinc-600 hover:text-blue-400 transition-colors"
          aria-label="Add main idea"
          title="Tambah Ide Utama"
        >
          <FolderPlus size={18} />
        </button>
      )}
      <button
        type="submit"
        className="text-zinc-500 hover:text-white transition-colors"
        aria-label="Add task"
      >
        <Plus size={20} />
      </button>
    </div>
  </form>
);
