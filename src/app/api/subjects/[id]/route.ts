import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { SubjectStatus, RoleType } from '@prisma/client';
import { calculateAge } from '@/lib/utils';

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'subject:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的受试者ID' }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        trial: {
          select: {
            id: true,
            trialNumber: true,
            title: true,
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
        visits: {
          orderBy: { scheduledDate: 'asc' },
          include: {
            createdBy: { select: { id: true, name: true } },
            completedBy: { select: { id: true, name: true } },
          },
        },
        adverseEvents: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: {
            visits: true,
            adverseEvents: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: '受试者不存在' }, { status: 404 });
    }

    return NextResponse.json({ data: subject });
  } catch (error) {
    console.error('获取受试者详情失败:', error);
    return NextResponse.json({ error: '获取受试者详情失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'subject:update')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的受试者ID' }, { status: 400 });
    }

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '受试者不存在' }, { status: 404 });
    }

    const body = await req.json();
    const {
      subjectNumber,
      initials,
      gender,
      birthDate,
      status,
      enrollmentDate,
      withdrawalDate,
      withdrawalReason,
      trialId,
    } = body;

    const updateData: any = {};
    const userId = parseInt((session.user as any).id, 10);

    if (subjectNumber !== undefined && subjectNumber.trim()) {
      if (subjectNumber !== existing.subjectNumber) {
        const dup = await prisma.subject.findUnique({ where: { subjectNumber: subjectNumber.trim() } });
        if (dup) {
          return NextResponse.json({ error: '受试者编号已存在' }, { status: 400 });
        }
        updateData.subjectNumber = subjectNumber.trim();
      }
    }

    if (initials !== undefined) updateData.initials = initials;
    if (gender !== undefined) updateData.gender = gender || null;
    
    if (birthDate !== undefined) {
      updateData.birthDate = birthDate ? new Date(birthDate) : null;
      updateData.age = birthDate ? calculateAge(new Date(birthDate)) : null;
    }

    if (status !== undefined && Object.values(SubjectStatus).includes(status)) {
      updateData.status = status;
    }

    if (enrollmentDate !== undefined) {
      updateData.enrollmentDate = enrollmentDate ? new Date(enrollmentDate) : null;
    }
    if (withdrawalDate !== undefined) {
      updateData.withdrawalDate = withdrawalDate ? new Date(withdrawalDate) : null;
    }
    if (withdrawalReason !== undefined) {
      updateData.withdrawalReason = withdrawalReason || null;
    }
    let oldTrialId: number | null = null;
    if (trialId !== undefined) {
      const trial = await prisma.trial.findUnique({ where: { id: trialId } });
      if (!trial) {
        return NextResponse.json({ error: '试验不存在' }, { status: 400 });
      }
      if (trialId !== existing.trialId) {
        oldTrialId = existing.trialId;
        updateData.trialId = trialId;
      }
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: updateData,
      include: {
        trial: { select: { id: true, trialNumber: true, title: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (oldTrialId !== null && trialId !== undefined) {
      await prisma.trial.update({
        where: { id: oldTrialId },
        data: { actualSubjects: { decrement: 1 } },
      });
      await prisma.trial.update({
        where: { id: trialId },
        data: { actualSubjects: { increment: 1 } },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'SUBJECT',
        entityId: id,
        newValue: JSON.stringify(updateData),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ data: subject });
  } catch (error) {
    console.error('更新受试者失败:', error);
    return NextResponse.json({ error: '更新受试者失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'subject:delete')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的受试者ID' }, { status: 400 });
    }

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '受试者不存在' }, { status: 404 });
    }

    const userId = parseInt((session.user as any).id, 10);

    await prisma.subject.delete({ where: { id } });

    await prisma.trial.update({
      where: { id: existing.trialId },
      data: { actualSubjects: { decrement: 1 } },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'SUBJECT',
        entityId: id,
        oldValue: JSON.stringify(existing),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除受试者失败:', error);
    return NextResponse.json({ error: '删除受试者失败' }, { status: 500 });
  }
}
