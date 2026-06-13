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

const SUBJECT_STATUS_ORDER = ['SCREENING', 'ENROLLED', 'ACTIVE', 'WITHDRAWN', 'COMPLETED'];
const VISIT_STATUS_ORDER = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED'];
const AE_SEVERITY_ORDER = ['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING', 'FATAL'];

const SUBJECT_COLOR_MAP: Record<string, string> = {
  SCREENING: '#F59E0B',
  ENROLLED: '#3B82F6',
  ACTIVE: '#22C55E',
  WITHDRAWN: '#EF4444',
  COMPLETED: '#8B5CF6',
};

const VISIT_COLOR_MAP: Record<string, string> = {
  SCHEDULED: '#6B7280',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#22C55E',
  MISSED: '#F59E0B',
  CANCELLED: '#EF4444',
};

const AE_COLOR_MAP: Record<string, string> = {
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
  const dist = statistics.subjectStatusDistribution || {};
  const subjectData = SUBJECT_STATUS_ORDER.map((key) => ({
    name: subjectStatusLabels[key]?.label || key,
    value: dist[key] || 0,
    key,
  }));

  const vDist = statistics.visitStatusDistribution || {};
  const visitData = VISIT_STATUS_ORDER.map((key) => ({
    name: visitStatusLabels[key]?.label || key,
    value: vDist[key] || 0,
    key,
  }));

  const aDist = statistics.aeSeverityDistribution || {};
  const aeData = AE_SEVERITY_ORDER.map((key) => ({
    name: aeSeverityLabels[key]?.label || key,
    value: aDist[key] || 0,
    key,
  }));

  const subjectHasAny = subjectData.some((d) => d.value > 0);
  const visitHasAny = visitData.some((d) => d.value > 0);
  const aeHasAny = aeData.some((d) => d.value > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0];
      const payloadName = d?.payload?.name;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-sm">
          <p className="font-medium text-gray-900 mb-1">
            {label || payloadName}
          </p>
          <p className="text-gray-600">
            数量: <span className="font-semibold text-gray-900">{d?.value ?? 0}</span>
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
        {subjectHasAny ? (
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
                  {subjectData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={SUBJECT_COLOR_MAP[entry.key] || '#9CA3AF'}
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
                  formatter={(value: string, entry: any) => {
                    const item = subjectData.find((d) => d.name === value);
                    const count = item?.value || 0;
                    return (
                      <span className="text-gray-700">
                        {value}
                        <span className="text-gray-400 ml-1">({count})</span>
                      </span>
                    );
                  }}
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
        {visitHasAny ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={visitData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={45}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  minPointSize={3}
                >
                  {visitData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={VISIT_COLOR_MAP[entry.key] || '#9CA3AF'}
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
        {aeHasAny ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aeData}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={45}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  minPointSize={3}
                >
                  {aeData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={AE_COLOR_MAP[entry.key] || '#9CA3AF'}
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
