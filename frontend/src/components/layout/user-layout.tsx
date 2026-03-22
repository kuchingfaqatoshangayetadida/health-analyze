// src/components/layout/user-layout.tsx

import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Badge, DropdownSection } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/auth-context';
import { useNotifications } from '../../contexts/notification-context';
import { useTheme } from '../../contexts/theme-context';
import { motion } from 'framer-motion';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const history = useHistory();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme(); // <-- Global state'dan olinadi

  const handleLogout = () => { logout(); history.push('/login'); };
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/user/dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
    { path: '/user/doctors', label: 'Doctorlar', icon: 'lucide:users' },
    { path: '/user/chat', label: 'Chat', icon: 'lucide:message-circle' },
    { path: '/user/calendar', label: 'Calendar', icon: 'lucide:calendar' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar
        maxWidth="xl"
        isBordered
        className="glass-card !bg-white/70 dark:!bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/30 sticky top-0 z-50 transition-all duration-300"
      >
        <NavbarBrand>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => history.push('/user/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl health-gradient flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <Icon icon="lucide:heart-pulse" className="text-white text-2xl" />
            </div>
            <p className="font-extrabold text-inherit text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              HealthAI
            </p>
          </motion.div>
        </NavbarBrand>

        <NavbarContent className="hidden md:flex gap-8" justify="center">
          {navItems.map((item) => (
            <NavbarItem key={item.path} isActive={isActive(item.path)}>
              <div
                onClick={() => history.push(item.path)}
                className={`group flex items-center gap-2 cursor-pointer transition-all duration-300 relative py-1 ${isActive(item.path) ? 'text-primary' : 'text-foreground-500 hover:text-primary'}`}
              >
                <Icon icon={item.icon} className={`text-xl transition-transform group-hover:scale-110 ${isActive(item.path) ? 'scale-110' : ''}`} />
                <span className="text-sm font-bold tracking-wide uppercase">{item.label}</span>
                {isActive(item.path) && (
                  <motion.div layoutId="nav-underline" className="absolute bottom-[-18px] left-0 right-0 h-1 bg-primary rounded-full" />
                )}
              </div>
            </NavbarItem>
          ))}
        </NavbarContent>

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
                    <span className="font-bold text-sm">Bildirishnomalar</span>
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
                        if (n.type === 'message') history.push('/user/chat');
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
            <DropdownMenu aria-label="User menu" className="p-2" itemClasses={{ base: "rounded-lg data-[hover=true]:bg-primary/10 data-[hover=true]:text-primary" }}>
              <DropdownItem key="profile" startContent={<Icon icon="lucide:user" className="text-lg" />} onClick={() => history.push('/user/profile')}>Mening Profilim</DropdownItem>
              <DropdownItem key="settings" startContent={<Icon icon="lucide:settings" className="text-lg" />} onClick={() => history.push('/user/settings')}>Sozlamalar</DropdownItem>
              <DropdownItem key="logout" color="danger" className="text-danger" startContent={<Icon icon="lucide:log-out" className="text-lg" />} onClick={handleLogout}>Chiqish</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="flex-grow container mx-auto px-4 py-8 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default UserLayout;