export interface Task {
  id: string;
  title: string;
  status: "backlog" | "today" | "done";
  createdAt: number;
  notes?: string[];
}
