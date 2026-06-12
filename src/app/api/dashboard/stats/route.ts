import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TrialStatus, SubjectStatus, AESeverity, VisitStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const [
      trialCount,
      subjectCount,
      inProgressVisits,
      pendingAECount,
      trialsByStatus,
      subjectsByStatus,
      aesBySeverity,
    ] = await Promise.all([
      prisma.trial.count(),
      prisma.subject.count(),
      prisma.visit.count({
        where: { status: VisitStatus.IN_PROGRESS },
      }),
      prisma.adverseEvent.count({
        where: {
          outcome: {
            notIn: ['RECOVERED', 'FATAL'],
          },
        },
      }),
      prisma.trial.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.subject.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.adverseEvent.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),
    ]);

    const trialStatusDistribution: Record<string, number> = {};
    Object.values(TrialStatus).forEach((status) => {
      trialStatusDistribution[status] = 0;
    });
    trialsByStatus.forEach((item) => {
      trialStatusDistribution[item.status] = item._count.status;
    });

    const subjectStatusDistribution: Record<string, number> = {};
    Object.values(SubjectStatus).forEach((status) => {
      subjectStatusDistribution[status] = 0;
    });
    subjectsByStatus.forEach((item) => {
      subjectStatusDistribution[item.status] = item._count.status;
    });

    const aeSeverityDistribution: Record<string, number> = {};
    Object.values(AESeverity).forEach((severity) => {
      aeSeverityDistribution[severity] = 0;
    });
    aesBySeverity.forEach((item) => {
      aeSeverityDistribution[item.severity] = item._count.severity;
    });

    return NextResponse.json({
      trialCount,
      subjectCount,
      inProgressVisits,
      pendingAECount,
      trialStatusDistribution,
      subjectStatusDistribution,
      aeSeverityDistribution,
    });
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error);
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
