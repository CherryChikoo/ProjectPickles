import { AdminAuthProvider } from '@/components/admin/AdminAuthContext';

export const metadata = {
  title: 'Admin Dashboard | Hema Sathya Foods',
  description: 'Secure admin portal',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
