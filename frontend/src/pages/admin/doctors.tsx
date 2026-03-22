// src/pages/admin/doctors.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Avatar, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea } from '@heroui/react';
import { Icon } from '@iconify/react';
import { db, firebaseConfig } from '../../firebase';
import { collection, getDocs, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  password?: string;
  description: string;
  bio: string;
  history: string;
  avatar: string;
  role: string;
}

const DoctorsAdminPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    email: '',
    password: 'password123',
    description: '',
    bio: '',
    history: '',
    avatar: ''
  });
  const [adding, setAdding] = useState(false);
  const rowsPerPage = 10;

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'doctors'));
      const doctorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(doctorsList);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (doctorId: string) => {
    if (window.confirm("Haqiqatan ham ushbu shifokorni o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, 'doctors', doctorId));
        await deleteDoc(doc(db, 'users', doctorId)); // Sync delete from users
        setDoctors(doctors.filter(d => d.id !== doctorId));
      } catch (error) {
        console.error("Error deleting doctor:", error);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDoctor(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (doctor: Doctor) => {
    setEditingDoctorId(doctor.id);
    setNewDoctor({
      name: doctor.name,
      specialty: doctor.specialty,
      email: doctor.email,
      password: doctor.password || 'password123',
      description: doctor.description || '',
      bio: doctor.bio || '',
      history: doctor.history || '',
      avatar: doctor.avatar || ''
    });
    onOpen();
  };

  const handleSaveDoctor = async () => {
    if (!newDoctor.name || !newDoctor.email || !newDoctor.specialty) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }

    setAdding(true);
    try {
      if (editingDoctorId) {
        // Update existing doctor in Firestore
        const docRef = doc(db, 'doctors', editingDoctorId);
        await setDoc(docRef, {
          ...newDoctor,
          role: 'doctor',
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Sync to users collection
        const userRef = doc(db, 'users', editingDoctorId);
        await setDoc(userRef, {
          uid: editingDoctorId,
          name: newDoctor.name,
          email: newDoctor.email,
          role: 'doctor'
        }, { merge: true });

        setDoctors(doctors.map(d => d.id === editingDoctorId ? { id: editingDoctorId, ...newDoctor, role: 'doctor' } as Doctor : d));
      } else {
        // --- 1. Create Auth User using secondary Firebase instance ---
        // This avoids logging out the admin
        const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
        const secondaryAuth = getAuth(secondaryApp);

        let uid = '';
        try {
          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newDoctor.email, newDoctor.password || 'password123');
          uid = userCredential.user.uid;
          await signOut(secondaryAuth);
          await deleteApp(secondaryApp);
        } catch (authError: any) {
          console.error("Auth creation error:", authError);
          // If user already exists in Auth, we might still want to create Firestore records if they are missing
          if (authError.code === 'auth/email-already-in-use') {
            alert("Ushbu email bilan foydalanuvchi allaqachon mavjud!");
            setAdding(false);
            return;
          }
          throw authError;
        }

        // --- 2. Create Firestore Records using the Auth UID ---
        const doctorData = { ...newDoctor, role: 'doctor', createdAt: serverTimestamp() };
        await setDoc(doc(db, 'doctors', uid), doctorData);

        const userData = {
          uid: uid,
          name: newDoctor.name,
          email: newDoctor.email,
          role: 'doctor',
          avatar: newDoctor.avatar || `https://i.pinimg.com/736x/89/90/48/899048ab0cc455154006fdb9676964b3.jpg`,
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', uid), userData);

        setDoctors([{ id: uid, ...newDoctor, role: 'doctor' } as Doctor, ...doctors]);
      }

      handleResetModal();
      onClose();
    } catch (error: any) {
      console.error("Error saving doctor:", error);
      alert(`Xatolik yuz berdi: ${error.message}`);
    } finally {
      setAdding(false);
    }
  };

  const handleResetModal = () => {
    setEditingDoctorId(null);
    setNewDoctor({
      name: '',
      specialty: '',
      email: '',
      password: 'password123',
      description: '',
      bio: '',
      history: '',
      avatar: ''
    });
  };

  const togglePasswordVisibility = (doctorId: string) => {
    setShowPassword(prev => ({ ...prev, [doctorId]: !prev[doctorId] }));
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDoctors.slice(start, end);
  }, [filteredDoctors, currentPage]);

  if (loading && doctors.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Yuklanmoqda..." color="primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Shifokorlar boshqaruvi</h1>
        <p className="text-foreground-500">Tizimdagi barcha shifokorlar ro'yxati</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <Input
              placeholder="Shifokorlarni qidirish..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" />}
              className="w-full sm:max-w-xs"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <Button color="primary" onPress={() => { handleResetModal(); onOpen(); }} startContent={<Icon icon="lucide:plus" />}>Qo'shish</Button>
              <Button variant="flat" onPress={fetchDoctors} startContent={<Icon icon="lucide:refresh-cw" />}>Yangilash</Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            aria-label="Doctors table"
            bottomContent={
              <div className="flex justify-center">
                <Pagination
                  total={Math.ceil(filteredDoctors.length / rowsPerPage) || 1}
                  page={currentPage}
                  onChange={setCurrentPage}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>SHIFOKOR</TableColumn>
              <TableColumn>YO'NALISH</TableColumn>
              <TableColumn>EMAIL / PAROL</TableColumn>
              <TableColumn>AMALLAR</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Shifokorlar topilmadi">
              {paginatedDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={doctor.avatar} name={doctor.name} size="sm" />
                      <span>{doctor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{doctor.email}</span>
                      <div className="flex items-center gap-1 group">
                        <span className="text-xs text-foreground-400 font-mono">
                          {showPassword[doctor.id] ? (doctor.password || 'password123') : '••••••••'}
                        </span>
                        <Button isIconOnly size="sm" variant="light" className="h-6 w-6" onPress={() => togglePasswordVisibility(doctor.id)}>
                          <Icon icon={showPassword[doctor.id] ? "lucide:eye-off" : "lucide:eye"} className="text-xs" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button isIconOnly size="sm" variant="flat" color="primary" onPress={() => handleEditClick(doctor)}>
                        <Icon icon="lucide:edit-3" />
                      </Button>
                      <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => handleDelete(doctor.id)}>
                        <Icon icon="lucide:trash-2" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add Doctor Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editingDoctorId ? "Shifokorni tahrirlash" : "Yangi shifokor qo'shish"}</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex flex-col items-center gap-4 py-4 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20">
                    <Avatar src={newDoctor.avatar} className="w-24 h-24 text-large shadow-lg" showFallback />
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs font-bold text-foreground-500 uppercase tracking-widest">Profil rasmi</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="flat" color="primary" className="relative group">
                          Fayl tanlash
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </Button>
                        <Button size="sm" variant="light" color="danger" onPress={() => setNewDoctor({ ...newDoctor, avatar: '' })}>O'chirish</Button>
                      </div>
                    </div>
                  </div>
                  <Input
                    label="Ism-sharif"
                    placeholder="Dr. Ismingiz"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  />
                  <Input
                    label="Email"
                    placeholder="doctor@health.uz"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  />
                  <Input
                    label="Parol"
                    placeholder="Tizimga kirish uchun parol"
                    type="text"
                    value={newDoctor.password}
                    onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                    endContent={<Icon icon="lucide:key" className="text-foreground-300" />}
                  />
                  <Input
                    label="Yo'nalish"
                    placeholder="Kardiolog, Nevrolog va h.k."
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Avatar URL (ixtiyoriy, havola orqali)"
                      placeholder="https://..."
                      value={newDoctor.avatar}
                      onChange={(e) => setNewDoctor({ ...newDoctor, avatar: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea
                      label="Qisqacha tavsif"
                      placeholder="Shifokor haqida qisqacha..."
                      value={newDoctor.description}
                      onChange={(e) => setNewDoctor({ ...newDoctor, description: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea
                      label="Biografiya"
                      placeholder="Batafsil ma'lumot..."
                      value={newDoctor.bio}
                      onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Textarea
                      label="Tajriba va Tarix"
                      placeholder="O'qigan joylari va tajribasi..."
                      value={newDoctor.history}
                      onChange={(e) => setNewDoctor({ ...newDoctor, history: e.target.value })}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" color="danger" onPress={onClose}>Bekor qilish</Button>
                <Button color="primary" onPress={handleSaveDoctor} isLoading={adding}>SAQLASH</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DoctorsAdminPage;