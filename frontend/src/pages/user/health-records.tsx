// src/pages/user/health-records.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Modal, ModalBody, ModalContent, ModalHeader, ModalFooter } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

interface Record { id: string; date: string; type: string; description: string; doctor: string; additionalInfo?: string; }

const initialRecords: Record[] = [
  { id: '1', date: '2023-09-01', type: 'Tekshiruv', description: 'Yillik jismoniy imtihon', doctor: 'Dr. Azimov' },
  { id: '2', date: '2023-08-15', type: 'Qon tahlili', description: 'Umumiy qon tahlili natijalari', doctor: 'Dr. Karimova' },
];

const HealthRecords: React.FC = () => {
  const [records, setRecords] = useState<Record[]>(initialRecords);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: '', description: '', doctor: '', additionalInfo: '' });
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('healthRecords');
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  const addRecord = () => {
    const newRecordData = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], ...newRecord };
    const updated = [newRecordData, ...records];
    setRecords(updated);
    localStorage.setItem('healthRecords', JSON.stringify(updated));
    setNewRecord({ type: '', description: '', doctor: '', additionalInfo: '' });
    setIsAddModalOpen(false);
  };

  const updateRecord = () => {
    if (editRecord) {
      const updatedRecords = records.map((r) => r.id === editRecord.id ? editRecord : r);
      setRecords(updatedRecords);
      localStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
      setEditRecord(null);
      setIsEditModalOpen(false);
    }
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem('healthRecords', JSON.stringify(updated));
    setIsDeleteConfirmOpen(false);
    setRecordToDelete(null);
  };

  const filteredRecords = records.filter(r =>
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    (r.additionalInfo?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight dark:text-white">Salomatlik Tarixi</h1>
          <p className="text-foreground-500 font-medium">Barcha tibbiy ko'riklar va tahlillar qaydi</p>
        </div>
        <Button
          className="health-gradient text-white font-black rounded-xl shadow-lg shadow-primary/20 h-12 px-6"
          onPress={() => setIsAddModalOpen(true)}
          startContent={<Icon icon="lucide:plus" className="text-xl" />}
        >
          YANGI QAYD QO'SHISH
        </Button>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center bg-white/30 backdrop-blur-md px-8 py-6 border-b border-divider/50 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl health-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Icon icon="lucide:search" className="text-white text-xl" />
            </div>
            <Input
              placeholder="Qaydlarni qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
              variant="flat"
              classNames={{
                inputWrapper: "bg-white/50 backdrop-blur-sm rounded-xl border-none"
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="flat" size="sm" className="rounded-lg font-bold bg-white/50" startContent={<Icon icon="lucide:filter" />}>FILTR</Button>
            <Button variant="flat" size="sm" className="rounded-lg font-bold bg-white/50" startContent={<Icon icon="lucide:download" />}>EKSPORT</Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 border-b border-divider/40 last:border-b-0 hover:bg-white/40 transition-all duration-300 group flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="flex gap-5 flex-grow">
                      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex-shrink-0 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Icon icon="lucide:clipboard-list" className="text-primary text-3xl" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h3 className="font-black text-xl text-foreground-800 tracking-tight">{record.type}</h3>
                          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-foreground-500 border border-divider/50">
                            {record.date}
                          </div>
                        </div>
                        <p className="text-foreground-600 font-medium leading-relaxed max-w-2xl">{record.description}</p>
                        {record.additionalInfo && (
                          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-warning/5 border border-warning/10 rounded-xl w-fit">
                            <Icon icon="lucide:info" className="text-warning text-sm" />
                            <p className="text-xs font-bold text-warning/80">{record.additionalInfo}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-sm font-bold text-foreground-400">
                          <Icon icon="lucide:user" className="text-gray-400" />
                          <span>Shifokor: <span className="text-foreground-600">Dr. {record.doctor}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Button
                        isIconOnly
                        variant="flat"
                        size="md"
                        className="rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
                        onPress={() => { setEditRecord(record); setIsEditModalOpen(true); }}
                      >
                        <Icon icon="lucide:edit-3" className="text-xl" />
                      </Button>
                      <Button
                        isIconOnly
                        variant="flat"
                        color="danger"
                        size="md"
                        className="rounded-xl bg-danger/5 hover:bg-danger/10 text-danger transition-colors"
                        onPress={() => { setRecordToDelete(record.id); setIsDeleteConfirmOpen(true); }}
                      >
                        <Icon icon="lucide:trash-2" className="text-xl" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-24 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 flex items-center justify-center mb-2">
                    <Icon icon="lucide:file-x" className="text-4xl text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black text-foreground-300">Hech qanday qayd topilmadi</h3>
                  <p className="text-foreground-400 max-w-xs mx-auto">Qidiruv natijasida hech narsa chiqshmadi yoki hali qaydlar kiritilmagan.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardBody>
      </Card>

      {/* Add Record Modal */}
      <Modal isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen} backdrop="blur">
        <ModalContent className="glass-card border-none !bg-white/95 dark:!bg-gray-900/95 shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Yangi qayd qo‘shish</ModalHeader>
              <ModalBody className="py-6 space-y-4">
                <Input variant="bordered" label="Sana" type="date" defaultValue={new Date().toISOString().split('T')[0]} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Turi" placeholder="Masalan: Tekshiruv" value={newRecord.type} onValueChange={(v) => setNewRecord({ ...newRecord, type: v })} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Tavsif" placeholder="Qaydni tasvirlab bering" value={newRecord.description} onValueChange={(v) => setNewRecord({ ...newRecord, description: v })} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Doktor" placeholder="Doktor ismi" value={newRecord.doctor} onValueChange={(v) => setNewRecord({ ...newRecord, doctor: v })} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Qo‘shimcha ma‘lumot" placeholder="Qo‘shimcha izohlar" value={newRecord.additionalInfo} onValueChange={(v) => setNewRecord({ ...newRecord, additionalInfo: v })} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="rounded-xl font-bold" onPress={onClose}>Bekor qilish</Button>
                <Button className="health-gradient text-white rounded-xl font-bold shadow-lg shadow-primary/20" onPress={addRecord}>Saqlash</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Record Modal */}
      <Modal isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} backdrop="blur">
        <ModalContent className="glass-card border-none !bg-white/95 dark:!bg-gray-900/95 shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="font-black text-2xl tracking-tight">Qaydni tahrirlash</ModalHeader>
              <ModalBody className="py-6 space-y-4">
                <Input variant="bordered" label="Turi" value={editRecord?.type || ''} onValueChange={(v) => setEditRecord(p => ({ ...p!, type: v } as Record))} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Tavsif" value={editRecord?.description || ''} onValueChange={(v) => setEditRecord(p => ({ ...p!, description: v } as Record))} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Doktor" value={editRecord?.doctor || ''} onValueChange={(v) => setEditRecord(p => ({ ...p!, doctor: v } as Record))} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
                <Input variant="bordered" label="Qo‘shimcha ma‘lumot" value={editRecord?.additionalInfo || ''} onValueChange={(v) => setEditRecord(p => ({ ...p!, additionalInfo: v } as Record))} classNames={{ inputWrapper: "rounded-xl border-gray-200 dark:border-gray-700" }} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="rounded-xl font-bold" onPress={onClose}>Bekor qilish</Button>
                <Button className="health-gradient text-white rounded-xl font-bold shadow-lg shadow-primary/20" onPress={updateRecord}>Yangilash</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} backdrop="blur">
        <ModalContent className="glass-card border-none !bg-white/95 dark:!bg-gray-900/95 shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="font-black text-2xl tracking-tight text-danger">O'chirishni tasdiqlash</ModalHeader>
              <ModalBody className="py-2">
                <p className="font-medium text-foreground-600">Ushbu qaydni o'chirishni xohlaysizmi? Bu amal qaytarib bo'lmaydi va barcha ma'lumotlar yo'qoladi.</p>
              </ModalBody>
              <ModalFooter className="mt-4">
                <Button variant="light" className="rounded-xl font-bold" onPress={onClose}>Bekor qilish</Button>
                <Button color="danger" className="rounded-xl font-bold shadow-lg shadow-danger/20" onPress={() => recordToDelete && deleteRecord(recordToDelete)}>O'chirish</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default HealthRecords;