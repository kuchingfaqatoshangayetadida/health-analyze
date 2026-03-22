import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './auth-context';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where, onSnapshot, serverTimestamp, setDoc, doc } from 'firebase/firestore';

// Chat xonasi ID sini yaratish (har doim bir xil tartibda)
export const getChatRoomId = (id1: string, id2: string) => {
  return [id1, id2].sort().join('_'); // '-' o'rniga '_' ishlatamiz, chunki Firebase ID larda '-' bo'lishi mumkin
};

// Xabar interfeysi
export interface IMessage {
  id?: string;
  chatRoomId: string;
  authorId: string;
  authorName: string;
  text: string;
  time: string;
  timestamp?: any;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  description: string;
  avatar: string;
  bio: string;
  history: string;
}

// Socket ulanishini faqat bir marta yaratamiz va eksport qilamiz
export const socket = io("http://localhost:5000");

// 1. Shifokorlar ro'yxatini boshqarish uchun hook
export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'doctors'));
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return { doctors, loading };
};

// 2. Chat xonasi bilan ishlash uchun hook
export const useChat = (chatRoomId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);

  // Firestore'dan xabarlarni yuklash va real-time kuzatish
  useEffect(() => {
    if (!chatRoomId || !user) return;

    const q = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', chatRoomId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IMessage[];

      // Vaqt bo'yicha qo'lda saralash (index talab qilmaslik uchun)
      const sortedMsgs = msgs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeA - timeB;
      });

      setMessages(sortedMsgs);
    });

    socket.emit('join_chat', chatRoomId);

    return () => {
      unsubscribe();
      setMessages([]);
    };
  }, [chatRoomId, user]);

  const sendMessage = async (text: string) => {
    if (text.trim() && user && chatRoomId) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const messageData: IMessage = {
        chatRoomId: chatRoomId,
        authorId: user.id,
        authorName: user.name,
        text: text,
        time: timeStr,
        timestamp: serverTimestamp()
      };

      try {
        // 1. Firestore'ga saqlash
        await addDoc(collection(db, 'messages'), messageData);

        // 2. Chat metadata/so'nggi suhbatni yangilash
        // chatRoomId formati: id1_id2
        await setDoc(doc(db, 'chats', chatRoomId), {
          lastMessage: text,
          lastMessageTime: timeStr,
          participants: chatRoomId.split('_'),
          updatedAt: serverTimestamp()
        }, { merge: true });

        // 3. Socket orqali yuborish (real-time xabarnoma uchun)
        socket.emit('send_message', messageData);

        // 4. Bildirishnoma yaratish (Firestore'da)
        const recipientId = chatRoomId.split('_').find(id => id !== user.id);
        if (recipientId) {
          await addDoc(collection(db, 'notifications'), {
            recipientId,
            senderId: user.id,
            senderName: user.name,
            text: text.length > 50 ? text.substring(0, 47) + '...' : text,
            type: 'message',
            read: false,
            createdAt: serverTimestamp()
          });
        }

        setNewMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleSend = () => {
    sendMessage(newMessage);
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
    handleSend,
    chatMessagesContainerRef
  };
};
