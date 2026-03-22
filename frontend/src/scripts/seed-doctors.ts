// src/scripts/seed-doctors.ts

import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const specialists = [
    {
        id: 'THERAPIST',
        name: 'Terapevt (Uliwma oqitıwshı)',
        specialty: 'Therapist',
        description: 'Ishki a\'za awırıwları, suwıq tiyiw, dene qızıwı.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=1',
        bio: 'Tajribali terapevt, 15 yillik ish tajribasiga ega. Umumiy salomatlik masalalari bo\'yicha yordam beradi.',
        history: 'Toshkent Tibbiyot Akademiyasini tamomlagan. Ko\'plab xalqaro konferensiyalar ishtirokchisi.'
    },
    {
        id: 'CARDIOLOGIST',
        name: 'Kardiolog',
        specialty: 'Cardiologist',
        description: 'Júrek hám qan-tamır sistemasındagı awırıwlar.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=2',
        bio: 'Yurak-qon tomir tizimi bo\'yicha mutaxassis. Gipertoniya va aritmiya kasalliklarini davolashda katta tajribaga ega.',
        history: 'Kardiologiya markazida 10 yil davomida ilmiy xodim bo\'lib ishlagan.'
    },
    {
        id: 'NEUROLOGIST',
        name: 'Nevropatolog',
        specialty: 'Neurologist',
        description: 'Nerv sisteması, bas awırıwı, bel awırıwı.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=3',
        bio: 'Asab tizimi kasalliklari bo\'yicha mutaxassis. Kuchli bosh og\'riqlari va uyqusizlik muammolarini hal qiladi.',
        history: 'Rossiya Federatsiyasi Nevrologiya institutida malaka oshirgan.'
    },
    {
        id: 'LOR',
        name: 'LOR (Otolaringolog)',
        specialty: 'Otolaryngologist',
        description: 'Qulaq, murın hám tamaq awırıwları.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=4',
        bio: 'Quloq, burun va tomoq kasalliklari bo\'yicha jarroh va terapevt.',
        history: 'Respublika ixtisoslashtirilgan LOR markazida faoliyat yuritadi.'
    },
    {
        id: 'STOMATOLOGIST',
        name: 'Stomatolog',
        specialty: 'Stomatologist',
        description: 'Tis hám awız boslığı awırıwları.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=5',
        bio: 'Zamonaviy stomatologiya va implantologiya mutaxassisi.',
        history: 'Germaniyada stomatologik texnologiyalar bo\'yicha kurslarni o\'tagan.'
    },
    {
        id: 'OPHTHALMOLOGIST',
        name: 'Oftalmolog (Okulist)',
        specialty: 'Ophthalmologist',
        description: 'Kóz awırıwları hám kóriw qábileti.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=6',
        bio: 'Ko\'z nuri va ko\'rish qobiliyatini tiklash bo\'yicha mutaxassis.',
        history: 'Ko\'z mikroxirurgiyasi markazida ko\'plab muvaffaqiyatli amaliyotlar o\'tkazgan.'
    },
    {
        id: 'PEDIATRICIAN',
        name: 'Pediatr',
        specialty: 'Pediatrician',
        description: 'Balalar awırıwları hám rawajlanıwı.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=7',
        bio: 'Bolalar salomatligi va rivojlanishi bo\'yicha tajribali shifokor.',
        history: 'Pediatriya institutida uzoq yillar davomida kafedra mudiri bo\'lib ishlagan.'
    },
    {
        id: 'GASTROENTEROLOGIST',
        name: 'Gastroenterolog',
        specialty: 'Gastroenterologist',
        description: 'Asqazan hám ishek sisteması awırıwları.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=8',
        bio: 'Ovqat hazm qilish tizimi va oshqozon kasalliklari bo\'yicha mutaxassis.',
        history: 'Gastroenterologiya ilmiy-tadqiqot institutida faoliyat ko\'rsatgan.'
    },
    {
        id: 'DERMATOLOGIST',
        name: 'Dermatolog',
        specialty: 'Dermatologist',
        description: 'Teri hám tırnaq awırıwları.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=9',
        bio: 'Teri va tirnoq kasalliklarini davolash bo\'yicha mutaxassis.',
        history: 'Dermatovenerologiya dispanserida 12 yillik tajribaga ega.'
    },
    {
        id: 'SURGEON',
        name: 'Xirurg',
        specialty: 'Surgeon',
        description: 'Operativ kómek kerek bolgan jaraqatlar.',
        avatar: 'https://avatar.iran.liara.run/public/doctor?n=10',
        bio: 'Umumiy jarrohlik bo\'yicha yuqori malakali mutaxassis.',
        history: 'Shoshilinch tibbiy yordam markazida yetakchi jarroh.'
    }
];

export const seedDoctors = async () => {
    try {
        for (const docInfo of specialists) {
            const doctorId = docInfo.id.toLowerCase();
            await setDoc(doc(db, 'doctors', docInfo.id), {
                ...docInfo,
                role: 'doctor',
                email: `${doctorId}@gmail.com`,
                password: 'password123', // Demo uchun oddiy parol
                avatar: `https://xsgames.co/randomusers/assets/avatars/male/${Math.floor(Math.random() * 50)}.jpg`
            });

            // Shuningdek users kolleksiyasiga ham qo'shamiz (login uchun)
            await setDoc(doc(db, 'users', docInfo.id), {
                uid: docInfo.id,
                name: docInfo.name,
                email: `${doctorId}@gmail.com`,
                role: 'doctor',
                createdAt: new Date().toISOString()
            });
        }
        console.log("Doctors seeded successfully!");
    } catch (error) {
        console.error("Error seeding doctors:", error);
    }
};
