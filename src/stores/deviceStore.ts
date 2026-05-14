import { create } from "zustand";
import { api } from "../api/client";
import type { Device } from "../types";

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  fetchDevices: () => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [],
  isLoading: false,
  fetchDevices: async () => {
    set({ isLoading: true });
    try {
      const devices = await api.getDevices();
      set({ devices, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
