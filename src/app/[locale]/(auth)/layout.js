import UserDashboardShell from '@/components/UserDashboardShell';

export default function AuthLayout({ children }) {
  return <UserDashboardShell>{children}</UserDashboardShell>;
}
