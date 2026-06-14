import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  FlaskConical,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
} from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  visitStatusLabels,
  visitTypeLabels,
  cn,
} from '@/lib/utils';

interface PageParams {
  params: { id: string };
}

export default async function VisitDetailPage({ params }: PageParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/visits/${params.id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect('/visits');
  }

  const { data: visit } = await res.json();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/visits" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              访视详情 - {visit.visitNumber}
            </h2>
            <p className="text-gray-500 mt-1">{visit.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {visit.trial?.status !== 'LOCKED' ? (
            <Link
              href={`/visits/${visit.id}/edit`}
              className="btn-primary"
            >
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </Link>
          ) : (
            <span className="inline-flex items-center px-3 py-2 rounded-md text-sm text-gray-500 bg-gray-100 cursor-not-allowed">
              <Edit className="w-4 h-4 mr-2 opacity-50" />
              已锁库，无法编辑
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">计划日期</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(visit.scheduledDate)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">状态</p>
              <span
                className={cn(
                  'badge text-sm',
                  visitStatusLabels[visit.status]?.color || 'bg-gray-100 text-gray-800'
                )}
              >
                {visitStatusLabels[visit.status]?.label || visit.status}
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">访视类型</p>
              <p className="text-lg font-bold text-gray-900">
                {visitTypeLabels[visit.type] || visit.type}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">地点</p>
              <p className="text-lg font-bold text-gray-900">{visit.location || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">受试者信息</h3>
          </div>
          {visit.subject ? (
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">受试者编号</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <Link
                    href={`/subjects/${visit.subject.id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    {visit.subject.subjectNumber}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">姓名缩写</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {visit.subject.initials}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-500">无受试者信息</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <FlaskConical className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">所属试验</h3>
          </div>
          {visit.trial ? (
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">试验编号</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <Link
                    href={`/trials/${visit.trial.id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    {visit.trial.trialNumber}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">试验标题</dt>
                <dd className="text-sm font-medium text-gray-900 text-right max-w-md">
                  {visit.trial.title}
                </dd>
              </div>
              {visit.trial.shortName && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">简称</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {visit.trial.shortName}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-gray-500">无试验信息</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">访视详情</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">访视编号</dt>
              <dd className="text-sm font-medium text-gray-900">{visit.visitNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">访视名称</dt>
              <dd className="text-sm font-medium text-gray-900">{visit.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">访视类型</dt>
              <dd className="text-sm font-medium text-gray-900">
                {visitTypeLabels[visit.type] || visit.type}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">状态</dt>
              <dd>
                <span
                  className={cn(
                    'badge',
                    visitStatusLabels[visit.status]?.color || 'bg-gray-100 text-gray-800'
                  )}
                >
                  {visitStatusLabels[visit.status]?.label || visit.status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">计划日期</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(visit.scheduledDate)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">实际日期</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(visit.actualDate)}
              </dd>
            </div>
          </dl>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">访视窗口开始</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(visit.windowStart)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">访视窗口结束</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(visit.windowEnd)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">地点</dt>
              <dd className="text-sm font-medium text-gray-900">{visit.location || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">创建人</dt>
              <dd className="text-sm font-medium text-gray-900">
                {visit.createdBy?.name || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">创建时间</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDateTime(visit.createdAt)}
              </dd>
            </div>
            {visit.completedBy && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">完成人</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {visit.completedBy.name}
                </dd>
              </div>
            )}
          </dl>
        </div>
        {visit.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <dt className="text-sm text-gray-500 mb-2">备注</dt>
            <dd className="text-sm text-gray-700 whitespace-pre-wrap">
              {visit.notes}
            </dd>
          </div>
        )}
      </div>
    </div>
  );
}
