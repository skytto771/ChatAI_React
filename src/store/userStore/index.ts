import { create } from 'zustand';
import { type User } from '@/types';
import { devtools } from 'zustand/middleware';


interface UserStore {
    user: User;
    setUser: (user: any) => void;
}

export const useUserStore = create<UserStore>()(
    devtools((set) => ({
        user: {
            id: '',
            username: '',
            avatarUrl: '',
            role: '',
            email: '',
            phone: '',
            nickname: '',
            bio: '',
            status: '',
            lastLoginAt: new Date(),
        },
        setUser:  (user: User) => set({user}),
    }))
);