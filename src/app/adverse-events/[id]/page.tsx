import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  AlertTriangle,
  User,
  FlaskConical,
  Calendar,
  FileText,
  StickyNote,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import {
  formatDate,
  formatDateTime,
  aeSeverityLabels,
  aeRelationshipLabels,
  aeOutcomeLabels,
  aeActionLabels,
  cn,
} from '@/lib/utils';

interface PageParams {
  params: { id: string };
}

export default async function AdverseEventDetailPage({ params }: PageParams) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/adverse-events/${params.id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect('/adverse-events');
  }

  const { data: ae } = await res.json();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/adverse-events" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              不良事件详情 - {ae.aeNumber}
            </h2>
            <p className="text-gray-500 mt-1">
              查看不良事件完整信息
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/adverse-events/${ae.id}/edit`}
            className="btn-primary"
          >
            <Edit className="w-4 h-4 mr-2" />
            编辑
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">开始日期</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(ae.startDate)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">结束日期</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(ae.endDate)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">严重程度</p>
              <span
                className={cn(
                  'badge mt-1',
                  aeSeverityLabels[ae.severity]?.color || 'bg-gray-100 text-gray-800'
                )}
              >
                {aeSeverityLabels[ae.severity]?.label || ae.severity}
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">严重不良事件</p>
              <p className="text-lg font-bold">
                {ae.isSAE ? (
                  <span className="text-red-600">是</span>
                ) : (
                  <span className="text-gray-600">否</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>
          </div>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">不良事件编号</dt>
              <dd className="text-sm font-medium text-gray-900">
                {ae.aeNumber}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">术语</dt>
              <dd className="text-sm font-medium text-gray-900">
                {ae.term}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">严重程度</dt>
              <dd>
                <span
                  className={cn(
                    'badge',
                    aeSeverityLabels[ae.severity]?.color || 'bg-gray-100 text-gray-800'
                  )}
                >
                  {aeSeverityLabels[ae.severity]?.label || ae.severity}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">严重性</dt>
              <dd className="text-sm font-medium text-gray-900">
                {ae.seriousness ? '是' : '否'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">关联性</dt>
              <dd className="text-sm font-medium text-gray-900">
                {aeRelationshipLabels[ae.relationship] || ae.relationship}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">结果</dt>
              <dd className="text-sm font-medium text-gray-900">
                {aeOutcomeLabels[ae.outcome] || ae.outcome || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">采取措施</dt>
              <dd className="text-sm font-medium text-gray-900">
                {aeActionLabels[ae.action] || ae.action || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">开始日期</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(ae.startDate)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">结束日期</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDate(ae.endDate)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">严重不良事件信息</h3>
            </div>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">是否SAE</dt>
                <dd>
                  {ae.isSAE ? (
                    <span className="badge bg-red-100 text-red-800">是</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-800">否</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">SAE报告日期</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(ae.saeReportedDate)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">报告伦理委员会日期</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDate(ae.reportedToEthics)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">创建人</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {ae.createdBy?.name || '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">创建时间</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatDateTime(ae.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <FlaskConical className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">关联试验</h3>
            </div>
            {ae.trial ? (
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">试验编号</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <Link
                      href={`/trials/${ae.trial.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {ae.trial.trialNumber}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">试验标题</dt>
                  <dd className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                    {ae.trial.title}
                  </dd>
                </div>
                {ae.trial.shortName && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">简称</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {ae.trial.shortName}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-gray-500">无关联试验</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">关联受试者</h3>
            </div>
            {ae.subject ? (
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">受试者编号</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    <Link
                      href={`/subjects/${ae.subject.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {ae.subject.subjectNumber}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">姓名缩写</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {ae.subject.initials}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">性别</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {ae.subject.gender || '-'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">年龄</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {ae.subject.age ?? '-'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-gray-500">无关联受试者</p>
            )}
          </div>
        </div>
      </div>

      {ae.description && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">描述</h3>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {ae.description}
          </p>
        </div>
      )}

      {ae.notes && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <StickyNote className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">备注</h3>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {ae.notes}
          </p>
        </div>
      )}
    </div>
  );
}
