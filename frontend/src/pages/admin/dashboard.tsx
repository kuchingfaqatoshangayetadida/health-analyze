// src/pages/admin/dashboard.tsx

import React from 'react';
import { Card, CardBody, CardHeader, Button, Progress, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock ma'lumotlar statistikalar uchun
const statsData = [
    { name: 'Total Users', value: 1245, icon: 'lucide:users', color: 'primary' },
    { name: 'Active Doctors', value: 48, icon: 'lucide:stethoscope', color: 'secondary' },
    { name: 'Consultations', value: 856, icon: 'lucide:message-circle', color: 'success' },
    { name: 'Pending Approvals', value: 12, icon: 'lucide:clock', color: 'warning' },
];

// Mock ma'lumotlar foydalanuvchilar o'sishi uchun
const userGrowthData = [
    { name: 'Jan', users: 400 },
    { name: 'Feb', users: 600 },
    { name: 'Mar', users: 800 },
    { name: 'Apr', users: 1000 },
    { name: 'May', users: 1200 },
    { name: 'Jun', users: 1400 },
    { name: 'Jul', users: 1600 },
    { name: 'Aug', users: 1800 },
    { name: 'Sep', users: 2000 },
];

// Mock ma'lumotlar konsultatsiya turlari uchun
const consultationData = [
    { name: 'General Health', value: 35 },
    { name: 'Cardiology', value: 20 },
    { name: 'Neurology', value: 15 },
    { name: 'Pediatrics', value: 10 },
    { name: 'Dermatology', value: 20 },
];

// Pie chart uchun ranglar
const COLORS = ['#0EA5E9', '#06b6d4', '#0284c7', '#0369a1', '#075985'];

// Mock ma'lumotlar so'nggi faoliyatlar uchun
const recentActivities = [
    {
        id: '1',
        user: 'Alisher Karimov',
        action: 'registered as a new user',
        time: '10 minutes ago',
        avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=10'
    },
    {
        id: '2',
        user: 'Dr. Azimov',
        action: 'completed a consultation',
        time: '1 hour ago',
        avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=2'
    },
    {
        id: '3',
        user: 'Admin',
        action: 'approved 3 new doctors',
        time: '2 hours ago',
        avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=5'
    },
    {
        id: '4',
        user: 'Zarina Usmanova',
        action: 'submitted a new rating',
        time: '3 hours ago',
        avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=15'
    }
];

const AdminDashboard: React.FC = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-foreground-500">Overview of the health analysis platform</p>
            </div>

            {/* Stats kartalari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="h-full">
                            <CardBody className="flex items-center gap-4">
                                <div className={`rounded-full p-3 bg-primary/10`}>
                                    <Icon icon={stat.icon} className={`text-primary text-2xl`} />
                                </div>
                                <div>
                                    <p className="text-foreground-500 text-sm">{stat.name}</p>
                                    <h3 className="text-2xl font-bold">{stat.value.toLocaleString()}</h3>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Chartlar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Foydalanuvchilar o'sishi chizmasi */}
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">User Growth</h2>
                        <Button variant="light" endContent={<Icon icon="lucide:download" />}>
                            Export
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={userGrowthData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        name="Total Users"
                                        stroke="#0EA5E9"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>

                {/* Konsultatsiya turlari chizmasi */}
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Consultation Types</h2>
                        <Button variant="light" endContent={<Icon icon="lucide:download" />}>
                            Export
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={consultationData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {consultationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* So'nggi faoliyatlar va Tizim ishlashi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* So'nggi faoliyatlar */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Recent Activities</h2>
                    </CardHeader>
                    <CardBody className="p-0">
                        <div className="flex flex-col">
                            {recentActivities.map((activity, index) => (
                                <React.Fragment key={activity.id}>
                                    <div className="p-4 flex items-center gap-4">
                                        <img
                                            src={activity.avatar}
                                            alt={activity.user}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-grow">
                                            <p>
                                                <span className="font-medium">{activity.user}</span> {activity.action}
                                            </p>
                                            <p className="text-foreground-500 text-sm">{activity.time}</p>
                                        </div>
                                    </div>
                                    {index < recentActivities.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="p-4 border-t border-divider">
                            <Button
                                color="primary"
                                variant="flat"
                                fullWidth
                                endContent={<Icon icon="lucide:arrow-right" />}
                            >
                                View All Activities
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Tizim ishlashi */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">System Performance</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-foreground-500">Server Uptime</p>
                                    <p className="font-medium">99.9%</p>
                                </div>
                                <Progress value={99.9} color="success" />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-foreground-500">Response Time</p>
                                    <p className="font-medium">120ms</p>
                                </div>
                                <Progress value={85} color="primary" />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-foreground-500">Database Load</p>
                                    <p className="font-medium">45%</p>
                                </div>
                                <Progress value={45} color="secondary" />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-foreground-500">API Errors</p>
                                    <p className="font-medium">0.2%</p>
                                </div>
                                <Progress value={0.2} color="warning" />
                            </div>

                            <Button
                                color="primary"
                                variant="flat"
                                fullWidth
                                endContent={<Icon icon="lucide:arrow-right" />}
                            >
                                View Detailed Analytics
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Oylik statistika */}
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Monthly Statistics</h2>
                    <div className="flex gap-2">
                        <Button variant="light" size="sm">This Month</Button>
                        <Button variant="light" size="sm">Last Month</Button>
                        <Button variant="light" size="sm">Last 3 Months</Button>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'New Users', current: 120, previous: 90 },
                                    { name: 'Consultations', current: 85, previous: 70 },
                                    { name: 'Doctor Ratings', current: 65, previous: 50 },
                                    { name: 'Active Sessions', current: 150, previous: 120 },
                                    { name: 'Completed Checkups', current: 95, previous: 80 },
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="current" name="Current Month" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="previous" name="Previous Month" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default AdminDashboard;