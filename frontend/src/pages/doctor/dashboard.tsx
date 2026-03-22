import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Avatar, Modal, ModalContent, ModalHeader, ModalBody, Input, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, getChatRoomId } from '../../contexts/chat-hook';
import { useVideoCall } from '../../contexts/use-video-call';
import { db, rtdb } from '../../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';

interface Patient {
    id: string;
    name: string;
    avatar: string;
    lastMessage?: string;
    lastMessageTime?: string;
    status: 'online' | 'offline';
    reason?: string;
    uid?: string;
}

const DoctorDashboard: React.FC = () => {
    const { user } = useAuth();

    const {
        myVideo, userVideo, callAccepted, callEnded, recevingCall,
        callData, callUser, answerCall, rejectCall, leaveCall, peerStatus
    } = useVideoCall();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [statuses, setStatuses] = useState<Record<string, { state: string; lastChanged: number }>>({});
    const [activeChatRoomId, setActiveChatRoomId] = useState<string>('');

    const { messages, sendMessage } = useChat(activeChatRoomId);

    // Fetch real patients from 'chats' collection
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', user.id)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            console.log("Current Doctor ID (from Auth):", user.id);
            console.log("Found chat documents count:", snapshot.size);
            const tempPatientList: { patient: Patient; updatedAt: any }[] = [];

            for (const chatDoc of snapshot.docs) {
                const chatData = chatDoc.data();
                console.log("Chat doc data:", chatDoc.id, chatData);

                if (!chatData.participants || !Array.isArray(chatData.participants)) {
                    console.warn("Invalid chat participants field:", chatDoc.id);
                    continue;
                }

                const patientId = chatData.participants.find((id: string) => id !== user.id);
                console.log("Target patient id from doc:", patientId);

                if (patientId) {
                    try {
                        const userRef = doc(db, 'users', patientId);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            tempPatientList.push({
                                patient: {
                                    id: patientId,
                                    name: userData.name || 'Noma\'lum bemor',
                                    avatar: userData.avatar || `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100)}`,
                                    lastMessage: chatData.lastMessage,
                                    lastMessageTime: chatData.lastMessageTime,
                                    status: 'online',
                                    reason: 'Konsultatsiya',
                                    uid: userData.uid || patientId
                                },
                                updatedAt: chatData.updatedAt
                            });
                        } else {
                            console.warn("Patient user doc not found for id:", patientId);
                        }
                    } catch (err) {
                        console.error("Error fetching patient details:", err);
                    }
                }
            }

            const sortedList = tempPatientList
                .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
                .map(item => item.patient);

            console.log("Total patients to show:", sortedList.length);
            setPatients(sortedList);
            setLoading(false);
        }, (err) => {
            console.error("Chats subscription error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (patients.length === 0) return;

        const unsubscribes = patients.map(patient => {
            const presenceId = patient.uid || patient.id;
            const statusRef = ref(rtdb, `/status/${presenceId}`);
            return onValue(statusRef, (snapshot) => {
                if (snapshot.exists()) {
                    setStatuses(prev => ({
                        ...prev,
                        [patient.id]: snapshot.val()
                    }));
                }
            });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [patients]);

    const handleStartVideoCall = (patient: Patient) => {
        callUser(patient.id);
    };

    const handleStartChat = (patient: Patient) => {
        if (!user) return;
        const chatRoomId = getChatRoomId(user.id, patient.id);
        setSelectedPatient(patient);
        setActiveChatRoomId(chatRoomId);
        setChatOpen(true);
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Spinner size="lg" color="primary" label="Bemorlar yuklanmoqda..." />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header - More Compact */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-2xl font-black tracking-tight dark:text-white uppercase">
                        Salom, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">Dr. {user?.name?.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-foreground-500 font-medium text-sm">Aqlli diagnostika va bemorlar nazorati paneli.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 dark:border-gray-700/30 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground-600 dark:text-gray-400">Navbatchilikda</span>
                    </div>
                </div>
            </div>

            {/* Stats - More Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Bemorlar", value: patients.length, color: "primary", icon: "lucide:users" },
                    { label: "Yangilar", value: "0", color: "emerald", icon: "lucide:user-plus" },
                    { label: "Xabarlar", value: "0", color: "amber", icon: "lucide:message-square" },
                    { label: "Reyting", value: "4.9", color: "rose", icon: "lucide:star" }
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                        <Card className="glass-card border-none overflow-hidden group hover:translate-y-[-2px] transition-all duration-300 shadow-sm">
                            <CardBody className="p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center group-hover:bg-${stat.color}-500/20 transition-colors`}>
                                    <Icon icon={stat.icon} className={`text-xl text-${stat.color}-500`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground-800 dark:text-white tracking-tighter leading-none">{stat.value}</h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-foreground-400 mt-1">{stat.label}</p>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Patients Table - Clean and Modern */}
            <Card className="glass-card border-none overflow-hidden shadow-xl">
                <CardHeader className="flex flex-col p-0 border-b border-divider/40">
                    <div className="w-full px-6 py-4 flex justify-between items-center bg-white/10">
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg health-gradient flex items-center justify-center shadow-md">
                                <Icon icon="lucide:list-todo" className="text-white text-sm" />
                            </div>
                            Bemorlar Jadvali
                        </h2>
                        <Button size="sm" variant="flat" className="rounded-lg font-bold bg-white/50 dark:bg-gray-800/50 h-8 text-[10px]" startContent={<Icon icon="lucide:filter" />}>FILTR</Button>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="flex flex-col">
                        <AnimatePresence mode="popLayout">
                            {patients.length > 0 ? (
                                patients.map((patient, index) => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-b border-divider/40 last:border-b-0 hover:bg-white/40 dark:hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 flex-grow">
                                            <div className="relative">
                                                <Avatar src={patient.avatar} className="w-12 h-12 shadow-md border-2 border-white dark:border-gray-800" />
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${statuses[patient.id]?.state === 'online' ? 'bg-success' : 'bg-gray-400'}`}></div>
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="text-base font-black text-foreground-800 dark:text-white tracking-tight leading-tight">{patient.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-tighter truncate max-w-[150px]">{patient.lastMessage || patient.reason}</p>
                                                    <span className="text-[9px] font-medium text-foreground-400 uppercase">{patient.lastMessageTime || 'Hozirgina'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                                            <Button
                                                size="sm"
                                                className="h-9 px-4 rounded-xl health-gradient text-white font-black shadow-md hover:scale-[1.02] transition-all text-[10px]"
                                                onPress={() => handleStartVideoCall(patient)}
                                                startContent={<Icon icon="lucide:video" className="text-sm" />}
                                            >
                                                QO'NG'IROQ
                                            </Button>
                                            <Button
                                                size="sm"
                                                isIconOnly
                                                variant="flat"
                                                className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all"
                                                onPress={() => handleStartChat(patient)}
                                            >
                                                <Icon icon="lucide:message-circle" className="text-lg" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-16 gap-3 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-2">
                                        <Icon icon="lucide:users" className="text-3xl text-gray-200 dark:text-gray-700" />
                                    </div>
                                    <h3 className="text-lg font-black text-foreground-300 uppercase tracking-widest">Bemorlar yo'q</h3>
                                    <p className="text-foreground-400 text-xs max-w-xs mx-auto">Siz bilan muloqot qilgan bemorlar ro'yxati bu yerda ko'rinadi.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardBody>
            </Card>

            {/* Video Call Modal olib tashlandi, CallProvider orqali ishlaydi */}

            {/* P2P Video Call UI Modal */}
            <Modal isOpen={peerStatus !== 'idle'} onOpenChange={(open) => { if (!open) leaveCall(); }} size="5xl" hideCloseButton backdrop="blur" placement="center">
                <ModalContent className="border-none bg-black text-white h-[80vh] overflow-hidden">
                    <ModalHeader className="px-6 py-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full">
                        <div>
                            <h3 className="text-xl font-bold">{peerStatus === 'calling' ? "Chaqirilmoqda..." : (callAccepted ? "Suhbat jarayonida" : "Video qo'ng'iroq")}</h3>
                            <p className="text-xs text-gray-400">{callData?.callerName}</p>
                        </div>
                        {peerStatus === 'calling' && <Button color="danger" variant="flat" onPress={leaveCall}>Bekor qilish</Button>}
                    </ModalHeader>
                    <ModalBody className="p-0 relative h-full flex items-center justify-center bg-zinc-900">
                        {/* Remote Video */}
                        {callAccepted && !callEnded && (
                            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover absolute inset-0" />
                        )}

                        {/* Local Video - always shown in PIP in corner when connected, or centered if not */}
                        <div className={`${callAccepted ? 'absolute bottom-6 right-6 w-48 h-64 rounded-xl overflow-hidden shadow-2xl z-20 border-2 border-white/20' : 'w-full h-full'}`}>
                            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover transform -scale-x-100" />
                        </div>

                        {/* Connection Status Text indicator */}
                        {!callAccepted && peerStatus === 'calling' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                                <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                                <h2 className="text-2xl font-bold">Aloqa o'rnatilmoqda...</h2>
                            </div>
                        )}
                    </ModalBody>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-4 bg-black/50 p-3 rounded-full backdrop-blur-md">
                        <Button isIconOnly color="danger" size="lg" className="rounded-full shadow-lg hover:scale-110 transition-transform" onPress={leaveCall}>
                            <Icon icon="lucide:phone-off" className="text-xl" />
                        </Button>
                    </div>
                </ModalContent>
            </Modal>

            {/* Incoming Call Alert Modal */}
            <Modal isOpen={recevingCall && !callAccepted} hideCloseButton backdrop="blur" placement="center">
                <ModalContent className="glass-card border-none bg-white/90 dark:bg-gray-900/90 shadow-2xl p-6 text-center">
                    <ModalBody className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <Avatar src={callData?.callerAvatar} className="w-24 h-24 border-4 border-primary shadow-xl" />
                            <div className="absolute -bottom-2 -right-2 bg-success p-2 rounded-full animate-bounce">
                                <Icon icon="lucide:video" className="text-white text-xl" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">{callData?.callerName}</h3>
                            <p className="text-foreground-500 font-bold uppercase tracking-widest text-[10px] mt-1">Kiruvchi video qo'ng'iroq...</p>
                        </div>
                        <div className="flex gap-8 mt-4">
                            <Button isIconOnly size="lg" className="w-16 h-16 rounded-full bg-danger text-white shadow-xl shadow-danger/40 hover:scale-110 transition-transform" onPress={rejectCall}>
                                <Icon icon="lucide:phone-off" className="text-2xl" />
                            </Button>
                            <Button isIconOnly size="lg" className="w-16 h-16 rounded-full bg-success text-white shadow-xl shadow-success/40 hover:scale-110 transition-transform pulse-animation" onPress={answerCall}>
                                <Icon icon="lucide:phone" className="text-2xl" />
                            </Button>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal isOpen={chatOpen} onOpenChange={setChatOpen} size="3xl" backdrop="blur">
                <ModalContent className="glass-card border-none !bg-white/95 dark:!bg-gray-950/95 h-[80vh] min-h-[500px] shadow-2xl overflow-hidden">
                    <ModalHeader className="px-6 py-4 border-b border-divider/50 flex items-center gap-3 bg-white/50">
                        <Avatar src={selectedPatient?.avatar} size="sm" isBordered color={statuses[selectedPatient?.id || '']?.state === 'online' ? 'success' : 'default'} />
                        <div>
                            <h3 className="font-black text-base tracking-tight leading-none mb-1">{selectedPatient?.name}</h3>
                            <p className={`text-[8px] font-black uppercase tracking-widest ${statuses[selectedPatient?.id || '']?.state === 'online' ? 'text-success' : 'text-foreground-400'}`}>
                                {statuses[selectedPatient?.id || '']?.state === 'online' ? 'Onlayn' : 'Oflayn'}
                            </p>
                        </div>
                    </ModalHeader>
                    <ModalBody className="flex flex-col p-0 overflow-hidden">
                        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50/20">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95, x: msg.authorId === user?.id ? 10 : -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    className={`flex ${msg.authorId === user?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-3 max-w-[85%] shadow-sm ${msg.authorId === user?.id
                                        ? 'bg-primary text-white rounded-xl rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-foreground-700 dark:text-gray-200 rounded-xl rounded-tl-none border border-divider/30'}`}
                                    >
                                        <p className="font-medium text-xs leading-relaxed">{msg.text}</p>
                                        <div className={`text-[8px] font-bold uppercase mt-1 ${msg.authorId === user?.id ? 'text-white/60 text-right' : 'text-foreground-400'}`}>
                                            {msg.time}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                    <Icon icon="lucide:messages-square" className="text-4xl mb-2" />
                                    <p className="font-black text-[10px] uppercase tracking-widest">Xabar yo'q</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white/80 dark:bg-black/20 backdrop-blur-md border-t border-divider/50">
                            <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-xl p-1.5 border border-divider shadow-sm">
                                <Input
                                    placeholder="Xabar..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    variant="flat"
                                    size="sm"
                                    className="flex-grow"
                                    classNames={{ inputWrapper: "bg-transparent shadow-none" }}
                                />
                                <Button
                                    isIconOnly
                                    size="sm"
                                    className="health-gradient text-white rounded-lg shadow-md w-9 h-9"
                                    onPress={handleSendMessage}
                                    isDisabled={!newMessage.trim()}
                                >
                                    <Icon icon="lucide:send" className="text-base" />
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default DoctorDashboard;
