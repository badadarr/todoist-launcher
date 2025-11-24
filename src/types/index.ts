export interface Task {
  id: string;
  title: string;
  status: "backlog" | "today" | "done";
  createdAt: number;
  notes?: string[];
  parentId?: string | null;
  isMainIdea?: boolean;
  estimatedMinutes?: number;
  actualMinutes?: number;
  deadline?: number;
  completedAt?: number;
}
