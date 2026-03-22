// src/pages/user/profile.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Tabs, Tab, Avatar, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/auth-context.tsx';
import { motion, AnimatePresence } from 'framer-motion';

// Interfeyslar va mock ma'lumotlar
interface HealthRecord { id: string; date: string; type: string; doctor: string; description: string; documents?: { name: string; url: string }[]; }
interface DoctorRating { id: string; doctorName: string; specialty: string; date: string; rating: number; comment: string; avatar: string; }

const initialHealthRecords: HealthRecord[] = [
  { id: '1', date: '2023-08-15', type: 'Umumiy tekshiruv', doctor: 'Dr. Azimov', description: 'Yillik salomatlik tekshiruvi. Qon bosimi va yurak urishi me\'yorda.', documents: [{ name: 'tahlil-natijasi.pdf', url: '#' }] },
  { id: '2', date: '2023-07-10', type: 'Stomatolog ko\'rigi', doctor: 'Dr. Karimova', description: 'Tishlarni tozalash va tekshirish. Muammo topilmadi.', documents: [] },
  { id: '3', date: '2023-06-05', type: 'Ko\'z tekshiruvi', doctor: 'Dr. Rahimov', description: 'Ko\'rish qobiliyatini tekshirish. Ko\'zoynak retsepti yangilandi.', documents: [] }
];
const doctorRatings: DoctorRating[] = [
  { id: '1', doctorName: 'Dr. Azimov', specialty: 'Kardiolog', date: '2023-08-15', rating: 5, comment: 'Ajoyib shifokor, juda sinchkov va professional.', avatar: `https://avatar.iran.liara.run/public/1` },
  { id: '2', doctorName: 'Dr. Karimova', specialty: 'Stomatolog', date: '2023-07-10', rating: 4, comment: 'Yaxshi tajriba, ohista ishladilar va hamma narsani tushuntirdilar.', avatar: `https://avatar.iran.liara.run/public/2` }
];

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '+998 90 123 4567', birthdate: '1990-01-01', gender: 'Male', bloodType: 'A+', allergies: 'Mavjud emas', chronicConditions: 'Mavjud emas', avatar: '' });
  const [savedMessage, setSavedMessage] = useState('');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(initialHealthRecords);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Omit<HealthRecord, 'id'>>({ date: '', type: '', doctor: '', description: '', documents: [] });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name, email: user.email, avatar: user.avatar || '' }));
    }
  }, [user]);

  const handleInputChange = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setFormData(prev => ({ ...prev, avatar: reader.result as string })); }; reader.readAsDataURL(file); } };
  const handleSaveProfile = () => { if (user) { updateUser({ name: formData.name, avatar: formData.avatar, email: formData.email }); } setIsEditing(false); setSavedMessage('Ma\'lumotlar muvaffaqiyatli saqlandi!'); setTimeout(() => setSavedMessage(''), 3000); };
  const handleNewRecordChange = (key: string, value: string) => setNewRecord(prev => ({ ...prev, [key]: value }));

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const uploadedDocs = Array.from(files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file) // Vaqtinchalik URL yaratish
      }));
      setNewRecord(prev => ({ ...prev, documents: [...(prev.documents || []), ...uploadedDocs] }));
    }
  };

  const handleAddRecord = () => {
    const recordToAdd: HealthRecord = { ...newRecord, id: Date.now().toString() };
    setHealthRecords(prev => [recordToAdd, ...prev]);
    setShowUploadModal(false);
    setNewRecord({ date: '', type: '', doctor: '', description: '', documents: [] });
  };

  const renderStarRating = (rating: number) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <Icon key={star} icon="lucide:star" className={star <= rating ? 'text-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight dark:text-white">Foydalanuvchi Profili</h1>
        <p className="text-foreground-500 font-medium">Shaxsiy ma'lumotlar va salomatlik qaydlarini boshqarish</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit glass-card border-none p-2">
          <CardBody className="flex flex-col items-center gap-6 p-6">
            <div className="relative group">
              <Avatar src={formData.avatar} className="w-32 h-32 text-large shadow-2xl border-4 border-white dark:border-gray-800" isBordered color="primary" />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-success border-4 border-white dark:border-gray-900 rounded-full"></div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-black dark:text-white tracking-tight">{formData.name}</h2>
              <p className="text-foreground-500 font-mono text-sm opacity-70">{formData.email}</p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 py-2">
              <div className="bg-primary/5 dark:bg-primary/10 p-3 rounded-2xl border border-primary/10 text-center">
                <p className="text-[10px] uppercase font-bold text-foreground-400 tracking-widest">Yosh</p>
                <p className="font-black text-primary">{new Date().getFullYear() - new Date(formData.birthdate).getFullYear()}</p>
              </div>
              <div className="bg-secondary/5 dark:bg-secondary/10 p-3 rounded-2xl border border-secondary/10 text-center">
                <p className="text-[10px] uppercase font-bold text-foreground-400 tracking-widest">Qon guruhi</p>
                <p className="font-black text-secondary">{formData.bloodType}</p>
              </div>
            </div>

            <Divider className="opacity-50" />

            <div className="w-full space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground-400">Aloqa ma'lumotlari</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon icon="lucide:phone" className="text-gray-500 group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground-600">{formData.phone}</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon icon="lucide:map-pin" className="text-gray-500 group-hover:text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground-600 text-truncate">Toshkent, O'zbekiston</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2 glass-card border-none overflow-hidden">
          <CardHeader className="p-0 border-b border-divider/50 bg-white/30 backdrop-blur-md">
            <Tabs
              aria-label="Profile tabs"
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab as any}
              variant="underlined"
              classNames={{
                tabList: "gap-8 w-full relative rounded-none p-0 px-6",
                cursor: "w-full bg-primary h-1",
                tab: "max-w-fit px-0 h-16 font-bold text-sm uppercase tracking-wider",
                tabContent: "group-data-[selected=true]:text-primary"
              }}
            >
              <Tab key="personal" title="Personal" />
              <Tab key="medical" title="Records" />
              <Tab key="ratings" title="Feedback" />
            </Tabs>
          </CardHeader>
          <CardBody className="p-8">
            <AnimatePresence mode="wait">
              {selectedTab === 'personal' && (
                <motion.div key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black dark:text-white tracking-tight">Shaxsiy tafsilotlar</h3>
                    {!isEditing ? (
                      <Button color="primary" variant="flat" className="rounded-xl font-bold" onPress={() => setIsEditing(true)} startContent={<Icon icon="lucide:edit-3" />}>Tahrirlash</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="light" color="danger" className="rounded-xl font-bold" onPress={() => setIsEditing(false)}>Bekor qilish</Button>
                        <Button color="primary" className="health-gradient text-white rounded-xl font-bold shadow-lg shadow-primary/20" onPress={handleSaveProfile}>Saqlash</Button>
                      </div>
                    )}
                  </div>

                  {savedMessage && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-success/10 text-success p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                      <Icon icon="lucide:check-circle" /> {savedMessage}
                    </motion.div>
                  )}

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-divider">
                        <Avatar src={formData.avatar} size="lg" isBordered color="primary" />
                        <div className="flex-grow">
                          <p className="text-xs font-bold text-foreground-500 uppercase mb-2">Profil rasmi</p>
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="text-xs" />
                        </div>
                      </div>
                      <Input variant="bordered" label="To'liq ism" value={formData.name} onValueChange={(v) => handleInputChange('name', v)} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700 bg-white/50" }} />
                      <Input variant="bordered" label="Email" type="email" value={formData.email} onValueChange={(v) => handleInputChange('email', v)} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700 bg-white/50" }} />
                      <Input variant="bordered" label="Telefon raqam" value={formData.phone} onValueChange={(v) => handleInputChange('phone', v)} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700 bg-white/50" }} />
                      <Input variant="bordered" label="Tug'ilgan sana" type="date" value={formData.birthdate} onValueChange={(v) => handleInputChange('birthdate', v)} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700 bg-white/50" }} />
                      <Input variant="bordered" label="Allergiyalar" value={formData.allergies} onValueChange={(v) => handleInputChange('allergies', v)} className="md:col-span-2" classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700 bg-white/50" }} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      {[
                        { label: "Ism", value: formData.name, icon: "lucide:user" },
                        { label: "Email", value: formData.email, icon: "lucide:mail" },
                        { label: "Telefon", value: formData.phone, icon: "lucide:phone" },
                        { label: "Tug'ilgan sana", value: new Date(formData.birthdate).toLocaleDateString(), icon: "lucide:calendar" },
                        { label: "Jins", value: formData.gender, icon: "lucide:users" },
                        { label: "Qon guruhi", value: formData.bloodType, icon: "lucide:droplet" },
                        { label: "Allergiyalar", value: formData.allergies, icon: "lucide:alert-triangle", full: true },
                        { label: "Surunkali kasalliklar", value: formData.chronicConditions, icon: "lucide:activity", full: true }
                      ].map((item, i) => (
                        <div key={i} className={`flex flex-col gap-1 ${item.full ? 'md:col-span-2' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon icon={item.icon} className="text-gray-400 text-xs" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground-400">{item.label}</p>
                          </div>
                          <p className="font-bold text-foreground-700">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'medical' && (
                <motion.div key="medical" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black dark:text-white tracking-tight">Tibbiy Qaydlar</h3>
                    <Button color="primary" className="health-gradient text-white rounded-xl font-bold shadow-lg shadow-primary/20" startContent={<Icon icon="lucide:upload" />} onPress={() => setShowUploadModal(true)}>Qayd yuklash</Button>
                  </div>
                  <div className="space-y-4">
                    {healthRecords.map(record => (
                      <div key={record.id} className="group p-5 rounded-2xl border border-divider hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                              <Icon icon="lucide:file-text" className="text-primary text-xl" />
                            </div>
                            <div>
                              <h4 className="font-black text-foreground-700 group-hover:text-primary transition-colors">{record.type}</h4>
                              <p className="text-[11px] font-bold text-foreground-400">{new Date(record.date).toLocaleDateString()} • Dr. {record.doctor}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-foreground-600 leading-relaxed font-medium mb-4">{record.description}</p>
                        {record.documents && record.documents.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {record.documents.map((doc, index) => (
                              <Button key={index} variant="flat" size="sm" className="rounded-lg h-8 bg-gray-50 border border-divider group-hover:bg-white transition-colors" startContent={<Icon icon="lucide:download" />}>
                                {doc.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedTab === 'ratings' && (
                <motion.div key="ratings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex justify-between items-center"><h3 className="text-xl font-black dark:text-white tracking-tight">Feedback</h3></div>
                  <div className="space-y-4">
                    {doctorRatings.map(rating => (
                      <div key={rating.id} className="p-5 rounded-2xl border border-divider hover:border-secondary/50 hover:bg-secondary/[0.02] transition-all duration-300">
                        <div className="flex gap-4">
                          <Avatar src={rating.avatar} className="w-12 h-12 shadow-md border-2 border-white" />
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-black text-foreground-700">{rating.doctorName}</h4>
                                <p className="text-[11px] font-bold text-foreground-400 uppercase tracking-tighter">{rating.specialty} • {new Date(rating.date).toLocaleDateString()}</p>
                              </div>
                              <div>{renderStarRating(rating.rating)}</div>
                            </div>
                            <div className="relative p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl italic text-sm font-medium text-foreground-600">
                              "{rating.comment}"
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={showUploadModal} onOpenChange={setShowUploadModal} backdrop="blur">
        <ModalContent className="glass-card border-none !bg-white/95 dark:!bg-gray-900/95 shadow-2xl">
          {(onClose) => (<>
            <ModalHeader className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Yangi Tibbiy Qayd Yuklash</ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-4">
                <Input variant="bordered" label="Sana" type="date" value={newRecord.date} onValueChange={(v) => handleNewRecordChange('date', v)} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Turi" placeholder="Masalan: Qon tahlili" value={newRecord.type} onValueChange={(v) => handleNewRecordChange('type', v)} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Shifokor" placeholder="Masalan: Dr. Azimov" value={newRecord.doctor} onValueChange={(v) => handleNewRecordChange('doctor', v)} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Tavsif" placeholder="Qisqacha mazmuni..." value={newRecord.description} onValueChange={(v) => handleNewRecordChange('description', v)} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <div className="p-6 border-2 border-dashed border-divider rounded-2xl flex flex-col items-center gap-2 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group">
                  <Icon icon="lucide:upload-cloud" className="text-3xl text-gray-400 group-hover:text-primary transition-colors" />
                  <p className="text-sm font-bold text-foreground-500">Hujjatlarni yuklang</p>
                  <input type="file" multiple onChange={handleDocumentUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" className="rounded-xl font-bold" onPress={onClose}>Bekor qilish</Button>
              <Button className="health-gradient text-white rounded-xl font-bold shadow-lg shadow-primary/20" onPress={handleAddRecord}>Saqlash</Button>
            </ModalFooter>
          </>)}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProfilePage;