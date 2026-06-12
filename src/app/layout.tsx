import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '临床药物试验受试者管理平台',
  description: '临床试验数据管理系统 - 试验项目、受试者、随访、不良事件管理',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  const isLoginPage = false;

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {session ? (
          <div className="flex min-h-screen">
            <Sidebar user={session.user} />
            <div className="flex-1 flex flex-col">
              <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-800">临床药物试验受试者管理平台</h1>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    欢迎，{session.user?.name}
                  </span>
                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      退出登录
                    </button>
                  </form>
                </div>
              </header>
              <main className="flex-1 p-6 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
