import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  User,
  FlaskConical,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  subjectStatusLabels,
  visitStatusLabels,
  visitTypeLabels,
  aeSeverityLabels,
  aeRelationshipLabels,
  cn,
} from '@/lib/utils';
import DeleteSubjectButton from '@/components/DeleteSubjectButton';

interface PageParams {
  params: { id: string };
}

export default async function SubjectDetailPage({ params }: PageParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/subjects/${params.id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect('/subjects');
  }

  const { data: subject } = await res.json();

  const totalVisits = subject._count?.visits || 0;
  const completedVisits = subject.visits?.filter((v: any) => v.status === 'COMPLETED').length || 0;
  const totalAEs = subject._count?.adverseEvents || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/subjects" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              受试者详情 - {subject.subjectNumber}
            </h2>
            <p className="text-gray-500 mt-1">
              查看受试者完整信息及相关记录
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {subject.trial?.status !== 'LOCKED' ? (
            <>
              <Link
                href={`/subjects/${subject.id}/edit`}
                className="btn-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Link>
              <DeleteSubjectButton id={subject.id} />
            </>
          ) : (
            <span className="inline-flex items-center px-3 py-2 rounded-md text-sm text-gray-500 bg-gray-100 cursor-not-allowed">
              <Edit className="w-4 h-4 mr-2 opacity-50" />
              已锁库，无法编辑
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总访视数</p>
              <p className="text-2xl font-bold text-gray-900">{totalVisits}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已完成访视</p>
              <p className="text-2xl font-bold text-gray-900">{completedVisits}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">不良事件数</p>
              <p className="text-2xl font-bold text-gray-900">{totalAEs}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>
          </div>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">受试者编号</dt>
              <dd className="text-sm font-medium text-gray-900">
                {subject.subjectNumber}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">姓名缩写</dt>
              <dd className="text-sm font-medium text-gray-900">
                {subject.initials}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">性别</dt>
              <dd className="text-sm font-medium text-gray-900">
                {subject.gender || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">出生日期</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(subject.birthDate)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">年龄</dt>
              <dd className="text-sm font-medium text-gray-900">
                {subject.age ?? '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">状态</dt>
              <dd>
                <span
                  className={cn(
                    'badge',
                    subjectStatusLabels[subject.status]?.color || 'bg-gray-100 text-gray-800'
                  )}
                >
                  {subjectStatusLabels[subject.status]?.label || subject.status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">入组日期</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(subject.enrollmentDate)}
              </dd>
            </div>
            {subject.status === 'WITHDRAWN' && (
              <>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">退出日期</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(subject.withdrawalDate)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">退出原因</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {subject.withdrawalReason || '-'}
                  </dd>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">创建人</dt>
              <dd className="text-sm font-medium text-gray-900">
                {subject.createdBy?.name || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">创建时间</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDateTime(subject.createdAt)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <FlaskConical className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">所属试验</h3>
          </div>
          {subject.trial ? (
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">试验编号</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <Link
                    href={`/trials/${subject.trial.id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    {subject.trial.trialNumber}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">试验标题</dt>
                <dd className="text-sm font-medium text-gray-900 text-right">
                  {subject.trial.title}
                </dd>
              </div>
              {subject.trial.shortName && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">简称</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {subject.trial.shortName}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-gray-500">无关联试验</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">访视记录</h3>
        </div>
        {subject.visits?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    访视编号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    计划日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    实际日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建人
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subject.visits.map((visit: any) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600">
                      <Link href={`/visits/${visit.id}`}>
                        {visit.visitNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {visit.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {visitTypeLabels[visit.type] || visit.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'badge',
                          visitStatusLabels[visit.status]?.color || 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {visitStatusLabels[visit.status]?.label || visit.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(visit.scheduledDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(visit.actualDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {visit.createdBy?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">暂无访视记录</p>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">不良事件记录</h3>
        </div>
        {subject.adverseEvents?.length > 0 ? (
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
                    开始日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    结束日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SAE
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subject.adverseEvents.map((ae: any) => (
                  <tr key={ae.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-600">
                      <Link href={`/adverse-events/${ae.id}`}>
                        {ae.aeNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {ae.term}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'badge',
                          aeSeverityLabels[ae.severity]?.color || 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {aeSeverityLabels[ae.severity]?.label || ae.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {aeRelationshipLabels[ae.relationship] || ae.relationship}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(ae.startDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(ae.endDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {ae.isSAE ? (
                        <span className="badge bg-red-100 text-red-800">是</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-800">否</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">暂无不良事件记录</p>
        )}
      </div>
    </div>
  );
}
