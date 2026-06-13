import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { VisitStatus, VisitType, RoleType } from '@prisma/client';

async function createAuditLog(
  action: string,
  entityType: string,
  entityId: number,
  userId: number | undefined,
  userEmail: string | undefined,
  fieldName?: string,
  oldValue?: string,
  newValue?: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      fieldName,
      oldValue,
      newValue,
      userId,
      userEmail,
    },
  });
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'visit:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const subjectId = searchParams.get('subjectId');
    const trialId = searchParams.get('trialId');
    const status = searchParams.get('status') as VisitStatus | null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { visitNumber: { contains: search } },
        { name: { contains: search } },
        { location: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (subjectId) {
      where.subjectId = parseInt(subjectId, 10);
    }
    if (trialId) {
      where.trialId = parseInt(trialId, 10);
    }
    if (status && Object.values(VisitStatus).includes(status)) {
      where.status = status;
    }
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) {
        where.scheduledDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.scheduledDate.lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * pageSize;

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        skip,
        take: pageSize,
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
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          completedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          scheduledDate: 'desc',
        },
      }),
      prisma.visit.count({ where }),
    ]);

    return NextResponse.json({
      data: visits,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取访视列表失败:', error);
    return NextResponse.json({ error: '获取访视列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    const userId = parseInt((session.user as any).id, 10);
    const userEmail = session.user?.email ?? undefined;

    if (!hasPermission(userRole, 'visit:create')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json();

    const {
      visitNumber,
      name,
      type,
      scheduledDate,
      subjectId,
      trialId,
      status,
      actualDate,
      windowStart,
      windowEnd,
      location,
      notes,
    } = body;

    const errors: string[] = [];

    if (!visitNumber || typeof visitNumber !== 'string' || visitNumber.trim() === '') {
      errors.push('visitNumber 为必填字段');
    }
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push('name 为必填字段');
    }
    if (!type || !Object.values(VisitType).includes(type as VisitType)) {
      errors.push('type 为必填字段，且必须是有效的访视类型');
    }
    if (!scheduledDate) {
      errors.push('scheduledDate 为必填字段');
    }
    if (!subjectId || typeof subjectId !== 'number') {
      errors.push('subjectId 为必填字段');
    }
    if (!trialId || typeof trialId !== 'number') {
      errors.push('trialId 为必填字段');
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: '验证失败', details: errors }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      return NextResponse.json({ error: '受试者不存在' }, { status: 404 });
    }

    const trial = await prisma.trial.findUnique({
      where: { id: trialId },
    });
    if (!trial) {
      return NextResponse.json({ error: '试验不存在' }, { status: 404 });
    }

    if (subject.trialId !== trialId) {
      return NextResponse.json(
        { error: '受试者不属于所选试验，请选择正确的受试者' },
        { status: 400 }
      );
    }

    const createData: any = {
      visitNumber: visitNumber.trim(),
      name: name.trim(),
      type: type as VisitType,
      scheduledDate: new Date(scheduledDate),
      subjectId,
      trialId,
      createdById: userId,
    };

    if (status && Object.values(VisitStatus).includes(status as VisitStatus)) {
      createData.status = status as VisitStatus;
      if (status === VisitStatus.COMPLETED) {
        createData.completedById = userId;
        createData.actualDate = actualDate ? new Date(actualDate) : new Date();
      }
    }

    if (windowStart) {
      createData.windowStart = new Date(windowStart);
    }
    if (windowEnd) {
      createData.windowEnd = new Date(windowEnd);
    }
    if (location !== undefined) {
      createData.location = location;
    }
    if (notes !== undefined) {
      createData.notes = notes;
    }

    const visit = await prisma.visit.create({
      data: createData,
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
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        completedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await createAuditLog('CREATE', 'Visit', visit.id, userId, userEmail);

    return NextResponse.json({ data: visit }, { status: 201 });
  } catch (error) {
    console.error('创建访视失败:', error);
    return NextResponse.json({ error: '创建访视失败' }, { status: 500 });
  }
}
