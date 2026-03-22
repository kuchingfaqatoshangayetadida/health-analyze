// src/components/layout/doctor-layout.tsx

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Badge, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, DropdownSection } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/auth-context';
import { useNotifications } from '../../contexts/notification-context';
import { useTheme } from '../../contexts/theme-context';
import { motion } from 'framer-motion';

interface DoctorLayoutProps {
  children: React.ReactNode;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  const { user, updateUser, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const history = useHistory();
  const { isDarkMode, toggleTheme } = useTheme();

  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', avatar: '' });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, avatar: user.avatar || '' });
    }
  }, [user]);

  const handleLogout = () => { logout(); history.push('/login'); };

  const handleProfileUpdate = () => {
    if (user) {
      updateUser({ name: formData.name, avatar: formData.avatar });
    }
    setIsEditProfileModalOpen(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-success/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar
        maxWidth="xl"
        isBordered
        className="glass-card !bg-white/70 dark:!bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/30 sticky top-0 z-50 transition-all duration-300"
      >
        <NavbarBrand>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => history.push('/doctor/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <Icon icon="lucide:stethoscope" className="text-white text-2xl" />
            </div>
            <p className="font-extrabold text-inherit text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">
              HealthAI Dr.
            </p>
          </motion.div>
        </NavbarBrand>

        <NavbarContent justify="end" className="flex items-center gap-2 sm:gap-4">
          <Button isIconOnly variant="flat" onClick={toggleTheme} className="rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 transition-colors">
            <Icon icon={isDarkMode ? 'lucide:sun' : 'lucide:moon'} className="text-xl text-foreground-600" />
          </Button>

          <Dropdown placement="bottom-end">
            <Badge
              content={unreadCount > 0 ? unreadCount : null}
              color="danger"
              shape="circle"
              size="sm"
              className="border-2 border-white dark:border-gray-900"
              isInvisible={unreadCount === 0}
            >
              <DropdownTrigger>
                <Button isIconOnly variant="flat" className="rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <Icon icon="lucide:bell" className="text-xl text-foreground-600" />
                </Button>
              </DropdownTrigger>
            </Badge>
            <DropdownMenu
              aria-label="Notifications"
              className="w-80 p-0"
              itemClasses={{ base: "px-4 pt-3 pb-3" }}
            >
              <DropdownSection showDivider>
                <DropdownItem key="header" isReadOnly className="opacity-100 cursor-default p-0">
                  <div className="flex justify-between items-center px-4 py-2">
                    <span className="font-bold text-sm text-foreground-800">Bildirishnomalar</span>
                    {notifications.length > 0 && (
                      <Button size="sm" variant="light" color="danger" className="h-7 text-[10px] font-bold" onClick={clearAll}>Tozalash</Button>
                    )}
                  </div>
                </DropdownItem>
              </DropdownSection>
              <DropdownSection aria-label="Messages">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownItem
                      key={n.id}
                      className={`${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.type === 'message') history.push('/doctor/dashboard');
                      }}
                    >
                      <div className="flex gap-3 items-start">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Icon icon={n.type === 'message' ? 'lucide:message-square' : 'lucide:info'} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-bold leading-none">{n.senderName}</p>
                          <p className="text-[11px] text-foreground-500 line-clamp-1">{n.text}</p>
                          <p className="text-[9px] text-foreground-400 mt-1 uppercase font-medium">Hozirgina</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
                      </div>
                    </DropdownItem>
                  ))
                ) : (
                  <DropdownItem key="empty" isReadOnly className="text-center py-8 opacity-50">
                    <div className="flex flex-col items-center">
                      <Icon icon="lucide:bell-off" className="text-3xl mx-auto mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">Yangi bildirishnomalar yo'q</p>
                    </div>
                  </DropdownItem>
                )}
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                isBordered
                color="primary"
                size="sm"
                src={user?.avatar || ''}
                className="transition-transform hover:scale-105 active:scale-95"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Doctor menu" className="p-2" itemClasses={{ base: "rounded-lg data-[hover=true]:bg-primary/10 data-[hover=true]:text-primary" }}>
              <DropdownItem key="profile" startContent={<Icon icon="lucide:user-cog" className="text-lg" />} onPress={() => setIsEditProfileModalOpen(true)}>
                Profilni Tahrirlash
              </DropdownItem>
              <DropdownItem key="logout" color="danger" className="text-danger" startContent={<Icon icon="lucide:log-out" className="text-lg" />} onClick={handleLogout}>
                Chiqish
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="flex-grow container mx-auto px-4 py-8 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {children}
        </motion.div>
      </main>

      {/* Profilni Tahrirlash Modali */}
      <Modal isOpen={isEditProfileModalOpen} onOpenChange={setIsEditProfileModalOpen} backdrop="blur">
        <ModalContent className="glass-card !bg-white/90 dark:!bg-gray-900/90 border-none">
          <ModalHeader className="font-bold text-xl">Profilni Tahrirlash</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-5 py-2">
              <div className="flex flex-col items-center gap-2">
                <Avatar src={formData.avatar} className="w-24 h-24 border-4 border-primary/20 shadow-xl" />
                <Button size="sm" variant="flat" color="primary" className="rounded-lg relative overflow-hidden">
                  Rasmni o'zgartirish
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAvatarUpload} />
                </Button>
              </div>

              <div className="space-y-4">
                <Input variant="bordered" label="To'liq ismingiz" value={formData.name} onValueChange={(v) => setFormData({ ...formData, name: v })} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />

                <div className="pt-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-500 mb-3">Xavfsizlik</h3>
                  <div className="space-y-3">
                    <Input type="password" variant="bordered" label="Joriy Parol" classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                    <Input type="password" variant="bordered" label="Yangi Parol" classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-divider/50">
            <Button variant="light" className="rounded-xl" onPress={() => setIsEditProfileModalOpen(false)}>Bekor qilish</Button>
            <Button className="health-gradient text-white font-bold rounded-xl shadow-lg shadow-primary/20" onPress={handleProfileUpdate}>Saqlash</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DoctorLayout;