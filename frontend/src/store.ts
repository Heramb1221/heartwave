import { create } from "zustand";

// ========================
// ROOM STORE
// ========================
interface RoomStore {
  currentRoom: string | null;
  hostId: string | null;
  roomCode: string;
  users: User[];
  setCurrentRoom: (room: string | null) => void;
  setHostId: (id: string | undefined | null) => void;
  setRoomCode: (code: string) => void;
  setUsers: (users: User[]) => void;
  resetRoom: () => void;
}

interface User {
  socketId: string;
  clerkId: string;
  name: string;
  avatar?: string;
}

export const useRoomStore = create<RoomStore>((set) => ({
  currentRoom: null,
  hostId: null,
  roomCode: "",
  users: [],
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setHostId: (id) => set({ hostId: id ?? null }),
  setRoomCode: (code) => set({ roomCode: code }),
  setUsers: (users) => set({ users }),
  resetRoom: () => set({ currentRoom: null, hostId: null, roomCode: "", users: [] }),
}));

// ========================
// PLAYER STORE
// ========================
interface PlayerStore {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  player: any | null;
  duration: number;
  setVideoId: (id: string) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPlayer: (player: any) => void;
  setDuration: (duration: number) => void;
  resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  videoId: "dQw4w9WgXcQ",
  currentTime: 0,
  isPlaying: false,
  player: null,
  duration: 0,
  setVideoId: (id) => set({ videoId: id }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlayer: (player) => set({ player }),
  setDuration: (duration) => set({ duration }),
  resetPlayer: () => set({ videoId: "dQw4w9WgXcQ", currentTime: 0, isPlaying: false, player: null, duration: 0 }),
}));

// ========================
// QUEUE STORE
// ========================
export interface QueueVideo {
  videoId: string;
  title: string;
  thumbnail?: string;
}

interface QueueStore {
  queue: QueueVideo[];
  currentIndex: number;
  setQueue: (queue: QueueVideo[]) => void;
  addToQueue: (video: QueueVideo) => void;
  removeFromQueue: (videoId: string) => void;
  setCurrentIndex: (index: number) => void;
  resetQueue: () => void;
}

export const useQueueStore = create<QueueStore>((set) => ({
  queue: [],
  currentIndex: 0,
  setQueue: (queue) => set({ queue }),
  addToQueue: (video) => set((state) => ({ queue: [...state.queue, video] })),
  removeFromQueue: (videoId) => set((state) => ({ queue: state.queue.filter((v) => v.videoId !== videoId) })),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  resetQueue: () => set({ queue: [], currentIndex: 0 }),
}));

// ========================
// CHAT STORE
// ========================
export interface ChatMessage {
  user: string;
  text: string;
  timestamp: string;
}

interface ChatStore {
  messages: ChatMessage[];
  chatInput: string;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setChatInput: (input: string) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  chatInput: "",
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setChatInput: (input) => set({ chatInput: input }),
  resetChat: () => set({ messages: [], chatInput: "" }),
}));

// ========================
// MEDIA STORE
// ========================
interface MediaStore {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  isCameraOn: boolean;
  isMicOn: boolean;
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (socketId: string, stream: MediaStream) => void;
  removeRemoteStream: (socketId: string) => void;
  setIsCameraOn: (on: boolean) => void;
  setIsMicOn: (on: boolean) => void;
  resetMedia: () => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  localStream: null,
  remoteStreams: {},
  isCameraOn: false,
  isMicOn: false,
  setLocalStream: (stream) => set({ localStream: stream }),
  addRemoteStream: (socketId, stream) =>
    set((state) => ({ remoteStreams: { ...state.remoteStreams, [socketId]: stream } })),
  removeRemoteStream: (socketId) =>
    set((state) => ({
      remoteStreams: Object.fromEntries(
        Object.entries(state.remoteStreams).filter(([id]) => id !== socketId)
      ),
    })),
  setIsCameraOn: (on) => set({ isCameraOn: on }),
  setIsMicOn: (on) => set({ isMicOn: on }),
  resetMedia: () => set({ localStream: null, remoteStreams: {}, isCameraOn: false, isMicOn: false }),
}));

// ========================
// AUTH STORE
// ========================
export interface UserData {
  isPremium: boolean;
  clerkId?: string;
  name?: string;
  email?: string;
}

interface AuthStore {
  userData: UserData | null;
  isLoading: boolean;
  setUserData: (data: UserData | null) => void;
  setIsLoading: (loading: boolean) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userData: null,
  isLoading: true,
  setUserData: (data) => set({ userData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  resetAuth: () => set({ userData: null, isLoading: true }),
}));

// ========================
// UI STORE
// ========================
interface UIStore {
  showVideoGrid: boolean;
  showQueue: boolean;
  showChat: boolean;
  showSearch: boolean;
  isSidebarOpen: boolean;
  theme: string;
  setShowVideoGrid: (show: boolean) => void;
  setShowQueue: (show: boolean) => void;
  setShowChat: (show: boolean) => void;
  setShowSearch: (show: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setTheme: (theme: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showVideoGrid: false,
  showQueue: true,
  showChat: true,
  showSearch: false,
  isSidebarOpen: true,
  theme: "dark",
  setShowVideoGrid: (show) => set({ showVideoGrid: show }),
  setShowQueue: (show) => set({ showQueue: show }),
  setShowChat: (show) => set({ showChat: show }),
  setShowSearch: (show) => set({ showSearch: show }),
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}));
