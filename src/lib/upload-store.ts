import { create } from "zustand";

/**
 * Transfers the details of an in-progress upload from /upload to
 * /upload/processing without round-tripping through the URL or a backend.
 * TODO: replace with a real upload/ingestion API once one exists.
 */
interface PendingUpload {
  fileName: string;
  fileSizeBytes: number;
  projectName: string;
  autoGenerateSteps: boolean;
}

interface UploadFlowState {
  pendingUpload: PendingUpload | null;
  startUpload: (upload: PendingUpload) => void;
  clearUpload: () => void;
}

export const useUploadFlowStore = create<UploadFlowState>((set) => ({
  pendingUpload: null,
  startUpload: (upload) => set({ pendingUpload: upload }),
  clearUpload: () => set({ pendingUpload: null }),
}));
