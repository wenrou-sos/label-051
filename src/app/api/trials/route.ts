import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { TrialStatus, RoleType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'trial:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as TrialStatus | null;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { trialNumber: { contains: search } },
        { shortName: { contains: search } },
        { drugName: { contains: search } },
        { indication: { contains: search } },
      ];
    }

    if (status && Object.values(TrialStatus).includes(status)) {
      where.status = status;
    }

    const skip = (page - 1) * pageSize;

    const [trials, total] = await Promise.all([
      prisma.trial.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.trial.count({ where }),
    ]);

    return NextResponse.json({
      data: trials,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取试验列表失败:', error);
    return NextResponse.json({ error: '获取试验列表失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'trial:create')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await req.json();
    const {
      trialNumber,
      title,
      shortName,
      description,
      protocolNumber,
      indication,
      drugName,
      phase,
      status,
      startDate,
      endDate,
      plannedSubjects,
      sponsor,
      cro,
      siteName,
      piName,
      notes,
    } = body;

    if (!trialNumber?.trim()) {
      return NextResponse.json({ error: '试验编号不能为空' }, { status: 400 });
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: '试验标题不能为空' }, { status: 400 });
    }

    const existingTrial = await prisma.trial.findUnique({
      where: { trialNumber: trialNumber.trim() },
    });
    if (existingTrial) {
      return NextResponse.json({ error: '试验编号已存在' }, { status: 409 });
    }

    const userId = parseInt((session.user as any).id, 10);

    const trialData: any = {
      trialNumber: trialNumber.trim(),
      title: title.trim(),
      createdById: userId,
    };

    if (shortName !== undefined) trialData.shortName = shortName.trim() || null;
    if (description !== undefined) trialData.description = description || null;
    if (protocolNumber !== undefined) trialData.protocolNumber = protocolNumber.trim() || null;
    if (indication !== undefined) trialData.indication = indication.trim() || null;
    if (drugName !== undefined) trialData.drugName = drugName.trim() || null;
    if (phase !== undefined) trialData.phase = phase.trim() || null;
    if (status && Object.values(TrialStatus).includes(status)) {
      trialData.status = status;
    }
    if (startDate) trialData.startDate = new Date(startDate);
    if (endDate) trialData.endDate = new Date(endDate);
    if (plannedSubjects !== undefined) {
      trialData.plannedSubjects = plannedSubjects ? parseInt(plannedSubjects, 10) : null;
    }
    if (sponsor !== undefined) trialData.sponsor = sponsor.trim() || null;
    if (cro !== undefined) trialData.cro = cro.trim() || null;
    if (siteName !== undefined) trialData.siteName = siteName.trim() || null;
    if (piName !== undefined) trialData.piName = piName.trim() || null;
    if (notes !== undefined) trialData.notes = notes || null;

    const trial = await prisma.trial.create({
      data: trialData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Trial',
        entityId: trial.id,
        userId: userId,
        userEmail: session.user?.email || undefined,
        newValue: JSON.stringify(trialData),
      },
    });

    return NextResponse.json({ data: trial }, { status: 201 });
  } catch (error) {
    console.error('创建试验失败:', error);
    return NextResponse.json({ error: '创建试验失败' }, { status: 500 });
  }
}
