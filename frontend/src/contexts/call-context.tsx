import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    deleteDoc,
    limit
} from 'firebase/firestore';
import { useAuth } from './auth-context';
import { Modal, ModalContent, ModalBody, Button, Avatar } from '@heroui/react';
import { Icon } from '@iconify/react';
import JitsiVideoCall from '../components/chat/JitsiVideoCall';

interface Call {
    id: string;
    callerId: string;
    callerName: string;
    callerAvatar: string;
    recipientId: string;
    status: 'pending' | 'accepted' | 'rejected' | 'ended';
    roomName: string;
    createdAt: any;
}

interface CallContextType {
    startCall: (recipientId: string, recipientName: string, recipientAvatar: string) => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => Promise<void>;
    endCall: () => Promise<void>;
    activeCall: Call | null;
    isCalling: boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [incomingCall, setIncomingCall] = useState<Call | null>(null);
    const [outgoingCall, setOutgoingCall] = useState<Call | null>(null);
    const [isJitsiOpen, setIsJitsiOpen] = useState(false);

    // Listen for incoming calls
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'calls'),
            where('recipientId', '==', user.id),
            where('status', '==', 'pending'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const callData = snapshot.docs[0].data() as Omit<Call, 'id'>;
                setIncomingCall({ id: snapshot.docs[0].id, ...callData });
            } else {
                setIncomingCall(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Listen for status of outgoing call
    useEffect(() => {
        if (!outgoingCall) return;

        const unsubscribe = onSnapshot(doc(db, 'calls', outgoingCall.id), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Call;
                if (data.status === 'accepted') {
                    setIsJitsiOpen(true);
                } else if (data.status === 'rejected' || data.status === 'ended') {
                    setOutgoingCall(null);
                    setIsJitsiOpen(false);
                }
            } else {
                setOutgoingCall(null);
                setIsJitsiOpen(false);
            }
        });

        return () => unsubscribe();
    }, [outgoingCall]);

    const startCall = async (recipientId: string, recipientName: string, recipientAvatar: string) => {
        if (!user) return;
        const roomName = `room_${user.id}_${recipientId}_${Date.now()}`;
        const callData = {
            callerId: user.id,
            callerName: user.name || 'Anonymous',
            callerAvatar: user.avatar || '',
            recipientId,
            recipientName,
            recipientAvatar,
            status: 'pending',
            roomName,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'calls'), callData);
        setOutgoingCall({ id: docRef.id, ...callData } as Call);
    };

    const acceptCall = async () => {
        if (!incomingCall) return;
        await updateDoc(doc(db, 'calls', incomingCall.id), { status: 'accepted' });
        setIsJitsiOpen(true);
    };

    const rejectCall = async () => {
        if (!incomingCall) return;
        await updateDoc(doc(db, 'calls', incomingCall.id), { status: 'rejected' });
        setIncomingCall(null);
    };

    const endCall = async () => {
        const call = incomingCall || outgoingCall;
        if (call) {
            await updateDoc(doc(db, 'calls', call.id), { status: 'ended' });
            // Clean up doc after small delay (optional)
            setTimeout(() => deleteDoc(doc(db, 'calls', call.id)), 2000);
        }
        setIncomingCall(null);
        setOutgoingCall(null);
        setIsJitsiOpen(false);
    };

    const activeCall = incomingCall || outgoingCall;

    return (
        <CallContext.Provider value={{ startCall, acceptCall, rejectCall, endCall, activeCall, isCalling: !!outgoingCall }}>
            {children}

            {/* Incoming Call Modal */}
            <Modal isOpen={!!incomingCall && !isJitsiOpen} hideCloseButton backdrop="blur" placement="center">
                <ModalContent className="glass-card border-none bg-white/90 dark:bg-gray-900/90 shadow-2xl p-6 text-center">
                    <ModalBody className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <Avatar src={incomingCall?.callerAvatar} className="w-24 h-24 border-4 border-primary shadow-xl" />
                            <div className="absolute -bottom-2 -right-2 bg-success p-2 rounded-full animate-bounce">
                                <Icon icon="lucide:phone" className="text-white text-xl" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">{incomingCall?.callerName}</h3>
                            <p className="text-foreground-500 font-bold uppercase tracking-widest text-[10px] mt-1">Kiruvchi video qo'ng'iroq...</p>
                        </div>
                        <div className="flex gap-8 mt-4">
                            <Button isIconOnly size="lg" className="w-16 h-16 rounded-full bg-danger text-white shadow-xl shadow-danger/40 hover:scale-110 transition-transform" onPress={rejectCall}>
                                <Icon icon="lucide:phone-off" className="text-2xl" />
                            </Button>
                            <Button isIconOnly size="lg" className="w-16 h-16 rounded-full bg-success text-white shadow-xl shadow-success/40 hover:scale-110 transition-transform pulse-animation" onPress={acceptCall}>
                                <Icon icon="lucide:phone" className="text-2xl" />
                            </Button>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Outgoing Call Modal */}
            <Modal isOpen={!!outgoingCall && !isJitsiOpen} hideCloseButton backdrop="blur" placement="center">
                <ModalContent className="glass-card border-none bg-white/90 dark:bg-gray-900/90 shadow-2xl p-6 text-center">
                    <ModalBody className="flex flex-col items-center gap-6">
                        <Avatar src={outgoingCall?.callerAvatar} className="w-24 h-24 border-4 border-primary/50 shadow-xl opacity-50" />
                        <div>
                            <h3 className="text-xl font-black">Chaqirilmoqda...</h3>
                            <p className="text-foreground-500 text-[10px] font-bold uppercase tracking-widest mt-1">Javob kutilyapti</p>
                        </div>
                        <Button isIconOnly size="lg" className="w-16 h-16 rounded-full bg-danger text-white shadow-xl shadow-danger/40 mt-4" onPress={endCall}>
                            <Icon icon="lucide:phone-off" className="text-2xl" />
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Jitsi Meeting Modal */}
            <Modal isOpen={isJitsiOpen} size="5xl" hideCloseButton backdrop="blur" className="m-0 p-0 overflow-hidden h-[90vh]">
                <ModalContent className="bg-black border-none h-full overflow-hidden">
                    {activeCall && (
                        <JitsiVideoCall
                            roomName={activeCall.roomName}
                            userName={user?.name || 'User'}
                            onClose={endCall}
                        />
                    )}
                </ModalContent>
            </Modal>
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (context === undefined) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};
