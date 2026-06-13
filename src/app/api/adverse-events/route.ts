import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { AESeverity, AERelationship, AEOutcome, AEAction, RoleType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'ae:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const subjectId = searchParams.get('subjectId');
    const trialId = searchParams.get('trialId');
    const severity = searchParams.get('severity') as AESeverity | null;
    const isSAE = searchParams.get('isSAE');
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (subjectId) {
      where.subjectId = parseInt(subjectId, 10);
    }
    if (trialId) {
      where.trialId = parseInt(trialId, 10);
    }
    if (severity && Object.values(AESeverity).includes(severity)) {
      where.severity = severity;
    }
    if (isSAE !== null && isSAE !== undefined) {
      where.isSAE = isSAE === 'true';
    }
    if (search) {
      where.OR = [
        { term: { contains: search } },
        { description: { contains: search } },
        { aeNumber: { contains: search } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [aes, total] = await Promise.all([
      prisma.adverseEvent.findMany({
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
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adverseEvent.count({ where }),
    ]);

    return NextResponse.json({
      data: aes,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取不良事件列表失败:', error);
    return NextResponse.json({ error: '获取不良事件列表失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'ae:create')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await req.json();
    const {
      aeNumber,
      term,
      description,
      startDate,
      endDate,
      severity,
      seriousness,
      relationship,
      outcome,
      action,
      isSAE,
      saeReportedDate,
      reportedToEthics,
      subjectId,
      trialId,
    } = body;

    const errors: string[] = [];
    if (!aeNumber?.trim()) errors.push('不良事件编号不能为空');
    if (!term?.trim()) errors.push('不良事件术语不能为空');
    if (!startDate) errors.push('发生日期不能为空');
    if (!severity || !Object.values(AESeverity).includes(severity)) errors.push('严重程度无效');
    if (!relationship || !Object.values(AERelationship).includes(relationship)) errors.push('关联性无效');
    if (!subjectId) errors.push('受试者ID不能为空');
    if (!trialId) errors.push('试验ID不能为空');

    if (errors.length > 0) {
      return NextResponse.json({ error: '验证失败', details: errors }, { status: 400 });
    }

    const existing = await prisma.adverseEvent.findUnique({ where: { aeNumber: aeNumber.trim() } });
    if (existing) {
      return NextResponse.json({ error: '不良事件编号已存在' }, { status: 409 });
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ error: '受试者不存在' }, { status: 404 });
    }

    const trial = await prisma.trial.findUnique({ where: { id: trialId } });
    if (!trial) {
      return NextResponse.json({ error: '试验不存在' }, { status: 404 });
    }

    if (subject.trialId !== trialId) {
      return NextResponse.json(
        { error: '受试者不属于所选试验，请选择正确的受试者' },
        { status: 400 }
      );
    }

    const userId = parseInt((session.user as any).id, 10);

    const createData: any = {
      aeNumber: aeNumber.trim(),
      term: term.trim(),
      description: description || null,
      startDate: new Date(startDate),
      severity,
      seriousness: !!seriousness,
      relationship,
      isSAE: !!isSAE,
      subjectId,
      trialId,
      createdById: userId,
    };

    if (endDate) createData.endDate = new Date(endDate);
    if (outcome && Object.values(AEOutcome).includes(outcome)) createData.outcome = outcome;
    if (action && Object.values(AEAction).includes(action)) createData.action = action;
    if (saeReportedDate) createData.saeReportedDate = new Date(saeReportedDate);
    if (reportedToEthics) createData.reportedToEthics = new Date(reportedToEthics);

    const ae = await prisma.adverseEvent.create({
      data: createData,
      include: {
        subject: { select: { id: true, subjectNumber: true, initials: true } },
        trial: { select: { id: true, trialNumber: true, shortName: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'AdverseEvent',
        entityId: ae.id,
        newValue: JSON.stringify(createData),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ data: ae }, { status: 201 });
  } catch (error) {
    console.error('创建不良事件失败:', error);
    return NextResponse.json({ error: '创建不良事件失败' }, { status: 500 });
  }
}
