// src/pages/admin/analytics.tsx
import React from 'react';
import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock ma'lumotlar
const userActivityData = [{ name: 'Jan', users: 400, consultations: 240, ratings: 100 },{ name: 'Feb', users: 500, consultations: 320, ratings: 140 },{ name: 'Mar', users: 600, consultations: 380, ratings: 180 },{ name: 'Apr', users: 700, consultations: 420, ratings: 200 },{ name: 'May', users: 800, consultations: 490, ratings: 230 },{ name: 'Jun', users: 900, consultations: 550, ratings: 270 },];
const consultationTypeData = [{ name: 'General Health', value: 35 }, { name: 'Cardiology', value: 20 },{ name: 'Neurology', value: 15 }, { name: 'Pediatrics', value: 10 },{ name: 'Dermatology', value: 20 },];
const userDemographicsData = [{ name: '18-24', male: 50, female: 80 }, { name: '25-34', male: 120, female: 150 },{ name: '35-44', male: 90, female: 110 }, { name: '45-54', male: 70, female: 85 },{ name: '55-64', male: 50, female: 65 }, { name: '65+', male: 30, female: 45 },];
const dailyActiveUsersData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, users: Math.floor(Math.random() * 100) + 100 }));
const COLORS = ['#0EA5E9', '#06b6d4', '#0284c7', '#0369a1', '#075985'];

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('month');
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-foreground-500">Detailed analytics and statistics for the platform</p>
      </div>
      
      <Card><CardBody><div className="flex justify-between items-center"><div><h2 className="text-lg font-semibold">Platform Analytics</h2><p className="text-sm">Overview of key metrics</p></div><div className="flex gap-2"><Button variant={timeRange==='week'?'solid':'flat'} color={timeRange==='week'?'primary':'default'} onPress={()=>setTimeRange('week')}>Week</Button><Button variant={timeRange==='month'?'solid':'flat'} color={timeRange==='month'?'primary':'default'} onPress={()=>setTimeRange('month')}>Month</Button><Button variant={timeRange==='year'?'solid':'flat'} color={timeRange==='year'?'primary':'default'} onPress={()=>setTimeRange('year')}>Year</Button></div></div></CardBody></Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}><Card className="h-full"><CardBody className="flex flex-col gap-2"><p>Total Users</p><div className="flex items-end justify-between"><h3 className="text-2xl font-bold">1,245</h3><div className="flex items-center text-success"><Icon icon="lucide:trending-up" /><span className="text-sm ml-1">+12.5%</span></div></div><div className="h-16 mt-2"><ResponsiveContainer><AreaChart data={userActivityData.slice(-7)}><defs><linearGradient id="cU" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/><stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="users" stroke="#0EA5E9" fillOpacity={1} fill="url(#cU)" /></AreaChart></ResponsiveContainer></div></CardBody></Card></motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}><Card className="h-full"><CardBody className="flex flex-col gap-2"><p>Consultations</p><div className="flex items-end justify-between"><h3 className="text-2xl font-bold">856</h3><div className="flex items-center text-success"><Icon icon="lucide:trending-up" /><span className="text-sm ml-1">+8.2%</span></div></div><div className="h-16 mt-2"><ResponsiveContainer><AreaChart data={userActivityData.slice(-7)}><defs><linearGradient id="cC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="consultations" stroke="#06b6d4" fillOpacity={1} fill="url(#cC)" /></AreaChart></ResponsiveContainer></div></CardBody></Card></motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}><Card className="h-full"><CardBody className="flex flex-col gap-2"><p>Doctor Ratings</p><div className="flex items-end justify-between"><h3 className="text-2xl font-bold">4.8</h3><div className="flex items-center text-success"><Icon icon="lucide:trending-up" /><span className="text-sm ml-1">+0.3</span></div></div><div className="h-16 mt-2"><ResponsiveContainer><AreaChart data={userActivityData.slice(-7)}><defs><linearGradient id="cR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#17c964" stopOpacity={0.8}/><stop offset="95%" stopColor="#17c964" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="ratings" stroke="#17c964" fillOpacity={1} fill="url(#cR)" /></AreaChart></ResponsiveContainer></div></CardBody></Card></motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}><Card className="h-full"><CardBody className="flex flex-col gap-2"><p>Active Doctors</p><div className="flex items-end justify-between"><h3 className="text-2xl font-bold">48</h3><div className="flex items-center text-danger"><Icon icon="lucide:trending-down" /><span className="text-sm ml-1">-2.1%</span></div></div><div className="h-16 mt-2"><ResponsiveContainer><AreaChart data={[{d:45},{d:48},{d:52},{d:49},{d:50},{d:48},{d:47}]}><defs><linearGradient id="cD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f5a524" stopOpacity={0.8}/><stop offset="95%" stopColor="#f5a524" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="d" stroke="#f5a524" fillOpacity={1} fill="url(#cD)" /></AreaChart></ResponsiveContainer></div></CardBody></Card></motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><h2 className="text-lg font-semibold">User Activity</h2></CardHeader><CardBody><div className="h-[300px]"><ResponsiveContainer><LineChart data={userActivityData}><CartesianGrid /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="users" stroke="#0EA5E9" /><Line type="monotone" dataKey="consultations" stroke="#06b6d4" /><Line type="monotone" dataKey="ratings" stroke="#17c964" /></LineChart></ResponsiveContainer></div></CardBody></Card>
          <Card><CardHeader><h2 className="text-lg font-semibold">Consultation Types</h2></CardHeader><CardBody><div className="h-[300px]"><ResponsiveContainer><PieChart><Pie data={consultationTypeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>{consultationTypeData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></CardBody></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><h2 className="text-lg font-semibold">User Demographics</h2></CardHeader><CardBody><div className="h-[300px]"><ResponsiveContainer><BarChart data={userDemographicsData}><CartesianGrid /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="male" name="Male" fill="#0EA5E9" radius={[4, 4, 0, 0]} /><Bar dataKey="female" name="Female" fill="#06b6d4" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardBody></Card>
          <Card><CardHeader><h2 className="text-lg font-semibold">Daily Active Users</h2></CardHeader><CardBody><div className="h-[300px]"><ResponsiveContainer><AreaChart data={dailyActiveUsersData}><CartesianGrid /><XAxis dataKey="day" /><YAxis /><Tooltip /><defs><linearGradient id="cAU" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/><stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="users" stroke="#0EA5E9" fillOpacity={1} fill="url(#cAU)" /></AreaChart></ResponsiveContainer></div></CardBody></Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;