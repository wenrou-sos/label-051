'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { visitStatusLabels, visitTypeLabels } from '@/lib/utils';

export default function EditVisitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    visitNumber: '',
    name: '',
    type: 'FOLLOW_UP',
    status: 'SCHEDULED',
    scheduledDate: '',
    actualDate: '',
    windowStart: '',
    windowEnd: '',
    location: '',
    subjectId: '',
    trialId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const fetchVisit = async () => {
      try {
        const res = await fetch(`/api/visits/${id}`);
        if (res.ok) {
          const response = await res.json();
          const data = response.data || {};
          setFormData({
            visitNumber: data.visitNumber || '',
            name: data.name || '',
            type: data.type || 'FOLLOW_UP',
            status: data.status || 'SCHEDULED',
            scheduledDate: data.scheduledDate ? data.scheduledDate.split('T')[0] : '',
            actualDate: data.actualDate ? data.actualDate.split('T')[0] : '',
            windowStart: data.windowStart ? data.windowStart.split('T')[0] : '',
            windowEnd: data.windowEnd ? data.windowEnd.split('T')[0] : '',
            location: data.location || '',
            subjectId: data.subjectId ? String(data.subjectId) : '',
            trialId: data.trialId ? String(data.trialId) : '',
            notes: data.notes || '',
          });
        } else {
          alert('获取访视数据失败');
          router.push('/visits');
        }
      } catch (error) {
        console.error('获取访视数据失败:', error);
        alert('获取访视数据失败');
        router.push('/visits');
      } finally {
        setFetching(false);
      }
    };
    fetchVisit();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.visitNumber.trim()) {
      newErrors.visitNumber = '访视编号为必填项';
    }
    if (!formData.name.trim()) {
      newErrors.name = '访视名称为必填项';
    }
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = '计划日期为必填项';
    }
    if (!formData.subjectId) {
      newErrors.subjectId = '请选择受试者';
    }
    if (!formData.trialId) {
      newErrors.trialId = '请选择所属试验';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: any = {
        visitNumber: formData.visitNumber.trim(),
        name: formData.name.trim(),
        type: formData.type,
        status: formData.status,
        scheduledDate: formData.scheduledDate,
        subjectId: parseInt(formData.subjectId, 10),
        trialId: parseInt(formData.trialId, 10),
      };
      if (formData.actualDate) payload.actualDate = formData.actualDate;
      if (formData.windowStart) payload.windowStart = formData.windowStart;
      if (formData.windowEnd) payload.windowEnd = formData.windowEnd;
      if (formData.location) payload.location = formData.location;
      if (formData.notes) payload.notes = formData.notes;

      const res = await fetch(`/api/visits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/visits');
      } else {
        alert(data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新访视失败:', error);
      alert('更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/visits" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">编辑访视</h2>
          <p className="text-gray-500 mt-1">修改访视记录</p>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                访视编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="visitNumber"
                className={`input-field ${errors.visitNumber ? 'border-red-500' : ''}`}
                value={formData.visitNumber}
                onChange={handleChange}
                placeholder="例如：V1、V2"
              />
              {errors.visitNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.visitNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                访视名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="例如：第2周随访"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                访视类型
              </label>
              <select
                name="type"
                className="input-field"
                value={formData.type}
                onChange={handleChange}
              >
                {Object.entries(visitTypeLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                name="status"
                className="input-field"
                value={formData.status}
                onChange={handleChange}
              >
                {Object.entries(visitStatusLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                计划日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="scheduledDate"
                className={`input-field ${errors.scheduledDate ? 'border-red-500' : ''}`}
                value={formData.scheduledDate}
                onChange={handleChange}
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                实际日期
              </label>
              <input
                type="date"
                name="actualDate"
                className="input-field"
                value={formData.actualDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                访视窗口开始
              </label>
              <input
                type="date"
                name="windowStart"
                className="input-field"
                value={formData.windowStart}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                访视窗口结束
              </label>
              <input
                type="date"
                name="windowEnd"
                className="input-field"
                value={formData.windowEnd}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                所属试验 <span className="text-red-500">*</span>
              </label>
              <select
                name="trialId"
                className={`input-field ${errors.trialId ? 'border-red-500' : ''}`}
                value={formData.trialId}
                onChange={handleChange}
              >
                <option value="">请选择试验</option>
                {trials.map((trial) => (
                  <option key={trial.id} value={trial.id}>
                    {trial.trialNumber} - {trial.title}
                  </option>
                ))}
              </select>
              {errors.trialId && (
                <p className="mt-1 text-sm text-red-600">{errors.trialId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                受试者 <span className="text-red-500">*</span>
              </label>
              <select
                name="subjectId"
                className={`input-field ${errors.subjectId ? 'border-red-500' : ''}`}
                value={formData.subjectId}
                onChange={handleChange}
              >
                <option value="">请选择受试者</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectNumber} - {subject.initials}
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <p className="mt-1 text-sm text-red-600">{errors.subjectId}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                访视地点
              </label>
              <input
                type="text"
                name="location"
                className="input-field"
                value={formData.location}
                onChange={handleChange}
                placeholder="请输入访视地点"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                备注
              </label>
              <textarea
                name="notes"
                rows={3}
                className="input-field"
                value={formData.notes}
                onChange={handleChange}
                placeholder="请输入备注信息"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/visits" className="btn-secondary">
              取消
            </Link>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
