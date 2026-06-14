import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  FlaskConical,
  Users,
  Calendar,
  AlertTriangle,
  Building2,
  UserCog,
} from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  trialStatusLabels,
  subjectStatusLabels,
  cn,
} from '@/lib/utils';
import TrialDetailCharts from './charts-client';
import TrialLockButton from './lock-client';

interface PageParams {
  params: { id: string };
}

export default async function TrialDetailPage({ params }: PageParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/trials/${params.id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect('/trials');
  }

  const { data: trial } = await res.json();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/trials" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              试验详情 - {trial.trialNumber}
            </h2>
            <p className="text-gray-500 mt-1">
              {trial.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrialLockButton
            trialId={trial.id}
            trialStatus={trial.status}
            userRole={(session.user as any).role}
          />
          {trial.status !== 'LOCKED' && (
            <Link
              href={`/trials/${trial.id}/edit`}
              className="btn-primary"
            >
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </Link>
          )}
          {trial.status === 'LOCKED' && (
            <span className="inline-flex items-center px-3 py-2 rounded-md text-sm text-gray-500 bg-gray-100 cursor-not-allowed">
              <Edit className="w-4 h-4 mr-2 opacity-50" />
              编辑（已锁库）
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">受试者总数</p>
              <p className="text-2xl font-bold text-gray-900">{trial._count?.subjects || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">访视总数</p>
              <p className="text-2xl font-bold text-gray-900">{trial._count?.visits || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">不良事件</p>
              <p className="text-2xl font-bold text-gray-900">{trial._count?.adverseEvents || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">状态</p>
              <span
                className={cn(
                  'badge text-sm mt-1',
                  trialStatusLabels[trial.status]?.color || 'bg-gray-100 text-gray-800'
                )}
              >
                {trialStatusLabels[trial.status]?.label || trial.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <TrialDetailCharts
        statistics={trial.statistics || {}}
        subjectCount={trial._count?.subjects || 0}
        visitCount={trial._count?.visits || 0}
        aeCount={trial._count?.adverseEvents || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <FlaskConical className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>
          </div>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">试验编号</dt>
              <dd className="text-sm font-medium text-gray-900">{trial.trialNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">试验标题</dt>
              <dd className="text-sm font-medium text-gray-900 text-right max-w-md">
                {trial.title}
              </dd>
            </div>
            {trial.shortName && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">简称</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.shortName}</dd>
              </div>
            )}
            {trial.protocolNumber && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">方案编号</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.protocolNumber}</dd>
              </div>
            )}
            {trial.drugName && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">药物名称</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.drugName}</dd>
              </div>
            )}
            {trial.indication && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">适应症</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.indication}</dd>
              </div>
            )}
            {trial.phase && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">试验阶段</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.phase}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">开始日期</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(trial.startDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">结束日期</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(trial.endDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">计划受试者数</dt>
              <dd className="text-sm font-medium text-gray-900">{trial.plannedSubjects || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">实际受试者数</dt>
              <dd className="text-sm font-medium text-gray-900">{trial.actualSubjects}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">组织信息</h3>
          </div>
          <dl className="space-y-4">
            {trial.sponsor && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">申办方</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.sponsor}</dd>
              </div>
            )}
            {trial.cro && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">CRO</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.cro}</dd>
              </div>
            )}
            {trial.siteName && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">研究中心</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.siteName}</dd>
              </div>
            )}
            {trial.piName && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">主要研究者</dt>
                <dd className="text-sm font-medium text-gray-900">{trial.piName}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">创建人</dt>
              <dd className="text-sm font-medium text-gray-900">
                {trial.createdBy?.name || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">创建时间</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDateTime(trial.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">更新时间</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDateTime(trial.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {trial.description && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">试验描述</h3>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{trial.description}</p>
        </div>
      )}

      {trial.notes && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">备注</h3>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{trial.notes}</p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">受试者列表</h3>
          </div>
          <Link href="/subjects" className="text-sm text-primary-600 hover:text-primary-900">
            查看全部 →
          </Link>
        </div>
        {trial.subjects?.length > 0 ? (
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
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    入组日期
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trial.subjects.map((subject: any) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600">
                      <Link href={`/subjects/${subject.id}`}>
                        {subject.subjectNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {subject.initials}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'badge',
                          subjectStatusLabels[subject.status]?.color || 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {subjectStatusLabels[subject.status]?.label || subject.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(subject.enrollmentDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">暂无受试者</p>
        )}
      </div>
    </div>
  );
}
