import { create } from "zustand"

export const useDrilldownStore = create((set) => ({
  open: false,
  column: "",
  value: "",

  openDrill: (column, value) =>
    set({ open: true, column, value }),

  close: () =>
    set({ open: false })
}))
