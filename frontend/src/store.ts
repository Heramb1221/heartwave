/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

// ========================
// ROOM STORE
// ========================
export const useRoomStore = create((set) => ({
  currentRoom: null,
  hostId: null,
  roomCode: "",
  users: [],

  setCurrentRoom: (room: any) => set({ currentRoom: room }),
  setHostId: (id: any) => set({ hostId: id }),
  setRoomCode: (code: any) => set({ roomCode: code }),
  setUsers: (users: any) => set({ users }),
  resetRoom: () =>
    set({ currentRoom: null, hostId: null, roomCode: "", users: [] }),
}));

// ========================
// PLAYER STORE
// ========================
export const usePlayerStore = create((set) => ({
  videoId: "dQw4w9WgXcQ",
  currentTime: 0,
  isPlaying: false,
  player: null,
  duration: 0,

  setVideoId: (id: any) => set({ videoId: id }),
  setCurrentTime: (time: any) => set({ currentTime: time }),
  setIsPlaying: (playing: any) => set({ isPlaying: playing }),
  setPlayer: (player: any) => set({ player }),
  setDuration: (duration: any) => set({ duration }),
  resetPlayer: () =>
    set({
      videoId: "dQw4w9WgXcQ",
      currentTime: 0,
      isPlaying: false,
      player: null,
      duration: 0,
    }),
}));

// ========================
// QUEUE STORE
// ========================
export const useQueueStore = create((set) => ({
  queue: [],
  currentIndex: 0,

  setQueue: (queue: any) => set({ queue }),
  addToQueue: (video: any) =>
    set((state: { queue: any; }) => ({ queue: [...state.queue, video] })),
  removeFromQueue: (videoId: any) =>
    set((state: { queue: any[]; }) => ({
      queue: state.queue.filter((v: { videoId: any; }) => v.videoId !== videoId),
    })),
  setCurrentIndex: (index: any) => set({ currentIndex: index }),
  resetQueue: () => set({ queue: [], currentIndex: 0 }),
}));

// ========================
// CHAT STORE
// ========================
export const useChatStore = create((set) => ({
  messages: [],
  chatInput: "",

  setMessages: (messages: any) => set({ messages }),
  addMessage: (message: any) =>
    set((state: { messages: any; }) => ({ messages: [...state.messages, message] })),
  setChatInput: (input: any) => set({ chatInput: input }),
  resetChat: () => set({ messages: [], chatInput: "" }),
}));

// ========================
// MEDIA STORE
// ========================
export const useMediaStore = create((set) => ({
  localStream: null,
  remoteStreams: {}, // { socketId: MediaStream }
  isCameraOn: false,
  isMicOn: false,

  setLocalStream: (stream: any) => set({ localStream: stream }),
  addRemoteStream: (socketId: any, stream: any) =>
    set((state: { remoteStreams: any; }) => ({
      remoteStreams: { ...state.remoteStreams, [socketId]: stream },
    })),
  removeRemoteStream: (socketId: string) =>
    set((state: { remoteStreams: { [s: string]: unknown; } | ArrayLike<unknown>; }) => ({
      remoteStreams: Object.fromEntries(
        Object.entries(state.remoteStreams).filter(([id]) => id !== socketId)
      ),
    })),
  setIsCameraOn: (on: any) => set({ isCameraOn: on }),
  setIsMicOn: (on: any) => set({ isMicOn: on }),
  resetMedia: () =>
    set({
      localStream: null,
      remoteStreams: {},
      isCameraOn: false,
      isMicOn: false,
    }),
}));

// ========================
// AUTH STORE
// ========================
export const useAuthStore = create((set) => ({
  userData: null,
  isLoading: true,

  setUserData: (data: any) => set({ userData: data }),
  setIsLoading: (loading: any) => set({ isLoading: loading }),
  resetAuth: () => set({ userData: null, isLoading: true }),
}));

// ========================
// UI STORE
// ========================
export const useUIStore = create((set) => ({
  showVideoGrid: false,
  showQueue: true,
  showChat: true,
  showSearch: false,
  isSidebarOpen: true,
  theme: "dark",

  setShowVideoGrid: (show: any) => set({ showVideoGrid: show }),
  setShowQueue: (show: any) => set({ showQueue: show }),
  setShowChat: (show: any) => set({ showChat: show }),
  setShowSearch: (show: any) => set({ showSearch: show }),
  setIsSidebarOpen: (open: any) => set({ isSidebarOpen: open }),
  setTheme: (theme: any) => set({ theme }),
}));