'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  cn,
  formatDate,
  aeSeverityLabels,
  aeRelationshipLabels,
} from '@/lib/utils';

export default function AdverseEventsPage() {
  const [aes, setAes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [isSAEFilter, setIsSAEFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [trialFilter, setTrialFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchAEs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (search) params.set('search', search);
      if (severityFilter) params.set('severity', severityFilter);
      if (isSAEFilter) params.set('isSAE', isSAEFilter);
      if (subjectFilter) params.set('subjectId', subjectFilter);
      if (trialFilter) params.set('trialId', trialFilter);

      const res = await fetch(`/api/adverse-events?${params.toString()}`);
      const data = await res.json();
      setAes(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('获取不良事件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchSubjects();
    fetchTrials();
  }, []);

  useEffect(() => {
    fetchAEs();
  }, [page, search, severityFilter, isSAEFilter, subjectFilter, trialFilter]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该不良事件记录吗？')) return;
    try {
      const res = await fetch(`/api/adverse-events/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAEs();
      } else {
        const data = await res.json();
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除不良事件失败:', error);
      alert('删除失败');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAEs();
  };

  const resetFilters = () => {
    setSearch('');
    setSeverityFilter('');
    setIsSAEFilter('');
    setSubjectFilter('');
    setTrialFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">不良事件管理</h2>
          <p className="text-gray-500 mt-1">监测、记录和报告临床试验不良事件</p>
        </div>
        <Link href="/adverse-events/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          新增不良事件
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜索
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="术语/编号"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                试验项目
              </label>
              <select
                className="input-field"
                value={trialFilter}
                onChange={(e) => { setTrialFilter(e.target.value); setPage(1); }}
              >
                <option value="">全部试验</option>
                {trials.map((trial) => (
                  <option key={trial.id} value={trial.id}>
                    {trial.trialNumber}
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
                onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
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
                严重程度
              </label>
              <select
                className="input-field"
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
              >
                <option value="">全部程度</option>
                {Object.entries(aeSeverityLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SAE
              </label>
              <select
                className="input-field"
                value={isSAEFilter}
                onChange={(e) => { setIsSAEFilter(e.target.value); setPage(1); }}
              >
                <option value="">全部</option>
                <option value="true">是</option>
                <option value="false">否</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn-primary flex-1">
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  编号
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  术语
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  严重程度
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  相关性
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  受试者
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所属试验
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  开始日期
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SAE
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
                  </td>
                </tr>
              ) : aes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                aes.map((ae) => (
                  <tr key={ae.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link
                        href={`/adverse-events/${ae.id}`}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        {ae.aeNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ae.term}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'badge',
                          aeSeverityLabels[ae.severity]?.color || 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {aeSeverityLabels[ae.severity]?.label || ae.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {aeRelationshipLabels[ae.relationship] || ae.relationship}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ae.subject ? (
                        <Link
                          href={`/subjects/${ae.subject.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {ae.subject.subjectNumber}
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ae.trial?.trialNumber || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(ae.startDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {ae.isSAE ? (
                        <span className="badge bg-red-100 text-red-800 font-medium">是</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-800">否</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/adverse-events/${ae.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(ae.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="btn-secondary px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
