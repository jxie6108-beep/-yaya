
import { create } from 'zustand';
import { StoreState, AppPhase, HandGesture } from './types';

export const useStore = create<StoreState>((set) => ({
  phase: 'tree',
  setPhase: (phase: AppPhase) => set({ phase }),
  gesture: 'none',
  setGesture: (gesture: HandGesture) => set({ gesture }),
  handPos: { x: 0, y: 0 },
  setHandPos: (handPos) => set({ handPos }),
  zoom: 1,
  setZoom: (zoom: number) => set({ zoom }),
  wishText: '',
  setWishText: (wishText: string) => set({ wishText }),
  isCameraOn: true,
  setCameraOn: (isCameraOn: boolean) => set({ isCameraOn }),
  wishSent: false,
  setWishSent: (wishSent: boolean) => set({ wishSent }),
}));
