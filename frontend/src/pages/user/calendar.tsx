// src/pages/user/calendar.tsx

import React from 'react';
import { Card, CardBody, CardHeader, Button, Tabs, Tab } from '@heroui/react';
import { Icon } from '@iconify/react';
// UserLayout importi olib tashlandi
import { motion } from 'framer-motion';

// Interfeyslar va mock ma'lumotlar o'zgarishsiz qoladi
interface CalendarEvent { id: string; title: string; date: string; time: string; type: 'appointment' | 'vaccination' | 'checkup'; doctor?: string; location?: string; status: 'upcoming' | 'completed' | 'cancelled'; }
const calendarEvents: CalendarEvent[] = [
  { id: '1', title: 'General Checkup', date: '2023-09-15', time: '10:00', type: 'appointment', doctor: 'Dr. Azimov', location: 'Central Clinic, Room 305', status: 'upcoming' },
  { id: '2', title: 'Flu Vaccination', date: '2023-09-18', time: '14:30', type: 'vaccination', location: 'City Hospital', status: 'upcoming' },
  { id: '3', title: 'Blood Test', date: '2023-09-10', time: '09:15', type: 'checkup', location: 'Medical Lab', status: 'completed' },
];
// daysOfWeek olib tashlandi chunki ishlatilmadi

const generateCalendarDays = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    days.push({
      day: i, date: date, isToday: i === today.getDate(),
      hasEvent: calendarEvents.some(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === i && eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      })
    });
  }
  return days;
};

const CalendarPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState('all');
  // const [selectedDate, setSelectedDate] = React.useState<Date>(new Date()); // O'chirildi
  const calendarDays = generateCalendarDays();

  const filteredEvents = React.useMemo(() => {
    if (selectedTab === 'all') { return calendarEvents; }
    return calendarEvents.filter(event => event.type === selectedTab);
  }, [selectedTab]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const getEventTypeIcon = (type: string) => { switch (type) { case 'appointment': return 'lucide:stethoscope'; case 'vaccination': return 'lucide:syringe'; case 'checkup': return 'lucide:clipboard-check'; default: return 'lucide:calendar'; } };
  // const getEventStatusBadge = (status: string) => { switch (status) { case 'upcoming': return <Badge color="primary">Upcoming</Badge>; case 'completed': return <Badge color="success">Completed</Badge>; case 'cancelled': return <Badge color="danger">Cancelled</Badge>; default: return null; } };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight dark:text-white">Salomatlik Taqvimi</h1>
        <p className="text-foreground-500 font-medium">Uchrashuvlar, emlashlar va ko'riklarni boshqarish</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-8">
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="flex justify-between items-center bg-white/30 backdrop-blur-md px-6 py-4 border-b border-divider/50">
              <h2 className="text-xl font-black tracking-tight">{new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-2">
                <Button variant="flat" isIconOnly size="sm" className="rounded-full bg-white/50"><Icon icon="lucide:chevron-left" /></Button>
                <Button variant="flat" isIconOnly size="sm" className="rounded-full bg-white/50"><Icon icon="lucide:chevron-right" /></Button>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-7 mb-4">
                {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day) => (
                  <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-foreground-400">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { }}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl cursor-pointer relative transition-all duration-300 ${day.isToday
                      ? 'health-gradient text-white shadow-lg shadow-primary/30 font-black'
                      : day.hasEvent
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <span className="text-sm">{day.day}</span>
                    {day.hasEvent && !day.isToday && (
                      <div className="absolute bottom-2 w-1 h-1 rounded-full health-gradient"></div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-divider/50">
              <h2 className="text-lg font-black tracking-tight">Muhim Eslatmalar</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="flex flex-col">
                {[
                  { title: "Yillik ko'rik", date: "2 haftadan keyin", icon: "lucide:bell", color: "warning" },
                  { title: "Retseptni yangilash", date: "5 kundan keyin", icon: "lucide:pill", color: "success" }
                ].map((reminder, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4 hover:bg-white/40 transition-colors">
                    <div className={`w-10 h-10 rounded-xl bg-${reminder.color}/10 flex-shrink-0 flex items-center justify-center`}>
                      <Icon icon={reminder.icon} className={`text-${reminder.color}`} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-bold">{reminder.title}</h3>
                      <p className="text-[11px] font-medium text-foreground-400 uppercase tracking-tighter">{reminder.date}</p>
                    </div>
                    <Button size="sm" variant="flat" color="primary" className="rounded-lg font-bold text-[11px]">KO'RISH</Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="lg:col-span-7 glass-card border-none overflow-hidden">
          <CardHeader className="flex flex-col p-0 bg-white/30 backdrop-blur-md">
            <div className="flex justify-between items-center w-full px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl health-gradient flex items-center justify-center shadow-lg shadow-primary/20">
                  <Icon icon="lucide:list-todo" className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-black tracking-tight">Salomatlik Tadbirlari</h2>
              </div>
              <Button className="health-gradient text-white font-black rounded-xl shadow-lg shadow-primary/20" startContent={<Icon icon="lucide:plus" />}>YANGI QO'SHISH</Button>
            </div>
            <Tabs
              aria-label="Event types"
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab as any}
              variant="underlined"
              classNames={{
                tabList: "gap-8 w-full relative rounded-none p-0 px-8 border-t border-divider/30",
                cursor: "w-full bg-primary h-1",
                tab: "max-w-fit px-0 h-14 font-black text-[11px] uppercase tracking-[0.1em]",
                tabContent: "group-data-[selected=true]:text-primary"
              }}
            >
              <Tab key="all" title="Hammasi" />
              <Tab key="appointment" title="Uchrashuv" />
              <Tab key="vaccination" title="Emlash" />
              <Tab key="checkup" title="Ko'rik" />
            </Tabs>
          </CardHeader>
          <CardBody className="p-0">
            <div className="flex flex-col max-h-[600px] overflow-y-auto">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 border-b border-divider/40 last:border-b-0 hover:bg-white/40 transition-colors group ${event.status === 'completed' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex-shrink-0 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Icon icon={getEventTypeIcon(event.type)} className="text-primary text-2xl" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-black text-lg text-foreground-700 tracking-tight">{event.title}</h3>
                          <div
                            className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest ${event.status === 'upcoming' ? 'bg-primary/20 text-primary' :
                              event.status === 'completed' ? 'bg-success/20 text-success' :
                                'bg-danger/20 text-danger'
                              }`}
                          >
                            {event.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-foreground-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-1.5"><Icon icon="lucide:calendar" /> {formatDate(event.date)}</span>
                          <span className="flex items-center gap-1.5"><Icon icon="lucide:clock" /> {event.time}</span>
                        </div>
                        <div className="mt-3 flex flex-col gap-1.5 text-sm font-medium text-foreground-500">
                          {event.doctor && <p className="flex items-center gap-2"><Icon icon="lucide:user" className="text-gray-400" /> Dr. {event.doctor}</p>}
                          {event.location && <p className="flex items-center gap-2"><Icon icon="lucide:map-pin" className="text-gray-400" /> {event.location}</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center">
                    <Icon icon="lucide:calendar-x" className="text-3xl text-gray-300" />
                  </div>
                  <p className="font-bold text-foreground-400">Hech qanday tadbir topilmadi</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;