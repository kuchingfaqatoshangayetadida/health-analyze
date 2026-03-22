// src/pages/user/medications.tsx

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface Medication { id: string; type: string; dosagePerDay: string; doctor: string; startDate: string; }
const DORI_TURLARI = ["Paratsetamol", "Aspirin", "Ibuprofen", "Vitamin D", "Amoksiklav", "Nurofen", "Azitromitsin",];
const DOZALAR = ["1 marta", "2 marta", "3 marta", "4 marta"];
const DOCTORLAR = ["Dr. Abduraxmanov", "Dr. Sodiqova", "Dr. Karimov", "Dr. Rustamova", "Dr. Tulegenov",];

const Medications: React.FC = () => {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [newMed, setNewMed] = useState<Omit<Medication, 'id' | 'startDate'>>({ type: "", dosagePerDay: "", doctor: "" });

  useEffect(() => {
    const saved = localStorage.getItem("medications");
    if (saved) setMeds(JSON.parse(saved));
  }, []);

  const saveToStorage = (data: Medication[]) => {
    setMeds(data);
    localStorage.setItem("medications", JSON.stringify(data));
  };

  const handleSave = () => {
    if (!newMed.type || !newMed.dosagePerDay || !newMed.doctor) {
      return;
    }
    const updated = [{ ...newMed, id: Date.now().toString(), startDate: new Date().toISOString().split("T")[0], }, ...meds];
    saveToStorage(updated);
    setShowModal(false);
    setNewMed({ type: "", dosagePerDay: "", doctor: "" });
  };

  const deleteMed = (id: string) => {
    const updated = meds.filter((m) => m.id !== id);
    saveToStorage(updated);
  };

  const filteredMeds = meds.filter((m) =>
    m.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight dark:text-white">Dori Vositalari</h1>
          <p className="text-foreground-500 font-medium">Qabul qilinayotgan dorilar va vitaminlar nazorati</p>
        </div>
        <Button
          className="health-gradient text-white font-black rounded-xl shadow-lg shadow-primary/20 h-12 px-6"
          onPress={() => setShowModal(true)}
          startContent={<Icon icon="lucide:plus" className="text-xl" />}
        >
          YANGI DORI QO'SHISH
        </Button>
      </div>

      <Card className="glass-card border-none overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center bg-white/30 backdrop-blur-md px-8 py-6 border-b border-divider/50 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl health-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <Icon icon="lucide:search" className="text-white text-xl" />
            </div>
            <Input
              placeholder="Dori qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
              variant="flat"
              classNames={{
                inputWrapper: "bg-white/50 backdrop-blur-sm rounded-xl border-none"
              }}
            />
          </div>
          <Button
            variant="flat"
            size="sm"
            className="rounded-lg font-bold bg-white/50 h-10 px-4"
            startContent={<Icon icon="lucide:download" />}
            onPress={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(meds, null, 2));
              const a = document.createElement("a");
              a.href = dataStr;
              a.download = "dorilar.json";
              a.click();
            }}
          >
            YUKLAB OLISH (JSON)
          </Button>
        </CardHeader>

        <CardBody className="p-0">
          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {filteredMeds.length > 0 ? (
                filteredMeds.map((med, index) => (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 border-b border-divider/40 last:border-b-0 hover:bg-white/40 transition-all duration-300 group flex justify-between items-center"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/5 flex-shrink-0 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                        <Icon icon="lucide:pill" className="text-secondary text-3xl" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-foreground-800 tracking-tight">{med.type}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-1">
                          <p className="text-sm font-bold text-foreground-500 flex items-center gap-1.5">
                            <Icon icon="lucide:clock" className="text-secondary" /> {med.dosagePerDay} / kun
                          </p>
                          <p className="text-sm font-bold text-foreground-400 flex items-center gap-1.5">
                            <Icon icon="lucide:user" className="text-gray-400" /> Dr. {med.doctor}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground-400">
                            Boshlangan: {med.startDate}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      className="rounded-xl bg-danger/5 hover:bg-danger/10 text-danger transition-colors"
                      onPress={() => deleteMed(med.id)}
                    >
                      <Icon icon="lucide:trash-2" className="text-xl" />
                    </Button>
                  </motion.div>
                ))
              ) : (
                <div className="p-24 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 flex items-center justify-center mb-2">
                    <Icon icon="lucide:pill" className="text-4xl text-gray-300 opacity-50" />
                  </div>
                  <h3 className="text-xl font-black text-foreground-300">Dori ro'yxati bo'sh</h3>
                  <p className="text-foreground-400 max-w-xs mx-auto">Siz hali hech qanday dori vositasini qo'shmagansiz.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal isOpen={showModal} onOpenChange={setShowModal} backdrop="blur">
        <ModalContent className="glass-card border-none !bg-white/95 dark:!bg-gray-900/95 shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">Dori Qo'shish</ModalHeader>
              <ModalBody className="py-6 flex flex-col gap-5">
                <Select
                  label="Dori turi"
                  placeholder="Dori nomini tanlang"
                  variant="bordered"
                  classNames={{ trigger: "rounded-xl border-divider" }}
                  selectedKeys={newMed.type ? [newMed.type] : []}
                  onChange={(e) => setNewMed({ ...newMed, type: e.target.value })}
                >
                  {DORI_TURLARI.map((item) => (<SelectItem key={item} textValue={item}>{item}</SelectItem>))}
                </Select>

                <Select
                  label="Dozalash"
                  placeholder="Kunlik miqdor"
                  variant="bordered"
                  classNames={{ trigger: "rounded-xl border-divider" }}
                  selectedKeys={newMed.dosagePerDay ? [newMed.dosagePerDay] : []}
                  onChange={(e) => setNewMed({ ...newMed, dosagePerDay: e.target.value })}
                >
                  {DOZALAR.map((item) => (<SelectItem key={item} textValue={item}>{item}</SelectItem>))}
                </Select>

                <Select
                  label="Shifokor"
                  placeholder="Tavsiya qilgan shifokor"
                  variant="bordered"
                  classNames={{ trigger: "rounded-xl border-divider" }}
                  selectedKeys={newMed.doctor ? [newMed.doctor] : []}
                  onChange={(e) => setNewMed({ ...newMed, doctor: e.target.value })}
                >
                  {DOCTORLAR.map((item) => (<SelectItem key={item} textValue={item}>{item}</SelectItem>))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="rounded-xl font-bold" onPress={onClose}>Bekor qilish</Button>
                <Button className="health-gradient text-white rounded-xl font-bold shadow-lg shadow-primary/20" onPress={handleSave}>Saqlash</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Medications;