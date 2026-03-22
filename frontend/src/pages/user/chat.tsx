import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Card, CardBody, CardHeader, Button, Input, Avatar } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/auth-context';
import { useDoctors, useChat, getChatRoomId } from '../../contexts/chat-hook';
import { useLocation } from "react-router-dom";

const Chat: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { doctors } = useDoctors();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const activeRoomId = (user && selectedDoctor)
    ? getChatRoomId(user.id, selectedDoctor.id)
    : undefined;

  const {
    messages,
    newMessage,
    setNewMessage,
    handleSend,
    chatMessagesContainerRef,
  } = useChat(activeRoomId);

  const handleStartChat = (doctor: any) => {
    setSelectedDoctor(doctor);
  };

  // URL query parametrlarini tekshirish (Doctorlar sahifasidan yo'naltirilganda)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const docId = searchParams.get('docId');

    if (docId && doctors.length > 0) {
      const doc = doctors.find(d => d.id === docId);
      if (doc) {
        handleStartChat(doc);
      }
    }
  }, [location.search, doctors]);

  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6 p-4 lg:p-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold dark:text-white">Shifokor bilan muloqot</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Professional shifokorlar bilan real-vaqt rejimida bog'laning</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* DOCTOR LIST */}
        <Card className="w-80 glass-card border-none hidden lg:flex">
          <CardHeader className="p-6 border-b border-divider/50">
            <h2 className="text-lg font-bold">Shifokorlar</h2>
          </CardHeader>
          <CardBody className="p-2 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${selectedDoctor?.id === doctor.id ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  onClick={() => handleStartChat(doctor)}
                >
                  <div className="relative">
                    <Avatar src={doctor.avatar} size="md" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-white rounded-full"></div>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sm truncate">{doctor.name}</h3>
                    <p className="text-xs text-foreground-500 truncate">{doctor.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* CHAT AREA */}
        <Card className="flex-1 glass-card border-none flex flex-col overflow-hidden">
          {!selectedDoctor ? (
            <CardBody className="flex flex-col items-center justify-center p-12 text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center pulse-animation">
                <Icon icon="lucide:message-circle" className="text-6xl text-primary/40" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Muloqotni boshlang</h3>
                <p className="text-foreground-500 max-w-sm">Savollaringizga javob olish uchun chap tomondagi shifokorlardan birini tanlang yoki savolingizni yo'llang.</p>
              </div>
            </CardBody>
          ) : (
            <>
              <CardHeader className="flex justify-between items-center p-6 border-b border-divider/50 bg-white/30 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <Avatar src={selectedDoctor.avatar} className="border-2 border-primary/20" />
                  <div>
                    <h3 className="font-bold text-lg">{selectedDoctor.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      <span className="text-xs text-foreground-500 font-medium uppercase tracking-wider">{selectedDoctor.specialty}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button isIconOnly variant="flat" color="primary" className="rounded-full"><Icon icon="lucide:video" /></Button>
                  <Button isIconOnly variant="flat" color="secondary" className="rounded-full"><Icon icon="lucide:phone" /></Button>
                  <Button isIconOnly variant="flat" color="default" className="rounded-full lg:hidden" onPress={() => handleStartChat(null as any)}><Icon icon="lucide:arrow-left" /></Button>
                </div>
              </CardHeader>

              <CardBody className="flex-1 overflow-y-auto p-0 bg-gray-50/30">
                <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={chatMessagesContainerRef}>
                  <AnimatePresence mode="popLayout">
                    {messages.map((message: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${message.authorId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[70%] ${message.authorId === user?.id ? 'flex-row-reverse' : ''}`}>
                          {message.authorId !== user?.id && <Avatar src={selectedDoctor.avatar} size="sm" className="mt-auto" />}
                          <div className={`p-4 rounded-2xl shadow-sm ${message.authorId === user?.id ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-divider/50 rounded-tl-none'}`}>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            <p className={`text-[10px] mt-2 font-medium ${message.authorId === user?.id ? 'text-white/70 text-right' : 'text-foreground-400'}`}>{message.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardBody>

              <div className="p-6 border-t border-divider/50 bg-white/30 backdrop-blur-sm">
                <div className="flex gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-divider shadow-sm focus-within:border-primary/50 transition-all">
                  <Button isIconOnly variant="light" color="default" className="rounded-xl"><Icon icon="lucide:plus" /></Button>
                  <Input
                    aria-label="Xabar yozish"
                    placeholder="Xabar yozing..."
                    variant="flat"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-grow"
                    classNames={{ input: "bg-transparent", inputWrapper: "bg-transparent shadow-none" }}
                  />
                  <Button
                    isIconOnly
                    color="primary"
                    className="health-gradient text-white rounded-xl shadow-lg"
                    onPress={handleSend}
                    isDisabled={!newMessage.trim()}
                  >
                    <Icon icon="lucide:send-horizontal" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;