import AdminLayoutClient from '@/components/admin/AdminLayout';
import AdminProducts from '@/components/admin/ProductsContent';

export default function AdminProductsPage() {
  return (
    <AdminLayoutClient>
      <AdminProducts />
    </AdminLayoutClient>
  );
}
