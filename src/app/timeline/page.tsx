'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  Calendar,
  AlertTriangle,
  Activity,
  Users,
  Clock,
} from 'lucide-react';
import {
  cn,
  formatDate,
  visitStatusLabels,
  aeSeverityLabels,
  aeRelationshipLabels,
} from '@/lib/utils';

export default function TimelinePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [trialFilter, setTrialFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalVisits: 0,
    totalAdverseEvents: 0,
  });

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects?pageSize=100');
      const data = await res.json();
      setSubjects(data.data || []);
    } catch (error) {
      console.error('获取受试者列表失败:', error);
    }
  };

  const fetchTrials = async () => {
    try {
      const res = await fetch('/api/trials?pageSize=100');
      const data = await res.json();
      setTrials(data.data || []);
    } catch (error) {
      console.error('获取试验列表失败:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectFilter && !trialFilter) {
      alert('请至少选择试验或受试者');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (subjectFilter) params.set('subjectId', subjectFilter);
      if (trialFilter) params.set('trialId', trialFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/timeline?${params.toString()}`);
      const data = await res.json();
      setEvents(data.data || []);
      setStats(data.stats || { totalEvents: 0, totalVisits: 0, totalAdverseEvents: 0 });
    } catch (error) {
      console.error('获取时间线数据失败:', error);
      alert('获取时间线数据失败');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setTrialFilter('');
    setSubjectFilter('');
    setDateFrom('');
    setDateTo('');
    setEvents([]);
    setStats({ totalEvents: 0, totalVisits: 0, totalAdverseEvents: 0 });
    setSearched(false);
  };

  useEffect(() => {
    fetchSubjects();
    fetchTrials();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">访视时间线</h2>
          <p className="text-gray-500 mt-1">按时间线检索和查看访视与不良事件记录</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                试验项目
              </label>
              <select
                className="input-field"
                value={trialFilter}
                onChange={(e) => setTrialFilter(e.target.value)}
              >
                <option value="">全部试验</option>
                {trials.map((trial) => (
                  <option key={trial.id} value={trial.id}>
                    {trial.trialNumber} - {trial.shortName || trial.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                受试者
              </label>
              <select
                className="input-field"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="">全部受试者</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期
              </label>
              <input
                type="date"
                className="input-field"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期
              </label>
              <input
                type="date"
                className="input-field"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary flex-1">
                <Search className="w-4 h-4 mr-2" />
                查询
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="btn-secondary"
              >
                重置
              </button>
            </div>
          </div>
        </form>
      </div>

      {searched && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">总事件数</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats.totalEvents}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">访视数</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {stats.totalVisits}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">不良事件数</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {stats.totalAdverseEvents}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">时间线</h3>
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                <p className="text-gray-500 mt-4">加载中...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>暂无时间线数据</p>
                <p className="text-sm mt-2">请调整筛选条件后重试</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {events.map((event) => (
                    <div key={event.id} className="relative pl-16">
                      {event.type === 'visit' ? (
                        <div className="absolute left-4 w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-md flex items-center justify-center">
                          <Calendar className="w-2.5 h-2.5 text-white" />
                        </div>
                      ) : (
                        <div className="absolute left-4 w-5 h-5 rounded-full bg-red-500 border-4 border-white shadow-md flex items-center justify-center">
                          <AlertTriangle className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}

                      <div
                        className={cn(
                          'border rounded-lg p-4 transition-shadow hover:shadow-md',
                          event.type === 'visit'
                            ? 'border-blue-100 bg-blue-50/30'
                            : 'border-red-100 bg-red-50/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-semibold text-gray-900">
                                {event.title}
                              </h4>
                              {event.type === 'visit' ? (
                                <span
                                  className={cn(
                                    'badge',
                                    visitStatusLabels[event.status]?.color || 'bg-gray-100 text-gray-800'
                                  )}
                                >
                                  {visitStatusLabels[event.status]?.label || event.status}
                                </span>
                              ) : (
                                <>
                                  <span
                                    className={cn(
                                      'badge',
                                      aeSeverityLabels[event.severity]?.color || 'bg-gray-100 text-gray-800'
                                    )}
                                  >
                                    {aeSeverityLabels[event.severity]?.label || event.severity}
                                  </span>
                                  {event.isSAE && (
                                    <span className="badge bg-red-100 text-red-800 font-medium">
                                      SAE
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(event.date)}
                              </span>
                              {event.subject && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  受试者: {event.subject.subjectNumber}
                                </span>
                              )}
                              {event.trial && (
                                <span>
                                  试验: {event.trial.trialNumber}
                                  {event.trial.shortName && ` - ${event.trial.shortName}`}
                                </span>
                              )}
                            </div>

                            {event.description && (
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                              {event.type === 'visit' ? (
                                <>
                                  {event.scheduledDate && (
                                    <span>计划日期: {formatDate(event.scheduledDate)}</span>
                                  )}
                                  {event.actualDate && (
                                    <span>实际日期: {formatDate(event.actualDate)}</span>
                                  )}
                                  {event.entity?.visitNumber && (
                                    <span>访视编号: {event.entity.visitNumber}</span>
                                  )}
                                  {event.entity?.location && (
                                    <span>地点: {event.entity.location}</span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {event.startDate && (
                                    <span>开始日期: {formatDate(event.startDate)}</span>
                                  )}
                                  {event.endDate && (
                                    <span>结束日期: {formatDate(event.endDate)}</span>
                                  )}
                                  {event.relationship && (
                                    <span>
                                      关联性: {aeRelationshipLabels[event.relationship] || event.relationship}
                                    </span>
                                  )}
                                  {event.entity?.aeNumber && (
                                    <span>AE编号: {event.entity.aeNumber}</span>
                                  )}
                                  {event.entity?.outcome && (
                                    <span>转归: {event.entity.outcome}</span>
                                  )}
                                  {event.entity?.action && (
                                    <span>采取措施: {event.entity.action}</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
