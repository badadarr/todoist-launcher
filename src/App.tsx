import { useState, useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { Inbox, Target } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { TaskInput } from './components/TaskInput';
import { SectionHeader } from './components/SectionHeader';
import { FocusMode } from './components/FocusMode';
import { TaskCard } from './components/TaskCard';
import { AlertDialog } from './components/AlertDialog';

// --- KOMPONEN MAIN APP ---
function App() {
  const { tasks, isFocusMode, activeTaskId, addTask, moveToToday, moveToBacklog, startFocus, completeTask, stopEarly, deleteTask, alertDialog, clearAlert } = useTaskStore();
  const [input, setInput] = useState('');

  // Fullscreen effect
  useEffect(() => {
    const appWindow = getCurrentWindow();
    if (isFocusMode) {
      appWindow.setFullscreen(true);
    } else {
      appWindow.setFullscreen(false);
    }
  }, [isFocusMode]);

  // Focus Mode
  if (isFocusMode) {
    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return null;

    return (
      <FocusMode
        activeTask={activeTask}
        onComplete={completeTask}
        onExit={stopEarly}
      />
    );
  }

  const backlogTasks = tasks.filter(t => t.status === 'backlog');
  const todayTasks = tasks.filter(t => t.status === 'today');
  const MAX_TODAY_TASKS = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTask(input);
      setInput('');
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
      {/* Inbox Section */}
      <div className="flex-1 flex flex-col border-r border-zinc-900 p-6 md:p-8 bg-black overflow-hidden">
        <SectionHeader
          icon={Inbox}
          title="GUDANG IDE"
        />

        <TaskInput
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onSubmit={handleSubmit}
        />

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {backlogTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              showBacklogActions={true}
              onDelete={deleteTask}
              onMoveToToday={moveToToday}
            />
          ))}
          {backlogTasks.length === 0 && (
            <div className="text-center text-zinc-600 py-8 text-sm italic">
              Tidak ada tugas di gudang ide
            </div>
          )}
        </div>
      </div>

      {/* Today Section */}
      <div className="flex-1 flex flex-col p-6 md:p-8 bg-zinc-950 overflow-hidden">
        <SectionHeader
          icon={Target}
          title="FOKUS HARI INI"
          count={todayTasks.length}
          maxCount={MAX_TODAY_TASKS}
        />

        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {todayTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onMoveToBacklog={moveToBacklog}
              onStartFocus={startFocus}
            />
          ))}

          {todayTasks.length === 0 && (
            <div className="border-2 border-dashed border-zinc-900 h-40 rounded-2xl flex flex-col items-center justify-center text-zinc-700 text-sm gap-2">
              <Target size={24} />
              <span>Pilih tugas dari Gudang Ide</span>
            </div>
          )}

          {todayTasks.length < MAX_TODAY_TASKS && todayTasks.length > 0 && (
            <div className="text-center text-zinc-600 py-4 text-xs italic">
              Kamu bisa tambah {MAX_TODAY_TASKS - todayTasks.length} tugas lagi
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog
        isOpen={!!alertDialog}
        onClose={clearAlert}
        title={alertDialog?.title || ''}
        content={alertDialog?.content || ''}
      />
    </div>
  );
}

export default App;
