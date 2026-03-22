// src/pages/admin/users.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Chip, Avatar, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { db } from '../../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  status?: string;
}

const UsersAdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (window.confirm("Haqiqatan ham ushbu foydalanuvchini o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Noma\'lum';
    return new Date(dateString).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Yuklanmoqda..." color="primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Foydalanuvchilar boshqaruvi</h1>
        <p className="text-foreground-500">Tizimdagi barcha foydalanuvchilar ro'yxati</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <Input
              placeholder="Foydalanuvchilarni qidirish..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="lucide:search" />}
              className="w-full sm:max-w-xs"
            />
            <Button color="primary" onPress={() => window.location.reload()} startContent={<Icon icon="lucide:refresh-cw" />}>Yangilash</Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            aria-label="Users table"
            bottomContent={
              <div className="flex justify-center">
                <Pagination
                  total={Math.ceil(filteredUsers.length / rowsPerPage) || 1}
                  page={currentPage}
                  onChange={setCurrentPage}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>FOYDALANUVCHI</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROL</TableColumn>
              <TableColumn>SANA</TableColumn>
              <TableColumn>AMALLAR</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Foydalanuvchilar topilmadi">
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip color={user.role === 'admin' ? 'danger' : user.role === 'doctor' ? 'success' : 'primary'} variant="flat" size="sm">
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button isIconOnly size="sm" variant="flat" color="danger" onPress={() => handleDelete(user.id)}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3"><Icon icon="lucide:users" className="text-primary text-2xl" /></div>
            <div>
              <p className="text-foreground-500 text-sm">Jami foydalanuvchilar</p>
              <h3 className="text-2xl font-bold">{users.length}</h3>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="rounded-full bg-success/10 p-3"><Icon icon="lucide:stethoscope" className="text-success text-2xl" /></div>
            <div>
              <p className="text-foreground-500 text-sm">Jami shifokorlar</p>
              <h3 className="text-2xl font-bold">{users.filter(u => u.role === 'doctor').length}</h3>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="rounded-full bg-danger/10 p-3"><Icon icon="lucide:shield-check" className="text-danger text-2xl" /></div>
            <div>
              <p className="text-foreground-500 text-sm">Adminlar</p>
              <h3 className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</h3>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default UsersAdminPage;