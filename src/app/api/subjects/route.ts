import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SubjectStatus, RoleType } from '@prisma/client';
import { calculateAge } from '@/lib/utils';

const CAN_WRITE_ROLES: RoleType[] = [RoleType.ADMIN, RoleType.INVESTIGATOR, RoleType.DOCTOR, RoleType.COORDINATOR];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') as SubjectStatus | undefined;
    const trialId = searchParams.get('trialId') ? parseInt(searchParams.get('trialId')!, 10) : undefined;

    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { subjectNumber: { contains: search } },
        { initials: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (trialId) {
      where.trialId = trialId;
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          trial: {
            select: { id: true, trialNumber: true, title: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.subject.count({ where }),
    ]);

    return NextResponse.json({
      data: subjects,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取受试者列表失败:', error);
    return NextResponse.json({ error: '获取受试者列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!CAN_WRITE_ROLES.includes(userRole)) {
      return NextResponse.json({ error: '无权限执行此操作' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.subjectNumber || !body.initials || !body.trialId) {
      return NextResponse.json(
        { error: '受试者编号、姓名缩写和试验ID为必填字段' },
        { status: 400 }
      );
    }

    const existing = await prisma.subject.findUnique({
      where: { subjectNumber: body.subjectNumber },
    });
    if (existing) {
      return NextResponse.json({ error: '受试者编号已存在' }, { status: 400 });
    }

    const trial = await prisma.trial.findUnique({
      where: { id: body.trialId },
    });
    if (!trial) {
      return NextResponse.json({ error: '试验不存在' }, { status: 400 });
    }

    let age: number | null = null;
    if (body.birthDate) {
      age = calculateAge(new Date(body.birthDate));
    }

    const userId = parseInt((session.user as any).id, 10);

    const subject = await prisma.subject.create({
      data: {
        subjectNumber: body.subjectNumber,
        initials: body.initials,
        gender: body.gender || null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        age,
        status: body.status || SubjectStatus.SCREENING,
        enrollmentDate: body.enrollmentDate ? new Date(body.enrollmentDate) : null,
        trialId: body.trialId,
        createdById: userId,
      },
      include: {
        trial: {
          select: { id: true, trialNumber: true, title: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.trial.update({
      where: { id: body.trialId },
      data: { actualSubjects: { increment: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'SUBJECT',
        entityId: subject.id,
        newValue: JSON.stringify(subject),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ data: subject, message: '创建成功' }, { status: 201 });
  } catch (error) {
    console.error('创建受试者失败:', error);
    return NextResponse.json({ error: '创建受试者失败' }, { status: 500 });
  }
}
