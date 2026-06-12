'use client';

import {
  FlaskConical,
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { trialStatusLabels, subjectStatusLabels, aeSeverityLabels } from '@/lib/utils';

const TRIAL_COLORS = ['#6B7280', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444'];
const SUBJECT_COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6'];
const AE_COLORS = ['#22C55E', '#F59E0B', '#F97316', '#EF4444', '#991B1B'];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  stats,
  user,
}: {
  stats: any;
  user: any;
}) {
  const trialData = Object.entries(stats.trialStatusDistribution || {}).map(([key, value]) => ({
    name: trialStatusLabels[key]?.label || key,
    value: value as number,
  }));

  const subjectData = Object.entries(stats.subjectStatusDistribution || {}).map(([key, value]) => ({
    name: subjectStatusLabels[key]?.label || key,
    value: value as number,
  }));

  const aeData = Object.entries(stats.aeSeverityDistribution || {}).map(([key, value]) => ({
    name: aeSeverityLabels[key]?.label || key,
    value: value as number,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">仪表盘</h2>
        <p className="text-gray-500 mt-1">欢迎回来，{user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FlaskConical}
          label="试验项目总数"
          value={stats.trialCount || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="受试者总数"
          value={stats.subjectCount || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          label="进行中访视"
          value={stats.inProgressVisits || 0}
          color="bg-yellow-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="待处理不良事件"
          value={stats.pendingAECount || 0}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">试验项目状态分布</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {trialData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TRIAL_COLORS[index % TRIAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">受试者状态分布</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {subjectData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">不良事件严重程度</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
