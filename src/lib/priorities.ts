export interface TaskForPriority {
  id: number;
  title: string;
  isUrgent: boolean;
  isImportant: boolean;
  isMIT: boolean;
  effortMins: number | null;
  dueDate: string | null;
  scheduledFor: string | null;
  status: string;
}

export function eisenhowerSort(tasks: TaskForPriority[]): TaskForPriority[] {
  return [...tasks].sort((a, b) => {
    const quadrantA = getQuadrant(a);
    const quadrantB = getQuadrant(b);
    if (quadrantA !== quadrantB) return quadrantA - quadrantB;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

function getQuadrant(task: TaskForPriority): number {
  if (task.isImportant && task.isUrgent) return 1;
  if (task.isImportant && !task.isUrgent) return 2;
  if (!task.isImportant && task.isUrgent) return 3;
  return 4;
}

export function selectMITs(
  tasks: TaskForPriority[],
  max: number = 3
): TaskForPriority[] {
  const sorted = eisenhowerSort(tasks.filter((t) => t.status === "todo"));
  return sorted.slice(0, max);
}
