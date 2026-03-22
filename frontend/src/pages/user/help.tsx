// src/pages/user/help.tsx

import React from 'react';
import { Card, CardBody, CardHeader, Button, Input, Textarea, Accordion, AccordionItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const faqData = [
  { title: "Uchrashuvni qanday belgilash mumkin?", content: "Dashboard sahifasidagi 'Uchrashuvlar' bo'limida 'Kalendarni ko'rish' tugmasini bosing. Ochilgan sahifada bo'sh vaqtni tanlab, shifokor va xizmat turini belgilang." },
  { title: "Shifokor bilan onlayn maslahat qanday ishlaydi?", content: "Kutilayotgan uchrashuvlar ro'yxatida video qo'ng'iroq belgisini bosish orqali belgilangan vaqtda onlayn maslahatni boshlashingiz mumkin." },
  { title: "Tibbiy qaydlarimni qanday yuklab olsam bo'ladi?", content: "Profil sahifasidagi 'Tibbiy qaydlar' bo'limiga o'ting. Har bir qayd yonida yuklab olish (download) belgisi mavjud." },
  { title: "Parolni qanday tiklash mumkin?", content: "Tizimga kirish oynasida 'Parolni unutdingizmi?' havolasini bosing va email manzilingizni kiriting. Tiklash uchun yo'riqnoma pochtangizga yuboriladi." }
];

const HelpPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 items-center text-center max-w-2xl mx-auto"
      >
        <div className="w-16 h-16 rounded-3xl health-gradient flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
          <Icon icon="lucide:life-buoy" className="text-4xl text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight dark:text-white uppercase tracking-[0.2em]">Yordam Markazi</h1>
        <p className="text-foreground-500 font-medium text-lg">Platformadan foydalanish bo'yicha yo'riqnomalar va qo'llab-quvvatlash xizmati</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* FAQ bo'limi */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon icon="lucide:help-circle" className="text-xl text-primary" />
            </div>
            <h2 className="text-2xl font-black tracking-tight dark:text-white">Ko'p Beriladigan Savollar</h2>
          </div>
          <Card className="glass-card border-none overflow-hidden p-2">
            <Accordion
              variant="light"
              className="px-4"
              itemClasses={{
                title: "font-bold text-foreground-700 hover:text-primary transition-colors py-4",
                content: "text-foreground-500 font-medium pb-6 leading-relaxed",
                indicator: "text-primary font-black"
              }}
            >
              {faqData.map((faq, index) => (
                <AccordionItem key={index} title={faq.title} aria-label={faq.title}>
                  {faq.content}
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              { title: "Video darsliklar", desc: "Platformadan foydalanish bo'yicha video qo'llanmalar", icon: "lucide:play-circle" },
              { title: "Hujjatlar", desc: "Batafsil texnik hujjatlar va foydalanish shartlari", icon: "lucide:file-text" }
            ].map((item, i) => (
              <Card key={i} className="glass-card border-none hover:bg-white/50 transition-colors cursor-pointer group">
                <CardBody className="p-6 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10">
                    <Icon icon={item.icon} className="text-2xl text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground-700">{item.title}</h3>
                    <p className="text-xs text-foreground-400 font-medium">{item.desc}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Qo'llab-quvvatlash bilan bog'lanish */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Icon icon="lucide:mail" className="text-xl text-secondary" />
              </div>
              <h2 className="text-2xl font-black tracking-tight dark:text-white">Murojaat Yo'llash</h2>
            </div>
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="bg-white/30 backdrop-blur-md px-8 py-6 border-b border-divider/50">
                <p className="text-sm font-bold text-foreground-500">Mutaxassislarimiz tez orada siz bilan bog'lanishadi</p>
              </CardHeader>
              <CardBody className="p-8 space-y-5">
                <Input
                  label="To'liq ismingiz"
                  placeholder="Masalan: Aziz Rahimov"
                  variant="bordered"
                  classNames={{ inputWrapper: "rounded-xl border-divider bg-white/50" }}
                />
                <Input
                  type="email"
                  label="Email manzil"
                  placeholder="example@mail.com"
                  variant="bordered"
                  classNames={{ inputWrapper: "rounded-xl border-divider bg-white/50" }}
                />
                <Textarea
                  label="Xabar matni"
                  placeholder="Muammo yoki taklifingizni bu yerda bayon qiling..."
                  variant="bordered"
                  minRows={4}
                  classNames={{ inputWrapper: "rounded-xl border-divider bg-white/50" }}
                />
                <Button className="health-gradient text-white font-black rounded-xl h-14 mt-4 shadow-lg shadow-primary/20 text-lg uppercase tracking-widest" fullWidth>
                  XABARNI YUBORISH
                </Button>
              </CardBody>
              <div className="bg-gray-50/50 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground-400">Yoki qo'ng'iroq qiling: +998 71 123 45 67</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;