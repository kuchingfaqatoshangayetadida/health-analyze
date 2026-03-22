// src/pages/register.tsx

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Card, CardBody, Input, Button, Link, Checkbox, Divider, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/auth-context.tsx';
import { motion } from 'framer-motion';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const history = useHistory();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      history.push('/user/dashboard');
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu email manzili allaqachon ro\'yxatdan o\'tgan.');
      } else if (err.code === 'auth/weak-password') {
        setError('Parol juda oddiy. Kamida 6 ta belgi ishlating.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email manzili noto\'g\'ri formatda.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Parol orqali kirish Firebase Console\'da yoqilmagan.');
      } else {
        setError('Ro\'yxatdan o\'tishda xatolik: ' + (err.message || 'Noma\'lum xato'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden p-6">
      {/* Background Decor */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-lg z-10">
        <Card className="glass-card border-none !bg-white/60 dark:!bg-gray-900/60 backdrop-blur-3xl shadow-2xl p-4 sm:p-10">
          <CardBody className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 items-center text-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-16 h-16 rounded-2xl health-gradient flex items-center justify-center shadow-xl shadow-primary/30 mb-2"
              >
                <Icon icon="lucide:heart-pulse" className="text-white text-3xl" />
              </motion.div>
              <h1 className="text-3xl font-black tracking-tight dark:text-white">Hisob Yaratish</h1>
              <p className="text-foreground-500 font-medium uppercase tracking-widest text-sm">Boshlash uchun ro'yxatdan o'ting</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-danger/10 border-l-4 border-danger text-danger p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                <Icon icon="lucide:alert-circle" className="text-xl" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="space-y-4">
                <Input
                  label="To'liq ism"
                  placeholder="Ismingizni kiriting"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="bordered"
                  size="lg"
                  startContent={<Icon icon="lucide:user" className="text-foreground-400" />}
                  classNames={{ inputWrapper: "rounded-2xl border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50" }}
                  required
                />

                <Input
                  label="Email"
                  placeholder="Email manzilingiz"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="bordered"
                  size="lg"
                  startContent={<Icon icon="lucide:mail" className="text-foreground-400" />}
                  classNames={{ inputWrapper: "rounded-2xl border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50" }}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Parol"
                    placeholder="********"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="bordered"
                    size="lg"
                    startContent={<Icon icon="lucide:lock" className="text-foreground-400" />}
                    classNames={{ inputWrapper: "rounded-2xl border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50" }}
                    required
                  />

                  <Input
                    label="Tasdiqlash"
                    placeholder="********"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="bordered"
                    size="lg"
                    startContent={<Icon icon="lucide:lock" className="text-foreground-400" />}
                    classNames={{ inputWrapper: "rounded-2xl border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50" }}
                    required
                  />
                </div>
              </div>

              <Checkbox size="sm" classNames={{ label: "text-foreground-500 font-medium" }} required>
                Men <Link href="#" className="font-bold text-primary">Shartlarga</Link> va <Link href="#" className="font-bold text-primary">Siyosatga</Link> roziman
              </Checkbox>

              <Button
                type="submit"
                size="lg"
                className="health-gradient text-white font-black text-lg py-7 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                fullWidth
                isDisabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="sm" color="white" /> : 'ROYXATDAN OTISH'}
              </Button>
            </form>

            <div className="flex items-center gap-4 py-2">
              <Divider className="flex-1 opacity-50" />
              <p className="text-foreground-400 text-xs font-bold uppercase tracking-widest">YOKI</p>
              <Divider className="flex-1 opacity-50" />
            </div>

            <div className="flex flex-col gap-6 items-center">
              <Button
                variant="bordered"
                size="lg"
                startContent={<Icon icon="logos:google-icon" className="text-xl" />}
                fullWidth
                className="rounded-2xl border-gray-200 dark:border-gray-700 font-bold dark:text-white bg-white/50 dark:bg-gray-800/50"
              >
                Google bilan davom etish
              </Button>

              <p className="text-foreground-500 font-medium">
                Hisobingiz bormi? <Link href="/login" className="font-bold text-primary hover:underline text-lg ml-1">Kirish</Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;