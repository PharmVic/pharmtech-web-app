import { create } from 'zustand';

export interface ToastMessage {
    id: string;
    title: string;
    description?: string;
    type?: 'success' | 'info' | 'error';
}

interface ToastState {
    toasts: ToastMessage[];
    showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    showToast: (title, description, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { id, title, description, type }],
        }));

        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, 4000);
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));
