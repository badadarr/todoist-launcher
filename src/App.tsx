import { useState, useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore';
import { Inbox, Target, FileText, FolderOpen } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { TaskInput } from './components/TaskInput';
import { SectionHeader } from './components/SectionHeader';
import { FocusMode } from './components/FocusMode';
import { TaskCard } from './components/TaskCard';
import { AlertDialog } from './components/AlertDialog';
import { ReputationBar } from './components/ReputationBar';
import { AddSubIdeaModal } from './components/AddSubIdeaModal';

// --- KOMPONEN MAIN APP ---
function App() {
  const { 
    tasks, isFocusMode, activeTaskId, lockoutUntil,
    addTask, addSubIdea, moveToToday, moveToBacklog, startFocus, 
    completeTask, stopEarly, deleteTask, 
    alertDialog, clearAlert, exportTaskReport, shareCommitment, showAlert 
  } = useTaskStore();
  const [input, setInput] = useState('');
  const [showSubIdeaModal, setShowSubIdeaModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

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

  // Filter main ideas (always in backlog) and tasks (exclude done tasks)
  const backlogMainIdeas = tasks.filter(t => t.status === 'backlog' && t.isMainIdea);
  const backlogOrphanTasks = tasks.filter(t => t.status === 'backlog' && !t.isMainIdea && !t.parentId);
  const todayTasks = tasks.filter(t => t.status === 'today' && !t.isMainIdea);
  const MAX_TODAY_TASKS = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTask(input);
      setInput('');
    }
  };

  const handleSubmitMainIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      addTask(input, true);
      setInput('');
    }
  };

  const handleAddSubIdea = (parentId: string) => {
    setSelectedParentId(parentId);
    setShowSubIdeaModal(true);
  };

  const handleAddSubIdeaSubmit = (title: string, estimatedMinutes?: number) => {
    if (selectedParentId) {
      addSubIdea(selectedParentId, title, estimatedMinutes);
    }
  };

  const handleViewCompleted = (parentId: string) => {
    const parentTask = tasks.find(t => t.id === parentId);
    const completedSubIdeas = tasks.filter(t => t.parentId === parentId && t.status === 'done');
    
    if (completedSubIdeas.length === 0) {
      showAlert('Belum Ada yang Selesai', 'Belum ada sub-idea yang diselesaikan.');
      return;
    }
    
    const completedList = completedSubIdeas.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    showAlert(
      `Selesai: ${parentTask?.title}`,
      `Sub-ideas yang sudah dikerjakan:\n\n${completedList}`
    );
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
      <ReputationBar />
      {/* Inbox Section */}
      <div className="flex-1 flex flex-col border-r border-zinc-900 p-6 md:p-8 bg-black overflow-hidden mt-12">
        <SectionHeader
          icon={Inbox}
          title="GUDANG IDE"
        />

        <TaskInput
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onSubmit={handleSubmit}
          onSubmitMainIdea={handleSubmitMainIdea}
          placeholder="Apa yang ingin kamu kerjakan?"
        />

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {/* Main Ideas with Sub Ideas */}
          {backlogMainIdeas.map(mainIdea => {
            const subIdeas = tasks.filter(t => t.parentId === mainIdea.id && t.status !== 'done');
            return (
              <div key={mainIdea.id} className="space-y-2">
                <TaskCard
                  task={mainIdea}
                  showBacklogActions={true}
                  onDelete={deleteTask}
                  onMoveToToday={moveToToday}
                  onAddSubIdea={handleAddSubIdea}
                  onViewCompleted={handleViewCompleted}
                />
                {/* Sub Ideas */}
                {subIdeas.map(subIdea => (
                  <div key={subIdea.id} className="ml-6 pl-4 border-l-2 border-zinc-800">
                    <TaskCard
                      task={subIdea}
                      showBacklogActions={true}
                      onDelete={deleteTask}
                      onMoveToToday={moveToToday}
                    />
                  </div>
                ))}
              </div>
            );
          })}
          
          {/* Orphan Tasks (without parent) */}
          {backlogOrphanTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              showBacklogActions={true}
              onDelete={deleteTask}
              onMoveToToday={moveToToday}
            />
          ))}
          
          {backlogMainIdeas.length === 0 && backlogOrphanTasks.length === 0 && (
            <div className="text-center text-zinc-600 py-8 text-sm italic">
              Tidak ada tugas di gudang ide
            </div>
          )}
        </div>
      </div>

      {/* Today Section */}
      <div className="flex-1 flex flex-col p-6 md:p-8 bg-zinc-950 overflow-hidden mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-zinc-500">
            <Target size={20} />
            <h2 className="font-bold text-xs tracking-widest">FOKUS HARI INI</h2>
            <div className="text-xs font-mono text-zinc-500 ml-2">
              {todayTasks.length} / {MAX_TODAY_TASKS}
            </div>
          </div>
          <button
            onClick={() => {
              const report = exportTaskReport();
              navigator.clipboard.writeText(report);
              showAlert('Laporan Tersalin', 'Laporan harian berhasil disalin ke clipboard!');
            }}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5"
          >
            <FileText size={14} />
            Export Report
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {/* Group tasks by parent */}
          {backlogMainIdeas.map(mainIdea => {
            const subIdeasInToday = tasks.filter(t => t.parentId === mainIdea.id && t.status === 'today' && t.status !== 'done');
            if (subIdeasInToday.length === 0) return null;
            
            return (
              <div key={mainIdea.id} className="space-y-2">
                {/* Show parent info */}
                <div className="flex items-center gap-2 text-xs text-zinc-600 px-3">
                  <FolderOpen size={14} className="text-blue-400" />
                  <span>{mainIdea.title}</span>
                </div>
                {/* Sub Ideas in Today */}
                {subIdeasInToday.map(subIdea => (
                  <div key={subIdea.id} className="ml-6 pl-4 border-l-2 border-blue-500/30">
                    <TaskCard
                      task={subIdea}
                      onMoveToBacklog={moveToBacklog}
                      onStartFocus={startFocus}
                    />
                  </div>
                ))}
              </div>
            );
          })}
          
          {/* Tasks without parent */}
          {todayTasks.filter(t => !t.parentId).map(task => (
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

      <AddSubIdeaModal
        isOpen={showSubIdeaModal}
        onClose={() => setShowSubIdeaModal(false)}
        onAdd={handleAddSubIdeaSubmit}
        parentTitle={tasks.find(t => t.id === selectedParentId)?.title || ''}
      />
    </div>
  );
}

export default App;
