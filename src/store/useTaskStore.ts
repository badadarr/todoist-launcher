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

  addTask: (title: string) => void;
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

      addTask: (title) =>
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              title,
              status: "backlog",
              createdAt: Date.now(),
              notes: [], // Inisialisasi array kosong
            },
            ...state.tasks,
          ],
        })),

      moveToToday: (id) => {
        const { tasks } = get();
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
        set((state) => ({
          isFocusMode: false,
          activeTaskId: null,
          reputationScore: Math.min(100, state.reputationScore + 10),
          lastActiveDate: Date.now(),
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "done" } : t
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

      clearAlert: () => set({ alertDialog: null }),

      showAlert: (title: string, content: string) => set({ alertDialog: { title, content } }),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
    }),
    { name: "focus-app-storage-v4" } // v4: Added consequence system, streak, reputation
  )
);
