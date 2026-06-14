import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { VisitStatus, VisitType, RoleType } from '@prisma/client';

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
    if (!hasPermission(userRole, 'visit:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的访视ID' }, { status: 400 });
    }

    const visit = await prisma.visit.findUnique({
      where: { id },
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
            title: true,
            shortName: true,
            status: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        completedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!visit) {
      return NextResponse.json({ error: '访视不存在' }, { status: 404 });
    }

    return NextResponse.json({ data: visit });
  } catch (error) {
    console.error('获取访视详情失败:', error);
    return NextResponse.json({ error: '获取访视详情失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'visit:update')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的访视ID' }, { status: 400 });
    }

    const existing = await prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '访视不存在' }, { status: 404 });
    }

    const trial = await prisma.trial.findUnique({ where: { id: existing.trialId } });
    if (trial?.status === 'LOCKED') {
      return NextResponse.json({ error: '试验已锁库，无法修改访视' }, { status: 400 });
    }

    const body = await req.json();
    const {
      visitNumber,
      name,
      type,
      status,
      scheduledDate,
      actualDate,
      windowStart,
      windowEnd,
      location,
      notes,
    } = body;

    const userId = parseInt((session.user as any).id, 10);
    const updateData: any = {};

    if (visitNumber !== undefined && visitNumber.trim()) {
      updateData.visitNumber = visitNumber.trim();
    }
    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
    }
    if (type !== undefined && Object.values(VisitType).includes(type)) {
      updateData.type = type;
    }
    if (status !== undefined && Object.values(VisitStatus).includes(status)) {
      updateData.status = status;
      if (status === VisitStatus.COMPLETED && existing.status !== VisitStatus.COMPLETED) {
        updateData.completedById = userId;
        updateData.actualDate = actualDate ? new Date(actualDate) : new Date();
      }
    }
    if (scheduledDate !== undefined) {
      updateData.scheduledDate = new Date(scheduledDate);
    }
    if (actualDate !== undefined) {
      updateData.actualDate = actualDate ? new Date(actualDate) : null;
    }
    if (windowStart !== undefined) {
      updateData.windowStart = windowStart ? new Date(windowStart) : null;
    }
    if (windowEnd !== undefined) {
      updateData.windowEnd = windowEnd ? new Date(windowEnd) : null;
    }
    if (location !== undefined) {
      updateData.location = location || null;
    }
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: updateData,
      include: {
        subject: { select: { id: true, subjectNumber: true, initials: true } },
        trial: { select: { id: true, trialNumber: true, shortName: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        completedBy: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Visit',
        entityId: id,
        newValue: JSON.stringify(updateData),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ data: visit });
  } catch (error) {
    console.error('更新访视失败:', error);
    return NextResponse.json({ error: '更新访视失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'visit:delete')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的访视ID' }, { status: 400 });
    }

    const existing = await prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '访视不存在' }, { status: 404 });
    }

    const trial = await prisma.trial.findUnique({ where: { id: existing.trialId } });
    if (trial?.status === 'LOCKED') {
      return NextResponse.json({ error: '试验已锁库，无法删除访视' }, { status: 400 });
    }

    const userId = parseInt((session.user as any).id, 10);

    await prisma.visit.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Visit',
        entityId: id,
        oldValue: JSON.stringify(existing),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除访视失败:', error);
    return NextResponse.json({ error: '删除访视失败' }, { status: 500 });
  }
}
