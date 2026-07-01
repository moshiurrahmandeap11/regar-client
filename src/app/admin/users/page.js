import AdminLayoutClient from '@/components/admin/AdminLayout';
import AdminUsers from '@/components/admin/UsersContent';

export default function AdminUsersPage() {
  return (
    <AdminLayoutClient>
      <AdminUsers />
    </AdminLayoutClient>
  );
}
