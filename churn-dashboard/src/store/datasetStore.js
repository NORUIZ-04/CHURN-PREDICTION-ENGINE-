import { create } from "zustand";

export const useDatasetStore = create((set) => ({
  datasetPath: null,

  setDatasetPath: (path) => {
    console.log("DATASET SET:", path);   // 👈 debug
    set({ datasetPath: path });
  }
}));
