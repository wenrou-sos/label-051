'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Clock,
  Shield,
  Settings,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: '仪表盘', href: '/', icon: LayoutDashboard },
  { name: '试验项目', href: '/trials', icon: FlaskConical },
  { name: '受试者管理', href: '/subjects', icon: Users },
  { name: '随访管理', href: '/visits', icon: Calendar },
  { name: '不良事件', href: '/adverse-events', icon: AlertTriangle },
  { name: '访视时间线', href: '/timeline', icon: Clock },
  { name: '用户管理', href: '/users', icon: UserCog },
];

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">CTMS系统</h2>
            <p className="text-xs text-slate-400">临床试验管理平台</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
