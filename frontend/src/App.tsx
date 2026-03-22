// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { AuthProvider } from './contexts/auth-context';
import { NotificationProvider } from './contexts/notification-context';
import { CallProvider } from './contexts/call-context';
import { ThemeProvider } from './contexts/theme-context';
import ProtectedRoute from './components/protected-route';
// import { seedDoctors } from './scripts/seed-doctors';

// --- Barcha Sahifalar va Layout'larni Import Qilish ---

// Ommaviy sahifalar
import LoginPage from './pages/login';
import RegisterPage from './pages/register';

// Foydalanuvchi qismi
import UserLayout from './components/layout/user-layout';
import UserDashboard from './pages/user/dashboard';
import UserChat from './pages/user/chat';
import UserCalendar from './pages/user/calendar';
import UserRecords from './pages/user/health-records';
import UserMedications from './pages/user/medications';
import UserProfile from './pages/user/profile';
import UserDoctors from './pages/user/doctors';
import SettingsPage from './pages/user/settings';
import HelpPage from './pages/user/help';

// Shifokor qismi
import DoctorLayout from './components/layout/doctor-layout';
import DoctorDashboard from './pages/doctor/dashboard';

// Admin qismi
import AdminLayout from './components/layout/admin-layout';
import AdminDashboard from './pages/admin/dashboard';
import UsersPage from './pages/admin/users';
import DoctorsPage from './pages/admin/doctors';
import AnalyticsPage from './pages/admin/analytics';

// --- Yordamchi Komponentlar (Har bir rol uchun marshrutlar guruhini yaratadi) ---

const UserRoutes = () => (
  <UserLayout>
    <Switch>
      <ProtectedRoute exact path="/user/dashboard" component={UserDashboard} role="user" />
      <ProtectedRoute exact path="/user/chat" component={UserChat} role="user" />
      <ProtectedRoute exact path="/user/calendar" component={UserCalendar} role="user" />
      <ProtectedRoute exact path="/user/records" component={UserRecords} role="user" />
      <ProtectedRoute exact path="/user/doctors" component={UserDoctors} role="user" />
      <ProtectedRoute exact path="/user/medications" component={UserMedications} role="user" />
      <ProtectedRoute exact path="/user/profile" component={UserProfile} role="user" />
      <ProtectedRoute exact path="/user/settings" component={SettingsPage} role="user" />
      <ProtectedRoute exact path="/user/help" component={HelpPage} role="user" />
      {/* Agar /user manziliga kirilsa, dashboardga yo'naltirish */}
      <Redirect from="/user" to="/user/dashboard" />
    </Switch>
  </UserLayout>
);

const DoctorRoutes = () => (
  <DoctorLayout>
    <Switch>
      <ProtectedRoute exact path="/doctor/dashboard" component={DoctorDashboard} role="doctor" />
      {/* Kelajakda bu yerga shifokorning boshqa sahifalari qo'shiladi */}
      <Redirect from="/doctor" to="/doctor/dashboard" />
    </Switch>
  </DoctorLayout>
);

const AdminRoutes = () => (
  <AdminLayout>
    <Switch>
      <ProtectedRoute exact path="/admin/dashboard" component={AdminDashboard} role="admin" />
      <ProtectedRoute exact path="/admin/users" component={UsersPage} role="admin" />
      <ProtectedRoute exact path="/admin/doctors" component={DoctorsPage} role="admin" />
      <ProtectedRoute exact path="/admin/analytics" component={AnalyticsPage} role="admin" />
      <Redirect from="/admin" to="/admin/dashboard" />
    </Switch>
  </AdminLayout>
);

// --- Asosiy App Komponenti ---

const App: React.FC = () => {
  // useEffect(() => {
  //   seedDoctors();
  // }, []);

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <CallProvider>
              <Switch>
                {/* Ommaviy marshrutlar */}
                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/register" component={RegisterPage} />

                {/* Rol guruhlari */}
                <Route path="/user" component={UserRoutes} />
                <Route path="/doctor" component={DoctorRoutes} />
                <Route path="/admin" component={AdminRoutes} />

                <Route exact path="/" render={() => <Redirect to="/login" />} />
                <Route path="*" render={() => <Redirect to="/login" />} />
              </Switch>
            </CallProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;