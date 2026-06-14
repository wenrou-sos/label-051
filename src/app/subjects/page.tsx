'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  cn,
  formatDate,
  subjectStatusLabels,
} from '@/lib/utils';

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [trialFilter, setTrialFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (trialFilter) params.set('trialId', trialFilter);

      const res = await fetch(`/api/subjects?${params.toString()}`);
      const data = await res.json();
      setSubjects(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('获取受试者列表失败:', error);
    } finally {
      setLoading(false);
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
    fetchTrials();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [page, search, statusFilter, trialFilter]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该受试者吗？')) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchSubjects();
      } else {
        const data = await res.json();
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除受试者失败:', error);
      alert('删除失败');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubjects();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleTrialChange = (value: string) => {
    setTrialFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">受试者管理</h2>
          <p className="text-gray-500 mt-1">管理临床试验受试者信息</p>
        </div>
        <Link href="/subjects/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          新增受试者
        </Link>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜索
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-9"
                placeholder="输入受试者编号或姓名缩写"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="">全部状态</option>
              {Object.entries(subjectStatusLabels).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              所属试验
            </label>
            <select
              className="input-field"
              value={trialFilter}
              onChange={(e) => handleTrialChange(e.target.value)}
            >
              <option value="">全部试验</option>
              {trials.map((trial) => (
                <option key={trial.id} value={trial.id}>
                  {trial.trialNumber} - {trial.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary">
              查询
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  受试者编号
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  姓名缩写
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  性别
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年龄
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入组日期
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所属试验
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建人
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
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Link
                        href={`/subjects/${subject.id}`}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        {subject.subjectNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.initials}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.gender || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.age ?? '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'badge',
                          subjectStatusLabels[subject.status]?.color || 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {subjectStatusLabels[subject.status]?.label || subject.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(subject.enrollmentDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.trial ? (
                        <Link
                          href={`/trials/${subject.trial.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {subject.trial.trialNumber}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.createdBy?.name || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {subject.trial?.status !== 'LOCKED' ? (
                          <>
                            <Link
                              href={`/subjects/${subject.id}/edit`}
                              className="text-primary-600 hover:text-primary-900 p-1"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(subject.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-400 p-1 cursor-not-allowed" title="已锁库，无法编辑">
                              <Edit className="w-4 h-4 opacity-50" />
                            </span>
                            <span className="text-gray-400 p-1 cursor-not-allowed" title="已锁库，无法删除">
                              <Trash2 className="w-4 h-4 opacity-50" />
                            </span>
                          </>
                        )}
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
