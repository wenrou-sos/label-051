import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { AESeverity, AERelationship, AEOutcome, AEAction, RoleType } from '@prisma/client';

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
    if (!hasPermission(userRole, 'ae:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的不良事件ID' }, { status: 400 });
    }

    const ae = await prisma.adverseEvent.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            subjectNumber: true,
            initials: true,
            gender: true,
            age: true,
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
      },
    });

    if (!ae) {
      return NextResponse.json({ error: '不良事件不存在' }, { status: 404 });
    }

    return NextResponse.json({ data: ae });
  } catch (error) {
    console.error('获取不良事件详情失败:', error);
    return NextResponse.json({ error: '获取不良事件详情失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'ae:update')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的不良事件ID' }, { status: 400 });
    }

    const existing = await prisma.adverseEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '不良事件不存在' }, { status: 404 });
    }

    const trial = await prisma.trial.findUnique({ where: { id: existing.trialId } });
    if (trial?.status === 'LOCKED') {
      return NextResponse.json({ error: '试验已锁库，无法修改不良事件' }, { status: 400 });
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
    } = body;

    const userId = parseInt((session.user as any).id, 10);
    const updateData: any = {};

    if (aeNumber !== undefined && aeNumber.trim()) {
      if (aeNumber !== existing.aeNumber) {
        const dup = await prisma.adverseEvent.findUnique({ where: { aeNumber: aeNumber.trim() } });
        if (dup) {
          return NextResponse.json({ error: '不良事件编号已存在' }, { status: 409 });
        }
        updateData.aeNumber = aeNumber.trim();
      }
    }
    if (term !== undefined && term.trim()) {
      updateData.term = term.trim();
    }
    if (description !== undefined) {
      updateData.description = description || null;
    }
    if (startDate !== undefined) {
      updateData.startDate = new Date(startDate);
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate) : null;
    }
    if (severity !== undefined && Object.values(AESeverity).includes(severity)) {
      updateData.severity = severity;
    }
    if (seriousness !== undefined) {
      updateData.seriousness = !!seriousness;
    }
    if (relationship !== undefined && Object.values(AERelationship).includes(relationship)) {
      updateData.relationship = relationship;
    }
    if (outcome !== undefined) {
      updateData.outcome = outcome || null;
    }
    if (action !== undefined) {
      updateData.action = action || null;
    }
    if (isSAE !== undefined) {
      updateData.isSAE = !!isSAE;
    }
    if (saeReportedDate !== undefined) {
      updateData.saeReportedDate = saeReportedDate ? new Date(saeReportedDate) : null;
    }
    if (reportedToEthics !== undefined) {
      updateData.reportedToEthics = reportedToEthics ? new Date(reportedToEthics) : null;
    }

    const ae = await prisma.adverseEvent.update({
      where: { id },
      data: updateData,
      include: {
        subject: { select: { id: true, subjectNumber: true, initials: true } },
        trial: { select: { id: true, trialNumber: true, shortName: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'AdverseEvent',
        entityId: id,
        newValue: JSON.stringify(updateData),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ data: ae });
  } catch (error) {
    console.error('更新不良事件失败:', error);
    return NextResponse.json({ error: '更新不良事件失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'ae:delete')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的不良事件ID' }, { status: 400 });
    }

    const existing = await prisma.adverseEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '不良事件不存在' }, { status: 404 });
    }

    const trial = await prisma.trial.findUnique({ where: { id: existing.trialId } });
    if (trial?.status === 'LOCKED') {
      return NextResponse.json({ error: '试验已锁库，无法删除不良事件' }, { status: 400 });
    }

    const userId = parseInt((session.user as any).id, 10);

    await prisma.adverseEvent.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'AdverseEvent',
        entityId: id,
        oldValue: JSON.stringify(existing),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除不良事件失败:', error);
    return NextResponse.json({ error: '删除不良事件失败' }, { status: 500 });
  }
}
