import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { TrialStatus, RoleType } from '@prisma/client';

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'trial:lock')) {
      return NextResponse.json({ error: '权限不足，只有管理员可以锁库' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的试验ID' }, { status: 400 });
    }

    const existingTrial = await prisma.trial.findUnique({ where: { id } });
    if (!existingTrial) {
      return NextResponse.json({ error: '试验不存在' }, { status: 404 });
    }

    if (existingTrial.status === TrialStatus.LOCKED) {
      return NextResponse.json({ error: '试验已处于锁库状态' }, { status: 400 });
    }

    const body = await req.json();
    const { reason } = body;

    const userId = parseInt((session.user as any).id, 10);
    const userEmail = session.user?.email || undefined;

    const previousStatus = existingTrial.status;

    const trial = await prisma.trial.update({
      where: { id },
      data: {
        status: TrialStatus.LOCKED,
      },
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
        action: 'LOCK',
        entityType: 'Trial',
        entityId: id,
        fieldName: 'status',
        oldValue: previousStatus,
        newValue: TrialStatus.LOCKED,
        userId,
        userEmail,
      },
    });

    if (reason?.trim()) {
      await prisma.auditLog.create({
        data: {
          action: 'LOCK_REASON',
          entityType: 'Trial',
          entityId: id,
          fieldName: 'lockReason',
          newValue: reason.trim(),
          userId,
          userEmail,
        },
      });
    }

    return NextResponse.json({ data: trial, message: '锁库成功' });
  } catch (error) {
    console.error('锁库失败:', error);
    return NextResponse.json({ error: '锁库失败' }, { status: 500 });
  }
}
