import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { RoleType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'timeline:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const trialId = searchParams.get('trialId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!subjectId && !trialId) {
      return NextResponse.json({ error: '需要指定 subjectId 或 trialId' }, { status: 400 });
    }

    const visitWhere: any = {};
    const aeWhere: any = {};

    if (subjectId) {
      const sid = parseInt(subjectId, 10);
      visitWhere.subjectId = sid;
      aeWhere.subjectId = sid;
    }
    if (trialId) {
      const tid = parseInt(trialId, 10);
      visitWhere.trialId = tid;
      aeWhere.trialId = tid;
    }
    if (dateFrom || dateTo) {
      const dateFilter: any = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      visitWhere.scheduledDate = dateFilter;
      aeWhere.startDate = dateFilter;
    }

    const [visits, adverseEvents] = await Promise.all([
      prisma.visit.findMany({
        where: visitWhere,
        include: {
          subject: {
            select: {
              id: true,
              subjectNumber: true,
              initials: true,
            },
          },
          trial: {
            select: {
              id: true,
              trialNumber: true,
              shortName: true,
            },
          },
          completedBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { scheduledDate: 'asc' },
      }),
      prisma.adverseEvent.findMany({
        where: aeWhere,
        include: {
          subject: {
            select: {
              id: true,
              subjectNumber: true,
              initials: true,
            },
          },
          trial: {
            select: {
              id: true,
              trialNumber: true,
              shortName: true,
            },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { startDate: 'asc' },
      }),
    ]);

    const timeline: any[] = [];

    visits.forEach((visit) => {
      timeline.push({
        id: `visit-${visit.id}`,
        type: 'visit',
        date: visit.actualDate || visit.scheduledDate,
        scheduledDate: visit.scheduledDate,
        actualDate: visit.actualDate,
        title: visit.name,
        description: `访视编号: ${visit.visitNumber}`,
        status: visit.status,
        entity: visit,
        subject: visit.subject,
        trial: visit.trial,
      });
    });

    adverseEvents.forEach((ae) => {
      timeline.push({
        id: `ae-${ae.id}`,
        type: 'adverse-event',
        date: ae.startDate,
        startDate: ae.startDate,
        endDate: ae.endDate,
        title: ae.term,
        description: ae.description || '',
        severity: ae.severity,
        isSAE: ae.isSAE,
        seriousness: ae.seriousness,
        relationship: ae.relationship,
        entity: ae,
        subject: ae.subject,
        trial: ae.trial,
      });
    });

    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      data: timeline,
      stats: {
        totalVisits: visits.length,
        totalAdverseEvents: adverseEvents.length,
        totalEvents: timeline.length,
      },
    });
  } catch (error) {
    console.error('获取时间线数据失败:', error);
    return NextResponse.json({ error: '获取时间线数据失败' }, { status: 500 });
  }
}
