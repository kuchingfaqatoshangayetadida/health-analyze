// backend/server.js

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Routelarni import qilish
import authRoutes from './routes/authRoutes.js';
import botRoutes from './routes/botRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // Barcha so'rovlarga ruxsat
app.use(express.json());

// HTTP Server yaratish
const server = http.createServer(app);

// Socket.IO ni sozlash va serverga ulash
const io = new Server(server, {
  cors: {
    origin: "*", // Barcha manzillardan ulanishga ruxsat (CORS xatosi bo'lmasligi uchun)
    methods: ["GET", "POST"]
  }
});

// API Routelari
app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/doctors', doctorRoutes);


// --- SOCKET.IO MANTIG'I ---
io.on('connection', (socket) => {
  console.log(`Foydalanuvchi ulandi: ${socket.id}`);

  // Shaxsiy xonaga qo'shilish (Video qo'ng'iroq uchun)
  socket.on('join_personal_room', ({ userId }) => {
    socket.join(userId);
    console.log(`Foydalanuvchi (${socket.id}) shaxsiy xonasiga qo'shildi: ${userId}`);
  });

  // Qo'ng'iroq qilish signali
  socket.on('call_user', (data) => {
    socket.to(data.userToCall).emit('call_user', {
      signal: data.signalData,
      from: data.from,
      callerName: data.callerName,
      callerAvatar: data.callerAvatar
    });
  });

  // Qo'ng'iroqni qabul qilish signali
  socket.on('answer_call', (data) => {
    socket.to(data.to).emit('call_accepted', data.signal);
  });

  // ICE Kandidatlarini almashish
  socket.on('ice_candidate', (data) => {
    socket.to(data.to).emit('ice_candidate', data.candidate);
  });

  // Qo'ng'iroqni yakunlash
  socket.on('end_call', (data) => {
    socket.to(data.to).emit('call_ended');
  });

  // Suhbat xonasiga qo'shilish
  socket.on('join_chat', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`Foydalanuvchi (${socket.id}) xonaga qo'shildi: ${chatRoomId}`);
  });

  // Xabar yuborilganda
  socket.on('send_message', (data) => {
    // Xabarni shu xonadagi hamma foydalanuvchilarga (o'zidan tashqari) yuborish
    console.log("Xabar qabul qilindi:", data);
    socket.to(data.chatRoomId).emit('receive_message', data);
  });

  // Foydalanuvchi uzilganda
  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi', socket.id);
  });
});
// --- SOCKET.IO MANTIG'I TUGADI ---


const PORT = process.env.PORT || 5000; // Render o'zi port beradi, lokalda 5000 ishlaydi

server.listen(PORT, () => {
  console.log(`SERVER ${PORT}-portda ishlamoqda`);
});