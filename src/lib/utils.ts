import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateAge(birthDate: Date | string | null | undefined): number | null {
  if (!birthDate) return null;
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export const trialStatusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
  RECRUITING: { label: '招募中', color: 'bg-blue-100 text-blue-800' },
  ACTIVE: { label: '进行中', color: 'bg-green-100 text-green-800' },
  SUSPENDED: { label: '暂停', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: '已完成', color: 'bg-purple-100 text-purple-800' },
  TERMINATED: { label: '终止', color: 'bg-red-100 text-red-800' },
  LOCKED: { label: '已锁库', color: 'bg-slate-700 text-white' },
};

export const subjectStatusLabels: Record<string, { label: string; color: string }> = {
  SCREENING: { label: '筛选中', color: 'bg-yellow-100 text-yellow-800' },
  ENROLLED: { label: '已入组', color: 'bg-blue-100 text-blue-800' },
  ACTIVE: { label: '在研中', color: 'bg-green-100 text-green-800' },
  WITHDRAWN: { label: '退出', color: 'bg-red-100 text-red-800' },
  COMPLETED: { label: '完成', color: 'bg-purple-100 text-purple-800' },
};

export const visitStatusLabels: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: '待访视', color: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: '进行中', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-800' },
  MISSED: { label: '未访视', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
};

export const visitTypeLabels: Record<string, string> = {
  SCREENING: '筛查访视',
  BASELINE: '基线访视',
  FOLLOW_UP: '随访',
  END_OF_STUDY: '研究结束',
  UNSCHEDULED: '非计划访视',
};

export const aeSeverityLabels: Record<string, { label: string; color: string }> = {
  MILD: { label: '轻度', color: 'bg-green-100 text-green-800' },
  MODERATE: { label: '中度', color: 'bg-yellow-100 text-yellow-800' },
  SEVERE: { label: '重度', color: 'bg-orange-100 text-orange-800' },
  LIFE_THREATENING: { label: '危及生命', color: 'bg-red-100 text-red-800' },
  FATAL: { label: '死亡', color: 'bg-red-200 text-red-900' },
};

export const aeRelationshipLabels: Record<string, string> = {
  UNRELATED: '无关',
  UNLIKELY: '不太可能',
  POSSIBLE: '可能',
  PROBABLE: '很可能',
  DEFINITE: '肯定',
};

export const aeOutcomeLabels: Record<string, string> = {
  RECOVERED: '已痊愈',
  RECOVERING: '恢复中',
  NOT_RECOVERED: '未恢复',
  SEQUELAE: '后遗症',
  FATAL: '死亡',
};

export const aeActionLabels: Record<string, string> = {
  NONE: '未采取措施',
  DOSE_REDUCED: '剂量减少',
  DRUG_WITHDRAWN: '停药',
  TREATMENT_GIVEN: '给予治疗',
  HOSPITALIZATION: '住院',
};

export const roleLabels: Record<string, string> = {
  ADMIN: '系统管理员',
  INVESTIGATOR: '研究者',
  DOCTOR: '医生',
  COORDINATOR: '协调员',
  MONITOR: '监查员',
};
