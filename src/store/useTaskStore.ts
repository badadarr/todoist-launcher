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

  addTask: (title: string) => void;
  moveToToday: (id: string) => void;
  moveToBacklog: (id: string) => void;
  startFocus: (id: string) => void;
  completeTask: (id: string) => void;

  // Fungsi mencatat alasan berhenti
  stopEarly: (reason: string) => void;
  clearAlert: () => void;

  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isFocusMode: false,
      activeTaskId: null,
      alertDialog: null,

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
          set({ alertDialog: { title: "✋ STOP!", content: "Maksimal 3 Prioritas hari ini." } });
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

      startFocus: (id) => set({ isFocusMode: true, activeTaskId: id }),

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
        set({ alertDialog: { title: "📝 Progress tercatat", content: progressList } });

        set({
          isFocusMode: false,
          activeTaskId: null,
          tasks: tasks.map((t) =>
            t.id === activeTaskId
              ? {
                  ...t,
                  notes: updatedNotes,
                }
              : t
          ),
        });
      },

      completeTask: (id) =>
        set((state) => ({
          isFocusMode: false,
          activeTaskId: null,
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: "done" } : t
          ),
        })),

      clearAlert: () => set({ alertDialog: null }),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
    }),
    { name: "focus-app-storage-v3" } // Ganti nama v3 agar data lama ter-reset bersih
  )
);
