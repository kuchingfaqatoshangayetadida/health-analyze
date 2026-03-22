// src/pages/login.tsx

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'; // v5 uchun
import { Card, CardBody, Input, Button, Link, Checkbox, Divider, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/auth-context.tsx';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginWithGoogle, user, isAuthenticated, isLoading: authIsLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const history = useHistory();

  // =========================================================================
  // XATO AYNAN SHU YERDA EDI - DOCTOR UCHUN SHART QO'SHILDI
  // =========================================================================
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        history.push('/admin/dashboard');
      } else if (user.role === 'doctor') { // <-- BU QATOR QO'SHILDI
        history.push('/doctor/dashboard');
      } else {
        history.push('/user/dashboard');
      }
    }
  }, [isAuthenticated, user, history]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      // useEffect o'zi yo'naltiradi
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Email yoki parol noto\'g\'ri.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Haddan tashqari ko\'p urinishlar. Iltimos, keyinroq qayta urinib ko\'ring.');
      } else {
        setError(error.message || 'Login yoki parol xato');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Google orqali kirishda xatolik yuz berdi');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  if (authIsLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900"><Spinner size="lg" color="primary" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden p-6">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-lg z-10">
        <Card className="glass-card border-none !bg-white/60 dark:!bg-gray-900/60 backdrop-blur-3xl shadow-2xl p-4 sm:p-10">
          <CardBody className="flex flex-col gap-10">
            <div className="flex flex-col gap-3 items-center text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl health-gradient flex items-center justify-center shadow-xl shadow-primary/30 mb-4"
              >
                <Icon icon="lucide:heart-pulse" className="text-white text-4xl" />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">HealthAI</h1>
              <p className="text-foreground-500 font-medium text-lg uppercase tracking-widest">Xush kelibsiz</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-danger/10 border-l-4 border-danger text-danger p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                <Icon icon="lucide:alert-circle" className="text-xl" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="space-y-4">
                <Input
                  label="Email Manzili"
                  placeholder="Ismingizni kiriting..."
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="bordered"
                  size="lg"
                  startContent={<Icon icon="lucide:mail" className="text-foreground-400" />}
                  classNames={{ inputWrapper: "rounded-2xl border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50" }}
                  required
                />
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
              </div>

              <div className="flex items-center justify-between px-1">
                <Checkbox color="primary" size="sm" classNames={{ label: "text-foreground-500 font-medium" }}>Eslab qolish</Checkbox>
                <Link href="#" size="sm" className="font-bold text-primary hover:underline">Parolni unutdingizmi?</Link>
              </div>

              <Button
                type="submit"
                size="lg"
                className="health-gradient text-white font-black text-lg py-7 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
                fullWidth
                isDisabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="sm" color="white" /> : 'KIRISH'}
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
                startContent={isGoogleSubmitting ? <Spinner size="sm" /> : <Icon icon="logos:google-icon" className="text-xl" />}
                fullWidth
                className="rounded-2xl border-gray-200 dark:border-gray-700 font-bold dark:text-white bg-white/50 dark:bg-gray-800/50"
                onPress={handleGoogleLogin}
                isDisabled={isGoogleSubmitting || isSubmitting}
              >
                {isGoogleSubmitting ? 'KIRILMOQDA...' : 'Google bilan kirish'}
              </Button>

              <p className="text-foreground-500 font-medium">
                Hisobingiz yo'qmi? <Link href="/register" className="font-bold text-primary hover:underline text-lg ml-1">Ro'yxatdan o'tish</Link>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Info for Demo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Admin", email: "admin@gmail.com", pass: "admin123", color: "bg-blue-500" },
            { label: "Shifokor", email: "doctor@gmail.com", pass: "doctor123", color: "bg-emerald-500" },
            { label: "Foydalanuvchi", email: "user@gmail.com", pass: "user1234", color: "bg-amber-500" }
          ].map((item, i) => (
            <div key={i} className="glass-card !bg-white/40 dark:!bg-gray-800/40 p-4 rounded-2xl text-[10px] text-foreground-500 border border-white/20">
              <span className={`inline-block w-2 h-2 rounded-full ${item.color} mr-2`}></span>
              <span className="font-bold uppercase tracking-tighter">{item.label}</span>
              <div className="mt-1 font-mono flex flex-col opacity-70">
                <span>{item.email}</span>
                <span>Pass: {item.pass}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;