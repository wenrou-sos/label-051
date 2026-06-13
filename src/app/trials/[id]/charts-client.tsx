'use client';

import { Users, Calendar, AlertTriangle } from 'lucide-react';
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
import {
  subjectStatusLabels,
  visitStatusLabels,
  aeSeverityLabels,
} from '@/lib/utils';

const SUBJECT_COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6'];
const VISIT_COLORS = ['#6B7280', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444'];
const AE_COLORS = ['#22C55E', '#F59E0B', '#F97316', '#EF4444', '#991B1B'];

const COLOR_BY_STATUS: Record<string, string> = {
  SCREENING: '#F59E0B',
  ENROLLED: '#3B82F6',
  ON_TREATMENT: '#22C55E',
  WITHDRAWN: '#EF4444',
  COMPLETED: '#8B5CF6',
  SCHEDULED: '#6B7280',
  IN_PROGRESS: '#3B82F6',
  COMPLETED_VISIT: '#22C55E',
  MISSED: '#F59E0B',
  CANCELLED: '#EF4444',
  MILD: '#22C55E',
  MODERATE: '#F59E0B',
  SEVERE: '#F97316',
  LIFE_THREATENING: '#EF4444',
  FATAL: '#991B1B',
};

interface TrialChartsProps {
  statistics: {
    subjectStatusDistribution?: Record<string, number>;
    visitStatusDistribution?: Record<string, number>;
    aeSeverityDistribution?: Record<string, number>;
  };
  subjectCount: number;
  visitCount: number;
  aeCount: number;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
      {message}
    </div>
  );
}

export default function TrialDetailCharts({
  statistics,
  subjectCount,
  visitCount,
  aeCount,
}: TrialChartsProps) {
  const subjectData = Object.entries(statistics.subjectStatusDistribution || {}).map(
    ([key, value]) => ({
      name: subjectStatusLabels[key]?.label || key,
      value,
      key,
    })
  );

  const visitData = Object.entries(statistics.visitStatusDistribution || {}).map(
    ([key, value]) => ({
      name: visitStatusLabels[key]?.label || key,
      value,
      key,
    })
  );

  const aeData = Object.entries(statistics.aeSeverityDistribution || {}).map(
    ([key, value]) => ({
      name: aeSeverityLabels[key]?.label || key,
      value,
      key,
    })
  );

  const getSubjectFill = (entry: any, index: number) => {
    return (
      COLOR_BY_STATUS[entry.key as string] ||
      SUBJECT_COLORS[index % SUBJECT_COLORS.length]
    );
  };

  const getVisitFill = (entry: any, index: number) => {
    const key = entry.payload?.key;
    return (
      COLOR_BY_STATUS[key as string] ||
      VISIT_COLORS[index % VISIT_COLORS.length]
    );
  };

  const getAeFill = (entry: any, index: number) => {
    const key = entry.payload?.key;
    return (
      COLOR_BY_STATUS[key as string] ||
      AE_COLORS[index % AE_COLORS.length]
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-sm">
          <p className="font-medium text-gray-900 mb-1">
            {label || payload[0]?.payload?.name}
          </p>
          <p className="text-gray-600">
            数量: <span className="font-semibold text-gray-900">{payload[0]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900">受试者状态分布</h3>
        </div>
        {subjectCount > 0 && subjectData.length > 0 ? (
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
                  {subjectData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getSubjectFill(entry, index)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState message="暂无数据" />
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">访视完成情况</h3>
        </div>
        {visitCount > 0 && visitData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {visitData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getVisitFill({ payload: entry }, index)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState message="暂无数据" />
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">AE 严重程度分布</h3>
        </div>
        {aeCount > 0 && aeData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aeData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {aeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getAeFill({ payload: entry }, index)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState message="暂无数据" />
        )}
      </div>
    </div>
  );
}
