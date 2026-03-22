// src/contexts/notification-context.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    limit,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch,
    getDocs
} from 'firebase/firestore';
import { useAuth } from './auth-context';

export interface Notification {
    id: string;
    recipientId: string;
    senderId: string;
    senderName: string;
    text: string;
    type: 'message' | 'system';
    read: boolean;
    createdAt: any;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', user.id),
            limit(50) // Biroz ko'proq olamiz, chunki xotirada saralaymiz
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications: Notification[] = [];
            let unread = 0;

            snapshot.forEach((doc) => {
                const data = doc.data() as Omit<Notification, 'id'>;
                fetchedNotifications.push({ id: doc.id, ...data });
                if (!data.read) unread++;
            });

            // Xotirada saralash (index xatosini oldini olish uchun)
            fetchedNotifications.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

            setNotifications(fetchedNotifications);
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await updateDoc(doc(db, 'notifications', id), { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const batch = writeBatch(db);
            const unread = notifications.filter(n => !n.read);
            unread.forEach(n => {
                batch.update(doc(db, 'notifications', n.id), { read: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const clearAll = async () => {
        if (!user) return;
        try {
            const batch = writeBatch(db);
            notifications.forEach(n => {
                batch.delete(doc(db, 'notifications', n.id));
            });
            await batch.commit();
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
