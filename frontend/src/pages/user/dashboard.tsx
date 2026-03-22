// src/pages/user/dashboard.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  Card, CardBody, CardHeader, Button, Progress,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Divider, Avatar, Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useChat, getChatRoomId, useDoctors } from '../../contexts/chat-hook';
import { useVideoCall } from '../../contexts/use-video-call';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

// --- MOCK MA'LUMOTLAR (o'zgarmagan) ---
const healthData1Day = [{ name: '00:00', value: 130 }, { name: '04:00', value: 80 }, { name: '08:00', value: 152 }, { name: '12:00', value: 119 }, { name: '16:00', value: 141 }, { name: '20:00', value: 120 }, { name: '23:59', value: 163 },];
const healthData15Days = [{ name: 'Day 1', value: 138 }, { name: 'Day 3', value: 110 }, { name: 'Day 5', value: 142 }, { name: 'Day 7', value: 100 }, { name: 'Day 9', value: 151 }, { name: 'Day 12', value: 110 }, { name: 'Day 15', value: 148 },];
const healthData30Days = [{ name: 'Day 1', value: 120 }, { name: 'Day 5', value: 105 }, { name: 'Day 10', value: 132 }, { name: 'Day 15', value: 99 }, { name: 'Day 20', value: 121 }, { name: 'Day 25', value: 110 }, { name: 'Day 30', value: 138 },];
const healthData3Months = [{ name: 'Month 1', value: 120 }, { name: 'Month 1.5', value: 118 }, { name: 'Month 2', value: 122 }, { name: 'Month 2.5', value: 119 }, { name: 'Month 3', value: 121 },];
const initialReminders = [{ id: '1', title: 'Qon bosimiga qarshi dori qabul qiling', time: '08:00', isCompleted: true }, { id: '2', title: 'Ichimlik suvi (1.5L)', time: 'Kun davomida', isCompleted: false }, { id: '3', title: 'Kechki sayr (30 daqiqa)', time: '18:00', isCompleted: false }];
const smartwatchImages = ['https://images.ctfassets.net/mmeshd7gafk1/7ndpwOhRN52vOrPveYjyjY/dd322d5bb164624c05191bc2f7b88cb2/Garmin__FitBit_or_Apple_Watch-_Which_to_choose_.jpg', 'https://cdn.mos.cms.futurecdn.net/FEpwP7M89sBp5pGJnHJYDS.jpg', 'https://djd1xqjx2kdnv.cloudfront.net/photos/38/30/504562_26091_XXL.jpg',];

interface BotChatMessage {
  sender: 'user' | 'bot';
  text: string;
  suggestion?: {
    doctorSpecialty: string;
  };
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    myVideo, userVideo, callAccepted, callEnded, recevingCall,
    callData, callUser, answerCall, rejectCall, leaveCall, peerStatus
  } = useVideoCall();

  const [reminders, setReminders] = useState(initialReminders);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [healthData, setHealthData] = useState([
    { name: 'Dush', value: 120 }, { name: 'Sesh', value: 118 },
    { name: 'Chor', value: 122 }, { name: 'Pay', value: 119 },
    { name: 'Jum', value: 121 }, { name: 'Shan', value: 120 }, { name: 'Yak', value: 118 }
  ]);

  // Real shifokor chati uchun state'lar
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeChatRoomId, setActiveChatRoomId] = useState<string>('');

  // 2. YANGILIK: BOT CHATI UCHUN ALOHIDA STATE'LAR
  const [isBotChatOpen, setIsBotChatOpen] = useState(false);
  const [botChatMessages, setBotChatMessages] = useState<BotChatMessage[]>([
    { sender: 'bot', text: "Salom! Men sizning virtual yordamchingizman. Sog'lig'ingizdagi qanday o'zgarishlar bezovta qilyapti?" }
  ]);
  const [botNewMessage, setBotNewMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // useChat hook'i (haqiqiy shifokor bilan chat uchun)
  const { messages, sendMessage } = useChat(activeChatRoomId);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);

  // Har yangi xabar kelganda pastga scroll qilish
  useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [messages, botChatMessages]);

  useEffect(() => {
    if (connectModalOpen) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % smartwatchImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [connectModalOpen]);

  const handlePeriodSelect = (period: any) => {
    let newData;
    switch (period) {
      case '1 day': newData = healthData1Day; break;
      case '15 days': newData = healthData15Days; break;
      case '30 days': newData = healthData30Days; break;
      case '3-months': newData = healthData3Months; break;
      default: newData = healthData;
    }
    setHealthData(newData);
    setDetailsModalOpen(false);
  };
  const { doctors: allDoctors } = useDoctors();

  // Video call effect olib tashlandi, endi global CallProvider boshqaradi

  const handleAddReminder = () => {
    if (newTitle && newTime) {
      const newReminder = { id: Date.now().toString(), title: newTitle, time: newTime, isCompleted: false };
      setReminders([...reminders, newReminder]);
      setNewTitle('');
      setNewTime('');
      setShowModal(false);
    }
  };

  const handleToggleComplete = (id: string) => {
    setReminders(reminders.map(reminder => reminder.id === id ? { ...reminder, isCompleted: !reminder.isCompleted } : reminder));
  };

  // Barcha modal/video hooklarga oid
  const handleStartVideoCall = (doctor: any) => {
    callUser(doctor.id);
  };



  // Real shifokorlar bilan suhbatlar ro'yxatini olish
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.id)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsList: any[] = [];

      for (const chatDoc of snapshot.docs) {
        const chatData = chatDoc.data();
        const doctorId = chatData.participants.find((id: string) => id !== user.id);

        if (doctorId) {
          try {
            const docRef = doc(db, 'doctors', doctorId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              chatsList.push({
                id: docSnap.id,
                doctorName: docSnap.data().name,
                specialty: docSnap.data().specialty,
                avatar: docSnap.data().avatar,
                lastMessage: chatData.lastMessage,
                updatedAt: chatData.updatedAt
              });
            }
          } catch (err) {
            console.error("Error fetching chat doctor details:", err);
          }
        }
      }

      // Vaqt bo'yicha saralash
      const sortedChats = chatsList.sort((a, b) =>
        (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
      );

      setActiveChats(sortedChats);
      setChatsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // HAQIQIY SHIFOKOR BILAN CHATNI BOSHLASH FUNKSIYASI
  const handleStartChat = (doctor: any) => {
    if (!user) return;
    const chatRoomId = getChatRoomId(user.id, doctor.id);
    setSelectedDoctor({
      id: doctor.id,
      doctorName: doctor.name || doctor.doctorName,
      avatar: doctor.avatar,
      specialty: doctor.specialty
    });
    setActiveChatRoomId(chatRoomId);
    setChatOpen(true);
  };

  // HAQIQIY SHIFOKORGA XABAR YUBORISH
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  // =========================================================================
  // 3. YANGILIK: BOTGA XABAR YUBORISH VA JAVOB OLISH MANTIG'I
  // =========================================================================
  const handleSendToBot = async () => {
    if (!botNewMessage.trim() || isBotTyping) return;

    const userText = botNewMessage.trim();
    const userMessage: BotChatMessage = { sender: 'user', text: userText };
    setBotChatMessages(prev => [...prev, userMessage]);
    setBotNewMessage('');
    setIsBotTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/bot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) throw new Error("Bot error");

      const data = await response.json();
      let botText = data.response?.text || data.text || "Kechirasiz, tizimda xatolik yuz berdi.";

      // Parse referral: [yo'nalish: Kardiolog]
      let specialty = null;
      const match = botText.match(/\[yo'nalish:\s*(.*?)\]/);
      if (match) {
        specialty = match[1].trim();
        botText = botText.replace(/\[yo'nalish:.*?\]/, "").trim();
      }

      const botMessage: BotChatMessage = {
        sender: 'bot',
        text: botText,
      };

      if (specialty) {
        botMessage.suggestion = { doctorSpecialty: specialty };
      }

      setBotChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Bot chat error:", error);
      setBotChatMessages(prev => [...prev, {
        sender: 'bot',
        text: "Texnik xatolik yuz berdi. Iltimos, Groq API kalitingizni tekshiring yoki keyinroq qayta urinib ko'ring."
      }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleContactDoctorFromBot = (specialty: string) => {
    const doctorToContact = allDoctors.find((doc: any) =>
      doc.specialty.toLowerCase().includes(specialty.toLowerCase())
    );

    if (doctorToContact) {
      setIsBotChatOpen(false);
      handleStartChat(doctorToContact);
    } else {
      // Show search UI or general message
      setBotChatMessages(prev => [...prev, {
        sender: 'bot',
        text: `Hozirda bizda bo'sh ${specialty} mutaxassisi yo'q, lekin men boshqa shifokorni tavsiya qilishim mumkin.`
      }]);
    }
  };




  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2"><h1 className="text-2xl font-bold">Salom, {user?.name}!</h1><p className="text-foreground-500">Bugungi salomatlik haqida umumiy ma’lumot</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card h-full border-none">
            <CardBody className="flex flex-col items-center justify-center gap-2 py-6">
              <div className="rounded-full bg-primary/10 p-4 pulse-animation">
                <Icon icon="lucide:bot" className="text-primary text-3xl" />
              </div>
              <h3 className="font-bold text-lg">Smart Assistant</h3>
              <p className="text-foreground-500 text-sm text-center px-4">AI orqali sog'lig'ingizni tahlil qiling</p>
              <Button onPress={() => setIsBotChatOpen(true)} color="primary" variant="shadow" className="mt-4 health-gradient text-white font-medium" endContent={<Icon icon="lucide:sparkles" />}>Savol so'rash</Button>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card h-full border-none">
            <CardBody className="flex flex-col items-center justify-center gap-2 py-6">
              <div className="rounded-full bg-secondary/10 p-4">
                <Icon icon="lucide:calendar" className="text-secondary text-3xl" />
              </div>
              <h3 className="font-bold text-lg">Uchrashuvlar</h3>
              <p className="text-foreground-500 text-sm text-center px-4">Tashrifni rejalashtirish</p>
              <Button as={Link} to="/user/calendar" color="secondary" variant="flat" className="mt-4 font-medium" endContent={<Icon icon="lucide:arrow-right" />}>Ko‘rish</Button>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card h-full border-none">
            <CardBody className="flex flex-col items-center justify-center gap-2 py-6">
              <div className="rounded-full bg-success/10 p-4">
                <Icon icon="lucide:clipboard-list" className="text-success text-3xl" />
              </div>
              <h3 className="font-bold text-lg">Tahlillar</h3>
              <p className="text-foreground-500 text-sm text-center px-4">Kasallik tarixini ko‘rish</p>
              <Button as={Link} to="/user/records" color="success" variant="flat" className="mt-4 font-medium" endContent={<Icon icon="lucide:arrow-right" />}>Ko‘rish</Button>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card h-full border-none">
            <CardBody className="flex flex-col items-center justify-center gap-2 py-6">
              <div className="rounded-full bg-warning/10 p-4">
                <Icon icon="lucide:pill" className="text-warning text-3xl" />
              </div>
              <h3 className="font-bold text-lg">Dorilar</h3>
              <p className="text-foreground-500 text-sm text-center px-4">Dorilaringizni kuzating</p>
              <Button as={Link} to="/user/medications" color="warning" variant="flat" className="mt-4 font-medium" endContent={<Icon icon="lucide:arrow-right" />}>Ko‘rish</Button>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Sahifaning qolgan qismi o'zgarmagan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-none">
          <CardHeader className="flex justify-between items-center px-6 pt-6">
            <h2 className="text-xl font-bold">Salomatlik statistikasi</h2>
            <div className="flex gap-2">
              <Button variant="flat" size="sm" onPress={() => setConnectModalOpen(true)} startContent={<Icon icon="lucide:watch" />}>Ulash</Button>
              <Button variant="flat" size="sm" color="primary" onPress={() => setDetailsModalOpen(true)}>Batafsil</Button>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-foreground-500 text-xs font-medium uppercase tracking-wider">Qon bosimi</span>
                  <Icon icon="lucide:activity" className="text-primary" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">120/80</span>
                  <span className="text-xs text-foreground-400">mmHg</span>
                </div>
                <Progress size="sm" value={80} color="primary" className="mt-3" aria-label="Qon bosimi progressi" />
              </div>

              <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-foreground-500 text-xs font-medium uppercase tracking-wider">Yurak urishi</span>
                  <Icon icon="lucide:heart" className="text-secondary" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">72</span>
                  <span className="text-xs text-foreground-400">bpm</span>
                </div>
                <Progress size="sm" value={72} color="secondary" className="mt-3" aria-label="Yurak urishi progressi" />
              </div>

              <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-foreground-500 text-xs font-medium uppercase tracking-wider">Uyqu</span>
                  <Icon icon="lucide:moon" className="text-success" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">7.5</span>
                  <span className="text-xs text-foreground-400">soat</span>
                </div>
                <Progress size="sm" value={75} color="success" className="mt-3" aria-label="Uyqu progressi" />
              </div>
            </div>

            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader className="px-6 pt-6">
            <h2 className="text-xl font-bold">Uchrashuvlar</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="flex flex-col px-2 h-[300px] overflow-y-auto">
              {chatsLoading ? (
                <div className="p-10 text-center"><Spinner size="sm" /></div>
              ) : activeChats.map((chat) => (
                <div key={chat.id} className="p-4 rounded-xl hover:bg-white/50 transition-colors flex items-center gap-4">
                  <Avatar src={chat.avatar} className="w-12 h-12 border-2 border-white shadow-sm" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-sm tracking-tight">{chat.doctorName}</h3>
                    <p className="text-foreground-500 text-[10px] font-medium uppercase tracking-tighter line-clamp-1">{chat.lastMessage || chat.specialty}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button isIconOnly variant="flat" size="sm" color="primary" onPress={() => handleStartVideoCall(chat)} className="rounded-full">
                      <Icon icon="lucide:video" />
                    </Button>
                    <Button isIconOnly variant="flat" size="sm" color="success" onPress={() => handleStartChat(chat)} className="rounded-full">
                      <Icon icon="lucide:message-circle" />
                    </Button>
                  </div>
                </div>
              ))}
              {!chatsLoading && activeChats.length === 0 && (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <Icon icon="lucide:message-square" className="text-3xl text-foreground-200" />
                  <p className="text-foreground-400 text-[10px] font-bold uppercase tracking-widest">Suhbatlar mavjud emas</p>
                </div>
              )}
            </div>
            <div className="p-6">
              <Button as={Link} to="/user/doctors" color="primary" className="health-gradient text-white font-medium w-full" endContent={<Icon icon="lucide:plus" />}>Yangi uchrashuv</Button>
            </div>
          </CardBody>
        </Card>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card border-none overflow-hidden">
          <CardHeader className="flex justify-between items-center px-6 py-4 bg-white/30 backdrop-blur-md border-b border-divider/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon icon="lucide:check-square" className="text-primary" />
              </div>
              <h2 className="text-lg font-bold">Bugungi eslatmalar</h2>
            </div>
            <Button variant="flat" color="primary" isIconOnly size="sm" className="rounded-full" onPress={() => setShowModal(true)}>
              <Icon icon="lucide:plus" className="text-lg" />
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <div className="flex flex-col">
              {reminders.map((reminder, index) => (
                <React.Fragment key={reminder.id}>
                  <div className={`flex items-center gap-4 p-4 transition-colors ${reminder.isCompleted ? 'bg-gray-50/50 dark:bg-gray-800/10' : 'hover:bg-white/40'}`}>
                    <div className="flex-shrink-0">
                      <Button
                        isIconOnly
                        variant={reminder.isCompleted ? "solid" : "flat"}
                        color={reminder.isCompleted ? "success" : "default"}
                        size="sm"
                        className="rounded-full shadow-sm"
                        onPress={() => handleToggleComplete(reminder.id)}
                      >
                        <Icon icon={reminder.isCompleted ? "lucide:check" : "lucide:circle"} className={reminder.isCompleted ? "text-white" : "text-foreground-400"} />
                      </Button>
                    </div>
                    <div className="flex-grow">
                      <h3 className={`font-bold text-sm ${reminder.isCompleted ? 'line-through text-foreground-400/70 font-medium' : ''}`}>
                        {reminder.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Icon icon="lucide:clock" className="text-[10px] text-foreground-400" />
                        <span className="text-[10px] font-medium text-foreground-500 uppercase tracking-tighter">{reminder.time}</span>
                      </div>
                    </div>
                    <Button isIconOnly variant="light" size="sm" color="danger" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon icon="lucide:trash-2" />
                    </Button>
                  </div>
                  {index < reminders.length - 1 && <Divider className="opacity-50" />}
                </React.Fragment>
              ))}
            </div>
            {reminders.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon icon="lucide:list-todo" className="text-2xl text-gray-300" />
                </div>
                <p className="text-foreground-400 text-sm font-medium">Hozircha eslatmalar mavjud emas</p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Boshqa modallar o'zgarmagan */}
      <Modal isOpen={connectModalOpen} onOpenChange={setConnectModalOpen} placement="center"><ModalContent><ModalHeader>Smart soatlarni ulash</ModalHeader><ModalBody><img src={smartwatchImages[currentImageIndex]} alt="Smartwatch" className="w-full h-48 object-cover rounded-lg" /><div className="mt-4"><h3 className="font-semibold">Smart soatni qanday ulash mumkin</h3><p className="text-sm mt-2">1. Garmin Connect ilovasini oching.</p><p className="text-sm">2. Yana {'>'} Sozlamalar {'>'} Ilovalarni ulash {'>'} Apple Health rukniga kiring.</p></div></ModalBody><ModalFooter><Button variant="light" onPress={() => setConnectModalOpen(false)}>Close</Button></ModalFooter></ModalContent></Modal>
      <Modal isOpen={detailsModalOpen} onOpenChange={setDetailsModalOpen} placement="center"><ModalContent><ModalHeader>Select Period</ModalHeader><ModalBody><Button fullWidth onPress={() => handlePeriodSelect('1 day')}>1 Kunlik</Button><Button fullWidth onPress={() => handlePeriodSelect('15 days')}>15 Kunlik</Button><Button fullWidth onPress={() => handlePeriodSelect('30 days')}>30 Kunlik</Button><Button fullWidth onPress={() => handlePeriodSelect('3-months')}>3 Oylik</Button></ModalBody><ModalFooter><Button variant="light" onPress={() => setDetailsModalOpen(false)}>Cancel</Button></ModalFooter></ModalContent></Modal>
      <Modal isOpen={showModal} onOpenChange={setShowModal} placement="center"><ModalContent><ModalHeader>Yangi eslatma yaratish</ModalHeader><ModalBody><Input label="Title" placeholder="Enter reminder title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /><Input label="Time" placeholder="Enter time (e.g. 08:00)" value={newTime} onChange={(e) => setNewTime(e.target.value)} /></ModalBody><ModalFooter><Button variant="light" onPress={() => setShowModal(false)}>Cancel</Button><Button color="primary" onPress={handleAddReminder}>Save</Button></ModalFooter></ModalContent></Modal>
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
      <Modal isOpen={chatOpen} onOpenChange={setChatOpen} size="full">
        <ModalContent className="flex-1 flex flex-col">
          <ModalHeader className="flex-shrink-0 flex justify-between items-center bg-green-600 text-white">
            <div className="flex items-center gap-2">
              <img src={selectedDoctor?.avatar} alt={selectedDoctor?.doctorName} className="w-8 h-8 rounded-full" />
              <h3 className="font-semibold">Chat with {selectedDoctor?.doctorName}</h3>
            </div>
            <Button variant="light" color="danger" onPress={() => setChatOpen(false)}>Close</Button>
          </ModalHeader>
          <ModalBody className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-4 rounded-lg bg-white shadow-inner min-h-[400px]">
            {messages.map((message: any, index: number) => (
              <div key={index} className={`flex ${message.authorId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-xs ${message.authorId === user?.id ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  <p>{message.text}</p>
                  <p className="text-xs text-right mt-1 opacity-70">{message.time}</p>
                </div>
              </div>
            ))}
          </ModalBody>
          <div className="flex-shrink-0 flex gap-2 p-4 border-t bg-white">
            <Input aria-label="Xabar yozish" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1" />
            <Button color="primary" onPress={handleSendMessage} disabled={!newMessage.trim()}>Yuborish</Button>
          </div>
        </ModalContent>
      </Modal>

      <Modal isOpen={isBotChatOpen} onOpenChange={setIsBotChatOpen} size="2xl" scrollBehavior="inside" backdrop="blur">
        <ModalContent className="glass-card !bg-white/90 dark:!bg-gray-900/90 h-[80vh]">
          <ModalHeader className="flex flex-col gap-1 border-b border-divider/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center pulse-animation">
                <Icon icon="lucide:bot" className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Smart Sog'liqni Saqlash Assistenti</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-xs text-foreground-500">Online | Groq AI orqali ishlaydi</span>
                </div>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="p-0 overflow-hidden">
            <div ref={chatMessagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {botChatMessages.map((message: BotChatMessage, index: number) => (
                <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} message-appear`}>
                  <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar
                      size="sm"
                      icon={message.sender === 'user' ? <Icon icon="lucide:user" /> : <Icon icon="lucide:bot" />}
                      className={message.sender === 'user' ? 'bg-primary text-white' : 'bg-secondary text-white'}
                    />
                    <div className={`p-4 rounded-2xl shadow-sm ${message.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-divider/50 rounded-tl-none'}`}>
                      <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>

                      {message.suggestion && (
                        <div className="mt-4 p-3 bg-primary/5 dark:bg-primary/20 rounded-xl border border-primary/10">
                          <p className="text-xs font-bold text-primary flex items-center gap-2 mb-2">
                            <Icon icon="lucide:stethoscope" /> TAVSIYA ETILGAN MUTAXASSIS:
                          </p>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-foreground-700">{message.suggestion.doctorSpecialty}</span>
                            <Button size="sm" color="primary" variant="shadow" className="h-8 rounded-lg text-xs" startContent={<Icon icon="lucide:calendar" />} onPress={() => { setIsBotChatOpen(false); handleContactDoctorFromBot(message.suggestion!.doctorSpecialty); }}>Vaqt belgilash</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex justify-start message-appear">
                  <div className="flex gap-3 items-center">
                    <Avatar
                      size="sm"
                      icon={<Icon icon="lucide:bot" />}
                      className={'bg-secondary text-white'}
                    />
                    <div className="flex gap-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-divider/50">
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                      <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                      <span className="text-xs text-foreground-400 italic ml-2">Bot o'ylamoqda...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-divider/50 p-4">
            <div className="flex w-full gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-divider/50 focus-within:border-primary/50 transition-colors">
              <Input
                aria-label="Botga savol yozish"
                className="flex-grow"
                variant="flat"
                placeholder="Savolingizni yozing..."
                value={botNewMessage}
                onChange={(e) => setBotNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendToBot()}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: "bg-transparent shadow-none"
                }}
              />
              <Button isIconOnly color="primary" className="health-gradient text-white rounded-xl shadow-lg" onPress={handleSendToBot} isDisabled={!botNewMessage.trim() || isBotTyping}>
                <Icon icon="lucide:send-horizontal" className="text-xl" />
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserDashboard;