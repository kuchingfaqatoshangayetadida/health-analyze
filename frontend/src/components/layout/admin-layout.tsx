// src/components/layout/admin-layout.tsx

import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, updateUser, logout } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', avatar: '' });

  useEffect(() => {
    if (user && isEditProfileModalOpen) {
      setFormData({ name: user.name, avatar: user.avatar || '' });
    }
  }, [user, isEditProfileModalOpen]);

  const handleLogout = () => { logout(); history.push('/login'); };
  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
    { path: '/admin/users', label: 'Users', icon: 'lucide:users' },
    { path: '/admin/doctors', label: 'Doctors', icon: 'lucide:stethoscope' },
    { path: '/admin/analytics', label: 'Analytics', icon: 'lucide:bar-chart-2' },
  ];

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
      reader.onloadend = () => { setFormData(prev => ({ ...prev, avatar: reader.result as string })); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 h-16">
          <Icon icon="lucide:heart-pulse" className="text-primary text-3xl" />
          <h1 className="font-bold text-xl dark:text-white">HealthAnalyze</h1>
        </div>
        <nav className="flex-grow p-2">
          {navItems.map((item) => (
            <div key={item.path} onClick={() => history.push(item.path)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 ${isActive(item.path) ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              <Icon icon={item.icon} className="text-xl" />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <Dropdown placement="top-start">
            <DropdownTrigger>
              <Button variant="light" className="w-full justify-start p-3 h-auto">
                <div className="flex items-center gap-3 text-left">
                  <Avatar size="md" src={user?.avatar || ''} />
                  <div className="flex flex-col"><p className="text-sm font-medium dark:text-white">{user?.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p></div>
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Admin Actions">
              <DropdownItem key="add" startContent={<Icon icon="lucide:user-plus" />} onPress={() => setIsAddAdminModalOpen(true)}>Yangi admin qo'shish</DropdownItem>
              <DropdownItem key="edit" startContent={<Icon icon="lucide:user-cog" />} onPress={() => setIsEditProfileModalOpen(true)}>Profilni tahrirlash</DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<Icon icon="lucide:log-out" />} onClick={handleLogout}>Chiqish</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold dark:text-white">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <Button isIconOnly variant="light" onClick={toggleTheme}><Icon icon={isDarkMode ? 'lucide:sun' : 'lucide:moon'} className="text-2xl text-gray-600 dark:text-gray-300" /></Button>
          </div>
        </header>
        <main className="flex-grow p-6 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {children}
          </motion.div>
        </main>
      </div>

      <Modal isOpen={isAddAdminModalOpen} onOpenChange={setIsAddAdminModalOpen}>
        <ModalContent className="dark:bg-gray-800">
          <ModalHeader className="dark:text-white">Yangi Admin Qo'shish</ModalHeader>
          <ModalBody><div className="flex flex-col gap-4"><Input label="Ism" /><Input label="Email" type="email" /><Input type="password" label="Vaqtinchalik Parol" /></div></ModalBody>
          <ModalFooter><Button variant="light" onPress={() => setIsAddAdminModalOpen(false)}>Bekor qilish</Button><Button color="primary">Qo'shish</Button></ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditProfileModalOpen} onOpenChange={setIsEditProfileModalOpen}>
        <ModalContent className="dark:bg-gray-800">
          <ModalHeader className="dark:text-white">Profilni Tahrirlash</ModalHeader>
          <ModalBody><div className="flex flex-col gap-4">
            <div className="flex justify-center"><Avatar src={formData.avatar} className="w-24 h-24" /></div>
            <Input type="file" accept="image/*" label="Rasmni o'zgartirish" onChange={handleAvatarUpload} />
            <Input label="Ism" value={formData.name} onValueChange={(v) => setFormData({ ...formData, name: v })} />
            <Divider className="my-2 dark:border-gray-700" />
            <h3 className="font-semibold dark:text-gray-200">Parolni o'zgartirish</h3>
            <Input type="password" label="Joriy Parol" /><Input type="password" label="Yangi Parol" /><Input type="password" label="Yangi Parolni Tasdiqlang" />
          </div></ModalBody>
          <ModalFooter><Button variant="light" onPress={() => setIsEditProfileModalOpen(false)}>Bekor qilish</Button><Button color="primary" onPress={handleProfileUpdate}>Saqlash</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminLayout;