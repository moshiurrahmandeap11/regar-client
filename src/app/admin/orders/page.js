import AdminLayoutClient from '@/components/admin/AdminLayout';
import AdminOrders from '@/components/admin/OrdersContent';

export default function AdminOrdersPage() {
  return (
    <AdminLayoutClient>
      <AdminOrders />
    </AdminLayoutClient>
  );
}
