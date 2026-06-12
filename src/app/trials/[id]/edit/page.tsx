'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { trialStatusLabels } from '@/lib/utils';

export default function EditTrialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    trialNumber: '',
    title: '',
    shortName: '',
    description: '',
    protocolNumber: '',
    indication: '',
    drugName: '',
    phase: '',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    plannedSubjects: '',
    sponsor: '',
    cro: '',
    siteName: '',
    piName: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTrial = async () => {
      try {
        const res = await fetch(`/api/trials/${id}`);
        if (res.ok) {
          const response = await res.json();
          const data = response.data || {};
          setFormData({
            trialNumber: data.trialNumber || '',
            title: data.title || '',
            shortName: data.shortName || '',
            description: data.description || '',
            protocolNumber: data.protocolNumber || '',
            indication: data.indication || '',
            drugName: data.drugName || '',
            phase: data.phase || '',
            status: data.status || 'DRAFT',
            startDate: data.startDate ? data.startDate.split('T')[0] : '',
            endDate: data.endDate ? data.endDate.split('T')[0] : '',
            plannedSubjects: data.plannedSubjects ? String(data.plannedSubjects) : '',
            sponsor: data.sponsor || '',
            cro: data.cro || '',
            siteName: data.siteName || '',
            piName: data.piName || '',
            notes: data.notes || '',
          });
        } else {
          alert('获取试验数据失败');
          router.push('/trials');
        }
      } catch (error) {
        console.error('获取试验数据失败:', error);
        alert('获取试验数据失败');
        router.push('/trials');
      } finally {
        setFetching(false);
      }
    };
    fetchTrial();
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
    if (!formData.trialNumber.trim()) {
      newErrors.trialNumber = '试验编号为必填项';
    }
    if (!formData.title.trim()) {
      newErrors.title = '试验标题为必填项';
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
        trialNumber: formData.trialNumber.trim(),
        title: formData.title.trim(),
        status: formData.status,
      };
      if (formData.shortName) payload.shortName = formData.shortName.trim();
      if (formData.description) payload.description = formData.description;
      if (formData.protocolNumber) payload.protocolNumber = formData.protocolNumber.trim();
      if (formData.indication) payload.indication = formData.indication.trim();
      if (formData.drugName) payload.drugName = formData.drugName.trim();
      if (formData.phase) payload.phase = formData.phase.trim();
      if (formData.startDate) payload.startDate = formData.startDate;
      if (formData.endDate) payload.endDate = formData.endDate;
      if (formData.plannedSubjects) payload.plannedSubjects = parseInt(formData.plannedSubjects, 10);
      if (formData.sponsor) payload.sponsor = formData.sponsor.trim();
      if (formData.cro) payload.cro = formData.cro.trim();
      if (formData.siteName) payload.siteName = formData.siteName.trim();
      if (formData.piName) payload.piName = formData.piName.trim();
      if (formData.notes) payload.notes = formData.notes;

      const res = await fetch(`/api/trials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/trials');
      } else {
        alert(data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新试验失败:', error);
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
        <Link href="/trials" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">编辑试验项目</h2>
          <p className="text-gray-500 mt-1">修改试验项目基本信息</p>
        </div>
      </div>

      <div className="card max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  试验编号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="trialNumber"
                  className={`input-field ${errors.trialNumber ? 'border-red-500' : ''}`}
                  value={formData.trialNumber}
                  onChange={handleChange}
                  placeholder="例如：TRIAL-2024-001"
                />
                {errors.trialNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.trialNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  试验简称
                </label>
                <input
                  type="text"
                  name="shortName"
                  className="input-field"
                  value={formData.shortName}
                  onChange={handleChange}
                  placeholder="例如：ANTI-HTN-X-III"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  试验标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="请输入试验标题"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  方案编号
                </label>
                <input
                  type="text"
                  name="protocolNumber"
                  className="input-field"
                  value={formData.protocolNumber}
                  onChange={handleChange}
                  placeholder="例如：PROTO-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  试验阶段
                </label>
                <input
                  type="text"
                  name="phase"
                  className="input-field"
                  value={formData.phase}
                  onChange={handleChange}
                  placeholder="例如：I期、II期、III期"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  药物名称
                </label>
                <input
                  type="text"
                  name="drugName"
                  className="input-field"
                  value={formData.drugName}
                  onChange={handleChange}
                  placeholder="请输入药物名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  适应症
                </label>
                <input
                  type="text"
                  name="indication"
                  className="input-field"
                  value={formData.indication}
                  onChange={handleChange}
                  placeholder="例如：原发性高血压"
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
                  {Object.entries(trialStatusLabels).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  计划受试者数
                </label>
                <input
                  type="number"
                  name="plannedSubjects"
                  className="input-field"
                  value={formData.plannedSubjects}
                  onChange={handleChange}
                  placeholder="请输入计划受试者数"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">时间信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期
                </label>
                <input
                  type="date"
                  name="startDate"
                  className="input-field"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束日期
                </label>
                <input
                  type="date"
                  name="endDate"
                  className="input-field"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">组织信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  申办方
                </label>
                <input
                  type="text"
                  name="sponsor"
                  className="input-field"
                  value={formData.sponsor}
                  onChange={handleChange}
                  placeholder="请输入申办方名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CRO
                </label>
                <input
                  type="text"
                  name="cro"
                  className="input-field"
                  value={formData.cro}
                  onChange={handleChange}
                  placeholder="请输入CRO名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  研究中心
                </label>
                <input
                  type="text"
                  name="siteName"
                  className="input-field"
                  value={formData.siteName}
                  onChange={handleChange}
                  placeholder="请输入研究中心名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  主要研究者
                </label>
                <input
                  type="text"
                  name="piName"
                  className="input-field"
                  value={formData.piName}
                  onChange={handleChange}
                  placeholder="请输入主要研究者姓名"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">其他信息</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  试验描述
                </label>
                <textarea
                  name="description"
                  rows={4}
                  className="input-field"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="请输入试验描述"
                />
              </div>

              <div>
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
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/trials" className="btn-secondary">
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
