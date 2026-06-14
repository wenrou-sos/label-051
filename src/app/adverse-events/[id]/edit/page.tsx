'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  aeSeverityLabels,
  aeRelationshipLabels,
  aeOutcomeLabels,
  aeActionLabels,
} from '@/lib/utils';

interface PageParams {
  params: { id: string };
}

export default function EditAdverseEventPage({ params }: PageParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [trials, setTrials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    aeNumber: '',
    term: '',
    startDate: '',
    endDate: '',
    severity: 'MILD',
    seriousness: false,
    relationship: 'UNRELATED',
    outcome: '',
    action: '',
    isSAE: false,
    saeReportedDate: '',
    reportedToEthics: '',
    subjectId: '',
    trialId: '',
    description: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);

  const fetchTrials = async () => {
    try {
      const res = await fetch('/api/trials?pageSize=100');
      const data = await res.json();
      setTrials(data.data || []);
    } catch (error) {
      console.error('获取试验列表失败:', error);
    }
  };

  const fetchSubjects = async (trialId?: string) => {
    try {
      const params = new URLSearchParams();
      params.set('pageSize', '100');
      if (trialId) params.set('trialId', trialId);
      const res = await fetch(`/api/subjects?${params.toString()}`);
      const data = await res.json();
      setSubjects(data.data || []);
    } catch (error) {
      console.error('获取受试者列表失败:', error);
    }
  };

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchAdverseEvent = async () => {
    try {
      const res = await fetch(`/api/adverse-events/${params.id}`);
      if (!res.ok) {
        router.push('/adverse-events');
        return;
      }
      const { data: ae } = await res.json();
      if (ae.trial?.status === 'LOCKED') {
        setIsLocked(true);
      }
      setFormData({
        aeNumber: ae.aeNumber || '',
        term: ae.term || '',
        startDate: ae.startDate
          ? new Date(ae.startDate).toISOString().split('T')[0]
          : '',
        endDate: ae.endDate
          ? new Date(ae.endDate).toISOString().split('T')[0]
          : '',
        severity: ae.severity || 'MILD',
        seriousness: !!ae.seriousness,
        relationship: ae.relationship || 'UNRELATED',
        outcome: ae.outcome || '',
        action: ae.action || '',
        isSAE: !!ae.isSAE,
        saeReportedDate: ae.saeReportedDate
          ? new Date(ae.saeReportedDate).toISOString().split('T')[0]
          : '',
        reportedToEthics: ae.reportedToEthics
          ? new Date(ae.reportedToEthics).toISOString().split('T')[0]
          : '',
        subjectId: ae.subjectId ? String(ae.subjectId) : '',
        trialId: ae.trialId ? String(ae.trialId) : '',
        description: ae.description || '',
        notes: ae.notes || '',
      });
      if (ae.trialId) {
        fetchSubjects(String(ae.trialId));
      }
    } catch (error) {
      console.error('获取不良事件详情失败:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchTrials();
    fetchAdverseEvent();
  }, [params.id]);

  useEffect(() => {
    if (isInitialLoad) return;
    if (formData.trialId) {
      fetchSubjects(formData.trialId);
      setFormData((prev) => ({ ...prev, subjectId: '' }));
    } else {
      setSubjects([]);
    }
  }, [formData.trialId, isInitialLoad]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.aeNumber.trim()) {
      newErrors.aeNumber = '不良事件编号为必填项';
    }
    if (!formData.term.trim()) {
      newErrors.term = '不良事件术语为必填项';
    }
    if (!formData.startDate) {
      newErrors.startDate = '开始日期为必填项';
    }
    if (!formData.severity) {
      newErrors.severity = '请选择严重程度';
    }
    if (!formData.relationship) {
      newErrors.relationship = '请选择关联性';
    }
    if (!formData.subjectId) {
      newErrors.subjectId = '请选择受试者';
    }
    if (!formData.trialId) {
      newErrors.trialId = '请选择试验';
    }
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = '结束日期不能早于开始日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        aeNumber: formData.aeNumber.trim(),
        term: formData.term.trim(),
        startDate: formData.startDate,
        severity: formData.severity,
        seriousness: formData.seriousness,
        relationship: formData.relationship,
        subjectId: parseInt(formData.subjectId, 10),
        trialId: parseInt(formData.trialId, 10),
        isSAE: formData.isSAE,
      };
      if (formData.endDate) payload.endDate = formData.endDate;
      else payload.endDate = null;
      if (formData.outcome) payload.outcome = formData.outcome;
      else payload.outcome = null;
      if (formData.action) payload.action = formData.action;
      else payload.action = null;
      if (formData.saeReportedDate) payload.saeReportedDate = formData.saeReportedDate;
      else payload.saeReportedDate = null;
      if (formData.reportedToEthics) payload.reportedToEthics = formData.reportedToEthics;
      else payload.reportedToEthics = null;
      payload.description = formData.description.trim() || null;
      payload.notes = formData.notes.trim() || null;

      const res = await fetch(`/api/adverse-events/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/adverse-events/${params.id}`);
      } else {
        alert(data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新不良事件失败:', error);
      alert('更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/adverse-events/${params.id}`} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">编辑不良事件</h2>
          <p className="text-gray-500 mt-1">修改不良事件信息</p>
        </div>
      </div>

      <div className="card max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                不良事件编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="aeNumber"
                className={`input-field ${errors.aeNumber ? 'border-red-500' : ''}`}
                value={formData.aeNumber}
                onChange={handleChange}
              />
              {errors.aeNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.aeNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                不良事件术语 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="term"
                className={`input-field ${errors.term ? 'border-red-500' : ''}`}
                value={formData.term}
                onChange={handleChange}
              />
              {errors.term && (
                <p className="mt-1 text-sm text-red-600">{errors.term}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
                value={formData.startDate}
                onChange={handleChange}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期
              </label>
              <input
                type="date"
                name="endDate"
                className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
                value={formData.endDate}
                onChange={handleChange}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                严重程度 <span className="text-red-500">*</span>
              </label>
              <select
                name="severity"
                className={`input-field ${errors.severity ? 'border-red-500' : ''}`}
                value={formData.severity}
                onChange={handleChange}
              >
                {Object.entries(aeSeverityLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
              {errors.severity && (
                <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                关联性 <span className="text-red-500">*</span>
              </label>
              <select
                name="relationship"
                className={`input-field ${errors.relationship ? 'border-red-500' : ''}`}
                value={formData.relationship}
                onChange={handleChange}
              >
                {Object.entries(aeRelationshipLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.relationship && (
                <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结果
              </label>
              <select
                name="outcome"
                className="input-field"
                value={formData.outcome}
                onChange={handleChange}
              >
                <option value="">请选择</option>
                {Object.entries(aeOutcomeLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                采取措施
              </label>
              <select
                name="action"
                className="input-field"
                value={formData.action}
                onChange={handleChange}
              >
                <option value="">请选择</option>
                {Object.entries(aeActionLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                关联试验 <span className="text-red-500">*</span>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                关联受试者 <span className="text-red-500">*</span>
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
              <div className="flex items-center gap-8 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="seriousness"
                    className="w-4 h-4 text-primary-600 rounded"
                    checked={formData.seriousness}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-medium text-gray-700">严重性（serious）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isSAE"
                    className="w-4 h-4 text-primary-600 rounded"
                    checked={formData.isSAE}
                    onChange={handleChange}
                  />
                  <span className="text-sm font-medium text-gray-700 text-red-600">严重不良事件（SAE）</span>
                </label>
              </div>
            </div>

            {formData.isSAE && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SAE报告日期
                  </label>
                  <input
                    type="date"
                    name="saeReportedDate"
                    className="input-field"
                    value={formData.saeReportedDate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    报告伦理委员会日期
                  </label>
                  <input
                    type="date"
                    name="reportedToEthics"
                    className="input-field"
                    value={formData.reportedToEthics}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                name="description"
                rows={4}
                className="input-field"
                value={formData.description}
                onChange={handleChange}
                placeholder="请详细描述不良事件的发生过程、症状表现等"
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
                placeholder="其他需要说明的信息"
              />
            </div>
          </div>

          {isLocked && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ 该试验已锁库，无法编辑不良事件。如需修改，请先由管理员解锁试验。
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href={`/adverse-events/${params.id}`} className="btn-secondary">
              取消
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || isLocked}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : isLocked ? (
                '已锁库，无法保存'
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
