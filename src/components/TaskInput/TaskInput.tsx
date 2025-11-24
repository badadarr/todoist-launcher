import { Plus } from 'lucide-react';

interface TaskInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TaskInput = ({ value, onChange, onSubmit }: TaskInputProps) => (
  <form onSubmit={onSubmit} className="mb-6 relative">
    <input
      value={value}
      onChange={onChange}
      placeholder="Apa yang ingin kamu kerjakan?"
      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
    />
    <button
      type="submit"
      className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition-colors"
      aria-label="Add task"
    >
      <Plus size={20} />
    </button>
  </form>
);
