/**
 * store/ui-store.ts — Zustand store for pure UI state
 *
 * Manages: modals, celebration queue, 3D visuals toggle, and other
 * ephemeral UI state that doesn't belong in server state (TanStack Query).
 */
import { create } from "zustand";

export interface CelebrationItem {
  habitId: string;
  habitName: string;
  milestoneValue: number;
  color: string;
}

interface UIStore {
  // Modals
  isCreateHabitOpen: boolean;
  editingHabitId: string | null;
  setCreateHabitOpen: (open: boolean) => void;
  setEditingHabitId: (id: string | null) => void;

  // Celebration queue (one milestone fires at a time)
  celebrationQueue: CelebrationItem[];
  enqueueCelebration: (item: CelebrationItem) => void;
  dequeueCelebration: () => void;

  // 3D orb toggle (also persisted in profiles.visuals_3d_enabled via Settings)
  orb3DEnabled: boolean;
  setOrb3DEnabled: (enabled: boolean) => void;

  // Focus timer
  activeFocusHabitId: string | null;
  setActiveFocusHabitId: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Modals
  isCreateHabitOpen: false,
  editingHabitId: null,
  setCreateHabitOpen: (open) => set({ isCreateHabitOpen: open }),
  setEditingHabitId: (id) => set({ editingHabitId: id }),

  // Celebrations
  celebrationQueue: [],
  enqueueCelebration: (item) =>
    set((state) => ({ celebrationQueue: [...state.celebrationQueue, item] })),
  dequeueCelebration: () =>
    set((state) => ({ celebrationQueue: state.celebrationQueue.slice(1) })),

  // 3D orb
  orb3DEnabled: true,
  setOrb3DEnabled: (enabled) => set({ orb3DEnabled: enabled }),

  // Focus timer
  activeFocusHabitId: null,
  setActiveFocusHabitId: (id) => set({ activeFocusHabitId: id }),
}));
