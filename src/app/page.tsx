import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/dashboard/stats`, {
    cache: 'no-store',
  });
  const stats = await res.json();

  return <DashboardClient stats={stats} user={session.user} />;
}
