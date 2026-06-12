'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { subjectStatusLabels } from '@/lib/utils';

export default function EditSubjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [trials, setTrials] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subjectNumber: '',
    initials: '',
    gender: '',
    birthDate: '',
    status: 'SCREENING',
    enrollmentDate: '',
    trialId: '',
    withdrawalDate: '',
    withdrawalReason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const fetchSubject = async () => {
      try {
        const res = await fetch(`/api/subjects/${id}`);
        if (res.ok) {
          const response = await res.json();
          const data = response.data || {};
          setFormData({
            subjectNumber: data.subjectNumber || '',
            initials: data.initials || '',
            gender: data.gender || '',
            birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
            status: data.status || 'SCREENING',
            enrollmentDate: data.enrollmentDate ? data.enrollmentDate.split('T')[0] : '',
            trialId: data.trialId ? String(data.trialId) : '',
            withdrawalDate: data.withdrawalDate ? data.withdrawalDate.split('T')[0] : '',
            withdrawalReason: data.withdrawalReason || '',
          });
        } else {
          alert('获取受试者数据失败');
          router.push('/subjects');
        }
      } catch (error) {
        console.error('获取受试者数据失败:', error);
        alert('获取受试者数据失败');
        router.push('/subjects');
      } finally {
        setFetching(false);
      }
    };
    fetchSubject();
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
    if (!formData.subjectNumber.trim()) {
      newErrors.subjectNumber = '受试者编号为必填项';
    }
    if (!formData.initials.trim()) {
      newErrors.initials = '姓名缩写为必填项';
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
        subjectNumber: formData.subjectNumber.trim(),
        initials: formData.initials.trim(),
        status: formData.status,
        trialId: parseInt(formData.trialId, 10),
      };
      if (formData.gender) payload.gender = formData.gender;
      if (formData.birthDate) payload.birthDate = formData.birthDate;
      if (formData.enrollmentDate) payload.enrollmentDate = formData.enrollmentDate;
      if (formData.withdrawalDate) payload.withdrawalDate = formData.withdrawalDate;
      if (formData.withdrawalReason) payload.withdrawalReason = formData.withdrawalReason;

      const res = await fetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/subjects');
      } else {
        alert(data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新受试者失败:', error);
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
        <Link href="/subjects" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">编辑受试者</h2>
          <p className="text-gray-500 mt-1">修改受试者基本信息</p>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                受试者编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subjectNumber"
                className={`input-field ${errors.subjectNumber ? 'border-red-500' : ''}`}
                value={formData.subjectNumber}
                onChange={handleChange}
                placeholder="例如：SUB-001"
              />
              {errors.subjectNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.subjectNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名缩写 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="initials"
                className={`input-field ${errors.initials ? 'border-red-500' : ''}`}
                value={formData.initials}
                onChange={handleChange}
                placeholder="例如：张三 → ZS"
              />
              {errors.initials && (
                <p className="mt-1 text-sm text-red-600">{errors.initials}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <select
                name="gender"
                className="input-field"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出生日期
              </label>
              <input
                type="date"
                name="birthDate"
                className="input-field"
                value={formData.birthDate}
                onChange={handleChange}
              />
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
                {Object.entries(subjectStatusLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                入组日期
              </label>
              <input
                type="date"
                name="enrollmentDate"
                className="input-field"
                value={formData.enrollmentDate}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
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
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">退出信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  退出日期
                </label>
                <input
                  type="date"
                  name="withdrawalDate"
                  className="input-field"
                  value={formData.withdrawalDate}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  退出原因
                </label>
                <textarea
                  name="withdrawalReason"
                  rows={3}
                  className="input-field"
                  value={formData.withdrawalReason}
                  onChange={handleChange}
                  placeholder="请输入退出原因"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/subjects" className="btn-secondary">
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
