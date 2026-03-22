// src/pages/user/settings.tsx

import React, { useState } from 'react';
import { Card, CardBody, Button, Input, Divider, Switch, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [notifications, setNotifications] = useState({
    appointments: true,
    medications: true,
    news: false,
    messages: true,
  });

  const menuItems = [
    { key: 'account', label: 'Hisob', icon: 'lucide:user' },
    { key: 'notifications', label: 'Bildirishnomalar', icon: 'lucide:bell' },
    { key: 'security', label: 'Xavfsizlik', icon: 'lucide:shield' },
    { key: 'language', label: 'Til va Mintaqa', icon: 'lucide:globe' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight dark:text-white mb-6">Hisob Sozlamalari</h2>
            <Card className="glass-card border-none overflow-hidden">
              <CardBody className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon icon="lucide:user-cog" className="text-2xl text-primary" />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground-700 tracking-tight">Profil ma'lumotlari</h3>
                      <p className="text-sm font-medium text-foreground-400">Ism, avatar va boshqa shaxsiy ma'lumotlar</p>
                    </div>
                  </div>
                  <Button as="a" href="/user/profile" className="health-gradient text-white font-black rounded-xl h-11 px-6 shadow-lg shadow-primary/20">PROFILGA O'TISH</Button>
                </div>

                <Divider className="opacity-50" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
                      <Icon icon="lucide:user-x" className="text-2xl text-danger" />
                    </div>
                    <div>
                      <h3 className="font-black text-foreground-700 tracking-tight">Hisobni o'chirish</h3>
                      <p className="text-sm font-medium text-foreground-400">Barcha ma'lumotlaringiz butunlay o'chiriladi</p>
                    </div>
                  </div>
                  <Button color="danger" variant="flat" className="rounded-xl font-bold h-11 px-6">HISOBNI O'CHIRISH</Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight dark:text-white mb-6">Bildirishnomalar</h2>
            <Card className="glass-card border-none overflow-hidden">
              <CardBody className="p-0">
                <div className="flex flex-col divide-y divide-divider/30">
                  {[
                    { id: 'appointments', label: "Uchrashuv eslatmalari", desc: "Yaqinlashayotgan uchrashuvlar haqida xabar", icon: "lucide:calendar", checked: notifications.appointments },
                    { id: 'medications', label: "Dori qabul qilish vaqti", desc: "Dori ichish kerakligi haqida eslatma", icon: "lucide:pill", checked: notifications.medications },
                    { id: 'news', label: "Yangiliklar va takliflar", desc: "Platforma yangiliklari va yangilanishlar", icon: "lucide:megaphone", checked: notifications.news },
                    { id: 'messages', label: "Yangi xabarlar", desc: "Shifokorlardan kelgan yangi xabarlar", icon: "lucide:message-square", checked: notifications.messages },
                  ].map((item) => (
                    <div key={item.id} className="p-6 flex justify-between items-center hover:bg-white/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                          <Icon icon={item.icon} className="text-xl" />
                        </div>
                        <div>
                          <h3 className="font-black text-foreground-700 tracking-tight">{item.label}</h3>
                          <p className="text-sm font-medium text-foreground-400">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        color="primary"
                        isSelected={item.checked}
                        onValueChange={(val) => setNotifications(p => ({ ...p, [item.id]: val }))}
                        className="scale-110"
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight dark:text-white mb-6">Xavfsizlik</h2>
            <Card className="glass-card border-none overflow-hidden">
              <CardBody className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl health-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                    <Icon icon="lucide:key" className="text-white text-xl" />
                  </div>
                  <h3 className="font-black text-xl tracking-tight">Parolni o'zgartirish</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 max-w-md">
                  <Input
                    type="password"
                    label="Joriy parol"
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-xl border-divider bg-white/50" }}
                  />
                  <Input
                    type="password"
                    label="Yangi parol"
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-xl border-divider bg-white/50" }}
                  />
                  <Input
                    type="password"
                    label="Yangi parolni tasdiqlang"
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-xl border-divider bg-white/50" }}
                  />
                  <Button className="health-gradient text-white font-black rounded-xl h-12 mt-2 shadow-lg shadow-primary/20">PAROLNI YANGILASH</Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );
      case 'language':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight dark:text-white mb-6">Til va Mintaqa</h2>
            <Card className="glass-card border-none overflow-hidden">
              <CardBody className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Select
                    label="Interfeys tili"
                    defaultSelectedKeys={["uz"]}
                    variant="bordered"
                    classNames={{ trigger: "rounded-xl border-divider bg-white/50 h-14" }}
                  >
                    <SelectItem key="uz" textValue="O'zbek (Lotin)">O'zbek (Lotin)</SelectItem>
                    <SelectItem key="en" textValue="English (US)">English (US)</SelectItem>
                    <SelectItem key="ru" textValue="Русский">Русский</SelectItem>
                  </Select>
                  <Select
                    label="Vaqt mintaqasi"
                    defaultSelectedKeys={["tashkent"]}
                    variant="bordered"
                    classNames={{ trigger: "rounded-xl border-divider bg-white/50 h-14" }}
                  >
                    <SelectItem key="tashkent" textValue="Asia/Tashkent (GMT+5)">Asia/Tashkent (GMT+5)</SelectItem>
                  </Select>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight dark:text-white uppercase tracking-[0.1em]">Tizim Sozlamalari</h1>
        <p className="text-foreground-500 font-medium">Platforma va xavfsizlik parametrlarini shaxsiylashtiring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chap menyu */}
        <Card className="lg:col-span-1 h-fit glass-card border-none p-2 sticky top-24">
          <CardBody className="p-2">
            <div className="flex flex-col gap-2">
              {menuItems.map(item => (
                <Button
                  key={item.key}
                  fullWidth
                  variant={activeSection === item.key ? 'light' : 'light'}
                  onPress={() => setActiveSection(item.key)}
                  className={`p-6 text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeSection === item.key
                    ? 'health-gradient text-white shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'hover:bg-primary/5 text-foreground-600'
                    }`}
                  startContent={<Icon icon={item.icon} className={`text-xl ${activeSection === item.key ? 'text-white' : 'text-primary'}`} />}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* O'ng kontent */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;