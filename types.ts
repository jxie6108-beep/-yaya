
export type AppPhase = 'tree' | 'blooming' | 'nebula' | 'collapsing';

export type HandGesture = 'none' | 'open' | 'fist';

export interface PhotoData {
  url: string;
  isPortrait: boolean;
}

export interface StoreState {
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
  gesture: HandGesture;
  setGesture: (gesture: HandGesture) => void;
  handPos: { x: number; y: number };
  setHandPos: (pos: { x: number; y: number }) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  wishText: string;
  setWishText: (text: string) => void;
  isCameraOn: boolean;
  setCameraOn: (on: boolean) => void;
  wishSent: boolean;
  setWishSent: (sent: boolean) => void;
}
