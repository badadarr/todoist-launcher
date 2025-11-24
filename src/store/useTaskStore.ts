import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Task } from "../types";

interface AlertDialog {
  title: string;
  content: string;
}

interface TaskState {
  tasks: Task[];
  isFocusMode: boolean;
  activeTaskId: string | null;
  alertDialog: AlertDialog | null;
  failedAttempts: number;
  lastFailedDate: number | null;
  lockoutUntil: number | null;
  currentStreak: number;
  longestStreak: number;
  reputationScore: number;
  lastActiveDate: number;

  addTask: (title: string, isMainIdea?: boolean, parentId?: string) => void;
  addSubIdea: (parentId: string, title: string, estimatedMinutes?: number) => void;
  getSubIdeas: (parentId: string) => Task[];
  getProgress: (parentId: string) => { completed: number; total: number; percentage: number };
  moveToToday: (id: string) => void;
  moveToBacklog: (id: string) => void;
  startFocus: (id: string) => void;
  completeTask: (id: string) => void;
  stopEarly: (reason: string) => void;
  clearAlert: () => void;
  showAlert: (title: string, content: string) => void;
  deleteTask: (id: string) => void;
  applyConsequence: () => void;
  updateStreak: () => void;
  exportTaskReport: () => string;
  shareCommitment: (taskTitle: string) => void;
  getAnalytics: () => {
    totalCompleted: number;
    totalEstimated: number;
    totalActual: number;
    accuracy: number;
    avgFocusTime: number;
  };
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isFocusMode: false,
      activeTaskId: null,
      alertDialog: null,
      failedAttempts: 0,
      lastFailedDate: null,
      lockoutUntil: null,
      currentStreak: 0,
      longestStreak: 0,
      reputationScore: 100,
      lastActiveDate: Date.now(),

      addTask: (title, isMainIdea = false, parentId = undefined) =>
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              title,
              status: "backlog",
              createdAt: Date.now(),
              notes: [],
              parentId,
              isMainIdea,
            },
            ...state.tasks,
          ],
        })),

      addSubIdea: (parentId, title, estimatedMinutes = 25) => {
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              title,
              status: "backlog",
              createdAt: Date.now(),
              notes: [],
              parentId,
              isMainIdea: false,
              estimatedMinutes,
            },
            ...state.tasks,
          ],
        }));
      },

      getSubIdeas: (parentId) => {
        return get().tasks.filter(t => t.parentId === parentId && t.status !== 'done');
      },

      getProgress: (parentId) => {
        const subIdeas = get().tasks.filter(t => t.parentId === parentId);
        const total = subIdeas.length;
        const completed = subIdeas.filter(t => t.status === 'done').length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
      },

      moveToToday: (id) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === id);
        
        // Prevent main ideas from being moved to Today
        if (task?.isMainIdea) {
          set({ alertDialog: { title: "Tidak Bisa Dipindahkan", content: "Ide Utama hanya sebagai penampung. Pindahkan sub-idea nya ke Fokus Hari Ini." } });
          return;
        }
        
        const todayCount = tasks.filter((t) => t.status === "today").length;

        if (todayCount >= 3) {
          set({ alertDialog: { title: "STOP!", content: "Maksimal 3 Prioritas hari ini." } });
          return;
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "today" } : t
          ),
        }));
      },

      moveToBacklog: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "backlog" } : t
          ),
        })),

      startFocus: (id) => {
        const { lockoutUntil } = get();
        if (lockoutUntil && Date.now() < lockoutUntil) {
          const remainingTime = new Date(lockoutUntil).toLocaleTimeString('id-ID');
          set({ alertDialog: { title: "APLIKASI TERKUNCI", content: `Aplikasi dikunci sampai ${remainingTime}` } });
          return;
        }
        set({ isFocusMode: true, activeTaskId: id });
      },

      // LOGIKA PENTING: Simpan alasan ke array notes
      stopEarly: (reason) => {
        const { activeTaskId, tasks } = get();
        if (!activeTaskId) return;

        const currentTask = tasks.find(t => t.id === activeTaskId);
        const timestamp = new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const newNote = `${reason} (${timestamp})`;
        const updatedNotes = [...(currentTask?.notes || []), newNote];

        // Tampilkan progress yang sudah tercatat
        const progressList = updatedNotes.map((note, i) => `${i + 1}. ${note}`).join('\n');
        
        // Increment failed attempts
        const today = new Date().toDateString();
        const lastFailed = get().lastFailedDate ? new Date(get().lastFailedDate!).toDateString() : null;
        const newFailedAttempts = lastFailed === today ? get().failedAttempts + 1 : 1;

        set({
          isFocusMode: false,
          activeTaskId: null,
          failedAttempts: newFailedAttempts,
          lastFailedDate: Date.now(),
          reputationScore: Math.max(0, get().reputationScore - 5),
          alertDialog: { title: "Progress tercatat", content: progressList },
          tasks: tasks.map((t) =>
            t.id === activeTaskId
              ? {
                  ...t,
                  notes: updatedNotes,
                }
              : t
          ),
        });
        
        // Apply consequence after state update
        setTimeout(() => get().applyConsequence(), 500);
      },

      completeTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        const actualMinutes = task?.estimatedMinutes || 25;
        
        set((state) => ({
          isFocusMode: false,
          activeTaskId: null,
          reputationScore: Math.min(100, state.reputationScore + 10),
          lastActiveDate: Date.now(),
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "done", completedAt: Date.now(), actualMinutes } : t
          ),
        }));
        get().updateStreak();
      },

      applyConsequence: () => {
        const { failedAttempts } = get();
        const now = Date.now();
        
        if (failedAttempts >= 3) {
          set({ 
            lockoutUntil: now + (60 * 60 * 1000),
            alertDialog: {
              title: "APLIKASI TERKUNCI",
              content: `Kamu telah gagal fokus ${failedAttempts} kali. Aplikasi dikunci sampai ${new Date(now + (60 * 60 * 1000)).toLocaleTimeString('id-ID')}`
            }
          });
        } else if (failedAttempts >= 2) {
          set({
            alertDialog: {
              title: "JATAH TASK BERKURANG",
              content: `Karena kamu sudah ${failedAttempts}x gagal fokus, kamu perlu lebih fokus!`
            }
          });
        }
      },

      updateStreak: () => {
        const { lastActiveDate, currentStreak, longestStreak } = get();
        const today = new Date().toDateString();
        const lastActive = lastActiveDate ? new Date(lastActiveDate).toDateString() : null;
        
        if (lastActive === today) return;
        
        const yesterday = new Date(Date.now() - 24*60*60*1000).toDateString();
        
        if (lastActive === yesterday) {
          const newStreak = currentStreak + 1;
          set({
            currentStreak: newStreak,
            longestStreak: Math.max(longestStreak, newStreak),
            reputationScore: Math.min(100, get().reputationScore + 5)
          });
        } else {
          set({
            currentStreak: 0,
            reputationScore: Math.max(0, get().reputationScore - 10)
          });
        }
      },

      exportTaskReport: () => {
        const { tasks, failedAttempts, currentStreak, reputationScore } = get();
        const todayTasks = tasks.filter(t => t.status === 'today' || t.status === 'done');
        
        return `LAPORAN HARIAN TODOIST
${new Date().toLocaleDateString('id-ID')}

Task Selesai: ${todayTasks.filter(t => t.status === 'done').length}
Task Gagal: ${todayTasks.filter(t => t.notes && t.notes.length > 0).length}
Streak Saat Ini: ${currentStreak} hari
Reputasi: ${reputationScore}/100
Gagal Fokus: ${failedAttempts}x hari ini

Detail Task:
${todayTasks.map(t => `- ${t.title}: ${t.status === 'done' ? '[DONE]' : '[FAIL]'} ${t.notes && t.notes.length > 0 ? '(gagal fokus)' : ''}`).join('\n')}`;
      },

      shareCommitment: (taskTitle: string) => {
        const text = `Saya sedang fokus mengerjakan: "${taskTitle}" selama 25 menit. #FocusMode #NoMultitasking`;
        
        if (navigator.share) {
          navigator.share({
            title: 'Focus Mode Commitment',
            text: text,
          });
        } else {
          navigator.clipboard.writeText(text);
          set({ alertDialog: { title: "Tersalin", content: "Commitment copied! Share ke social media Anda." } });
        }
      },

      getAnalytics: () => {
        const completedTasks = get().tasks.filter(t => t.status === 'done' && !t.isMainIdea);
        const totalCompleted = completedTasks.length;
        const totalEstimated = completedTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
        const totalActual = completedTasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
        const accuracy = totalEstimated > 0 ? Math.round((1 - Math.abs(totalActual - totalEstimated) / totalEstimated) * 100) : 100;
        const avgFocusTime = totalCompleted > 0 ? Math.round(totalActual / totalCompleted) : 0;
        
        return { totalCompleted, totalEstimated, totalActual, accuracy, avgFocusTime };
      },

      clearAlert: () => set({ alertDialog: null }),

      showAlert: (title: string, content: string) => set({ alertDialog: { title, content } }),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
    }),
    { name: "focus-app-storage-v6" } // v6: Added estimation, analytics, and time tracking
  )
);
export type { Task };

