// src/pages/user/doctors.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Avatar, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { db, rtdb } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from 'react-router-dom';

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    description: string;
    avatar: string;
    bio: string;
    history: string;
    uid?: string;
}

const DoctorsPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [statuses, setStatuses] = useState<Record<string, { state: string; lastChanged: number }>>({});
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const history = useHistory();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'doctors'));
                const doctorsList = querySnapshot.docs.map((doc: any) => ({
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

    useEffect(() => {
        if (doctors.length === 0) return;

        const unsubscribes = doctors.map(doctor => {
            const presenceId = doctor.uid || doctor.id;
            const statusRef = ref(rtdb, `/status/${presenceId}`);
            return onValue(statusRef, (snapshot) => {
                if (snapshot.exists()) {
                    setStatuses(prev => ({
                        ...prev,
                        [doctor.id]: snapshot.val()
                    }));
                }
            });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [doctors]);

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContact = (doctor: Doctor, type: 'chat' | 'video') => {
        // Chat sahifasiga yo'naltirish va tanlangan shifokorni sessionga saqlash yoki query param orqali uzatish
        history.push(`/user/chat?docId=${doctor.id}&type=${type}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner size="lg" color="primary" label="Mutaxassislar yuklanmoqda..." />
                <p className="text-foreground-500 font-bold uppercase tracking-widest animate-pulse">Shifokorlar yuklanmoqda...</p>
            </div>
        );
    }

    if (doctors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center">
                    <Icon icon="lucide:user-x" className="text-5xl text-primary/30" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight">Hozircha shifokorlar yo'q</h2>
                    <p className="text-foreground-500 max-w-sm">Ma'lumotlar bazasi yangilanmoqda. Iltimos, bir ozdan so'ng qayta urinib ko'ring yoki sahifani yangilang.</p>
                </div>
                <Button
                    variant="flat"
                    color="primary"
                    className="rounded-2xl font-black uppercase tracking-widest px-8"
                    onPress={() => window.location.reload()}
                >
                    YANGILASH
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl font-black tracking-tight dark:text-white uppercase tracking-[0.05em]">
                        Bizning <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Mutaxassislar</span>
                    </h1>
                    <p className="text-foreground-500 font-medium text-lg italic">Siz uchun eng yaxshi shifokorlar xizmatda.</p>
                </div>
                <div className="w-full md:w-80">
                    <Input
                        placeholder="Shifokor yoki yo'nalishni qidiring..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        startContent={<Icon icon="lucide:search" className="text-foreground-400" />}
                        variant="bordered"
                        classNames={{
                            inputWrapper: "rounded-2xl border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md"
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredDoctors.map((doc, index) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            layout
                        >
                            <Card
                                isPressable
                                onPress={() => { setSelectedDoctor(doc); onOpen(); }}
                                className="border-none bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl overflow-hidden group hover:-translate-y-2 transition-all duration-500 h-full shadow-lg hover:shadow-2xl hover:shadow-primary/20"
                            >
                                <CardBody className="p-0">
                                    <div className="relative h-72 w-full overflow-hidden">
                                        <img
                                            src={doc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random`}
                                            alt={doc.name}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                            onError={(e: any) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=random`; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="absolute top-4 right-4">
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 backdrop-blur-md rounded-full border ${statuses[doc.id]?.state === 'online' ? 'bg-success/20 border-white/30' : 'bg-gray-500/20 border-gray-400/30'}`}>
                                                <div className={`w-2 h-2 rounded-full ${statuses[doc.id]?.state === 'online' ? 'bg-success animate-pulse' : 'bg-gray-400'}`}></div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                    {statuses[doc.id]?.state === 'online' ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-6 left-6 right-6 transform group-hover:translate-y-[-4px] transition-transform duration-500">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-primary/20 backdrop-blur-md text-primary text-[9px] font-black uppercase tracking-widest rounded-md border border-primary/30">
                                                    Top Mutaxassis
                                                </span>
                                            </div>
                                            <h3 className="text-white font-black text-2xl leading-none tracking-tight mb-1 drop-shadow-md">{doc.name}</h3>
                                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.1em]">{doc.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <p className="text-foreground-500 text-sm line-clamp-2 leading-relaxed font-semibold">
                                            {doc.description}
                                        </p>
                                        <div className="pt-2 flex items-center justify-between border-t border-divider/40">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-xl">
                                                <Icon icon="lucide:star" className="text-sm text-amber-500 fill-current" />
                                                <span className="text-xs font-black text-amber-600">4.9</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Batafsil</span>
                                                <Icon icon="lucide:arrow-right" className="text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Doctor Details Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="3xl"
                backdrop="blur"
                classNames={{
                    base: "glass-card border-none !bg-white/90 dark:!bg-gray-900/90",
                    header: "border-b border-divider/50",
                    footer: "border-t border-divider/50"
                }}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex gap-4 items-center">
                                <Avatar src={selectedDoctor?.avatar} size="lg" className="border-2 border-primary" />
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-black tracking-tight">{selectedDoctor?.name}</h2>
                                    <p className="text-primary text-xs font-black uppercase tracking-[0.2em]">{selectedDoctor?.specialty}</p>
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-foreground-800">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Icon icon="lucide:user-check" className="text-lg" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-sm">Biografiya</h3>
                                        </div>
                                        <p className="text-foreground-500 text-sm leading-relaxed font-medium italic">
                                            "{selectedDoctor?.bio}"
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-foreground-800">
                                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                                <Icon icon="lucide:graduation-cap" className="text-lg" />
                                            </div>
                                            <h3 className="font-black uppercase tracking-widest text-sm">Tajriba va Tarix</h3>
                                        </div>
                                        <p className="text-foreground-500 text-sm leading-relaxed font-medium">
                                            {selectedDoctor?.history}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Icon icon="lucide:info" className="text-primary text-xl" />
                                        <h3 className="font-black uppercase tracking-widest text-xs text-primary">Ixtisoslashuv</h3>
                                    </div>
                                    <p className="text-foreground-700 font-bold text-sm leading-relaxed">
                                        {selectedDoctor?.description}
                                    </p>
                                </div>
                            </ModalBody>
                            <ModalFooter className="justify-center gap-4 py-6">
                                <Button
                                    className="h-14 px-8 rounded-2xl health-gradient text-white font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex-1"
                                    onPress={() => handleContact(selectedDoctor!, 'video')}
                                    startContent={<Icon icon="lucide:video" className="text-xl" />}
                                >
                                    VIDEO CHAT
                                </Button>
                                <Button
                                    className="h-14 px-8 rounded-2xl bg-secondary text-white font-black shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all flex-1"
                                    onPress={() => handleContact(selectedDoctor!, 'chat')}
                                    startContent={<Icon icon="lucide:message-circle" className="text-xl" />}
                                >
                                    ODDIY CHAT
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default DoctorsPage;
