import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { TrialStatus, RoleType } from '@prisma/client';

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
    if (!hasPermission(userRole, 'trial:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的试验ID' }, { status: 400 });
    }

    const trial = await prisma.trial.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subjects: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            subjects: true,
            visits: true,
            adverseEvents: true,
          },
        },
      },
    });

    if (!trial) {
      return NextResponse.json({ error: '试验不存在' }, { status: 404 });
    }

    const [subjectStatusGroup, visitStatusGroup, aeSeverityGroup] = await Promise.all([
      prisma.subject.groupBy({
        by: ['status'],
        where: { trialId: id },
        _count: { status: true },
      }),
      prisma.visit.groupBy({
        by: ['status'],
        where: { trialId: id },
        _count: { status: true },
      }),
      prisma.adverseEvent.groupBy({
        by: ['severity'],
        where: { trialId: id },
        _count: { severity: true },
      }),
    ]);

    const subjectStatusDistribution: Record<string, number> = {};
    subjectStatusGroup.forEach((item) => {
      subjectStatusDistribution[item.status] = item._count.status;
    });

    const visitStatusDistribution: Record<string, number> = {};
    visitStatusGroup.forEach((item) => {
      visitStatusDistribution[item.status] = item._count.status;
    });

    const aeSeverityDistribution: Record<string, number> = {};
    aeSeverityGroup.forEach((item) => {
      aeSeverityDistribution[item.severity] = item._count.severity;
    });

    const trialWithStats = {
      ...trial,
      statistics: {
        subjectStatusDistribution,
        visitStatusDistribution,
        aeSeverityDistribution,
      },
    };

    return NextResponse.json({ data: trialWithStats });
  } catch (error) {
    console.error('获取试验详情失败:', error);
    return NextResponse.json({ error: '获取试验详情失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'trial:update')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的试验ID' }, { status: 400 });
    }

    const existingTrial = await prisma.trial.findUnique({ where: { id } });
    if (!existingTrial) {
      return NextResponse.json({ error: '试验不存在' }, { status: 404 });
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
      actualSubjects,
      sponsor,
      cro,
      siteName,
      piName,
      notes,
    } = body;

    if (trialNumber !== undefined && !trialNumber?.trim()) {
      return NextResponse.json({ error: '试验编号不能为空' }, { status: 400 });
    }
    if (title !== undefined && !title?.trim()) {
      return NextResponse.json({ error: '试验标题不能为空' }, { status: 400 });
    }

    if (trialNumber !== undefined && trialNumber.trim() !== existingTrial.trialNumber) {
      const duplicateTrial = await prisma.trial.findUnique({
        where: { trialNumber: trialNumber.trim() },
      });
      if (duplicateTrial) {
        return NextResponse.json({ error: '试验编号已存在' }, { status: 409 });
      }
    }

    const userId = parseInt((session.user as any).id, 10);
    const updateData: any = {};
    const changedFields: { field: string; old: any; new: any }[] = [];

    if (trialNumber !== undefined) {
      const val = trialNumber.trim();
      if (val !== existingTrial.trialNumber) {
        updateData.trialNumber = val;
        changedFields.push({ field: 'trialNumber', old: existingTrial.trialNumber, new: val });
      }
    }
    if (title !== undefined) {
      const val = title.trim();
      if (val !== existingTrial.title) {
        updateData.title = val;
        changedFields.push({ field: 'title', old: existingTrial.title, new: val });
      }
    }
    if (shortName !== undefined) {
      const val = shortName.trim() || null;
      if (val !== existingTrial.shortName) {
        updateData.shortName = val;
        changedFields.push({ field: 'shortName', old: existingTrial.shortName, new: val });
      }
    }
    if (description !== undefined) {
      const val = description || null;
      if (val !== existingTrial.description) {
        updateData.description = val;
        changedFields.push({ field: 'description', old: existingTrial.description, new: val });
      }
    }
    if (protocolNumber !== undefined) {
      const val = protocolNumber.trim() || null;
      if (val !== existingTrial.protocolNumber) {
        updateData.protocolNumber = val;
        changedFields.push({ field: 'protocolNumber', old: existingTrial.protocolNumber, new: val });
      }
    }
    if (indication !== undefined) {
      const val = indication.trim() || null;
      if (val !== existingTrial.indication) {
        updateData.indication = val;
        changedFields.push({ field: 'indication', old: existingTrial.indication, new: val });
      }
    }
    if (drugName !== undefined) {
      const val = drugName.trim() || null;
      if (val !== existingTrial.drugName) {
        updateData.drugName = val;
        changedFields.push({ field: 'drugName', old: existingTrial.drugName, new: val });
      }
    }
    if (phase !== undefined) {
      const val = phase.trim() || null;
      if (val !== existingTrial.phase) {
        updateData.phase = val;
        changedFields.push({ field: 'phase', old: existingTrial.phase, new: val });
      }
    }
    if (status !== undefined && Object.values(TrialStatus).includes(status)) {
      if (status !== existingTrial.status) {
        updateData.status = status;
        changedFields.push({ field: 'status', old: existingTrial.status, new: status });
      }
    }
    if (startDate !== undefined) {
      const val = startDate ? new Date(startDate).toISOString() : null;
      const oldVal = existingTrial.startDate ? existingTrial.startDate.toISOString() : null;
      if (val !== oldVal) {
        updateData.startDate = startDate ? new Date(startDate) : null;
        changedFields.push({ field: 'startDate', old: oldVal, new: val });
      }
    }
    if (endDate !== undefined) {
      const val = endDate ? new Date(endDate).toISOString() : null;
      const oldVal = existingTrial.endDate ? existingTrial.endDate.toISOString() : null;
      if (val !== oldVal) {
        updateData.endDate = endDate ? new Date(endDate) : null;
        changedFields.push({ field: 'endDate', old: oldVal, new: val });
      }
    }
    if (plannedSubjects !== undefined) {
      const val = plannedSubjects ? parseInt(plannedSubjects, 10) : null;
      if (val !== existingTrial.plannedSubjects) {
        updateData.plannedSubjects = val;
        changedFields.push({ field: 'plannedSubjects', old: existingTrial.plannedSubjects, new: val });
      }
    }
    if (actualSubjects !== undefined) {
      const val = parseInt(actualSubjects, 10) || 0;
      if (val !== existingTrial.actualSubjects) {
        updateData.actualSubjects = val;
        changedFields.push({ field: 'actualSubjects', old: existingTrial.actualSubjects, new: val });
      }
    }
    if (sponsor !== undefined) {
      const val = sponsor.trim() || null;
      if (val !== existingTrial.sponsor) {
        updateData.sponsor = val;
        changedFields.push({ field: 'sponsor', old: existingTrial.sponsor, new: val });
      }
    }
    if (cro !== undefined) {
      const val = cro.trim() || null;
      if (val !== existingTrial.cro) {
        updateData.cro = val;
        changedFields.push({ field: 'cro', old: existingTrial.cro, new: val });
      }
    }
    if (siteName !== undefined) {
      const val = siteName.trim() || null;
      if (val !== existingTrial.siteName) {
        updateData.siteName = val;
        changedFields.push({ field: 'siteName', old: existingTrial.siteName, new: val });
      }
    }
    if (piName !== undefined) {
      const val = piName.trim() || null;
      if (val !== existingTrial.piName) {
        updateData.piName = val;
        changedFields.push({ field: 'piName', old: existingTrial.piName, new: val });
      }
    }
    if (notes !== undefined) {
      const val = notes || null;
      if (val !== existingTrial.notes) {
        updateData.notes = val;
        changedFields.push({ field: 'notes', old: existingTrial.notes, new: val });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ data: existingTrial, message: '没有需要更新的字段' });
    }

    const trial = await prisma.trial.update({
      where: { id },
      data: updateData,
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

    if (changedFields.length > 0) {
      await prisma.$transaction(
        changedFields.map((field) =>
          prisma.auditLog.create({
            data: {
              action: 'UPDATE',
              entityType: 'Trial',
              entityId: id,
              fieldName: field.field,
              oldValue: field.old !== null && field.old !== undefined ? String(field.old) : null,
              newValue: field.new !== null && field.new !== undefined ? String(field.new) : null,
              userId: userId,
              userEmail: session.user?.email || undefined,
            },
          })
        )
      );
    }

    return NextResponse.json({ data: trial });
  } catch (error) {
    console.error('更新试验失败:', error);
    return NextResponse.json({ error: '更新试验失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'trial:delete')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的试验ID' }, { status: 400 });
    }

    const existingTrial = await prisma.trial.findUnique({ where: { id } });
    if (!existingTrial) {
      return NextResponse.json({ error: '试验不存在' }, { status: 404 });
    }

    const subjectCount = await prisma.subject.count({ where: { trialId: id } });
    if (subjectCount > 0) {
      return NextResponse.json(
        { error: `该试验下存在 ${subjectCount} 名受试者，无法删除` },
        { status: 400 }
      );
    }

    const userId = parseInt((session.user as any).id, 10);

    await prisma.trial.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Trial',
        entityId: id,
        userId: userId,
        userEmail: session.user?.email || undefined,
        oldValue: JSON.stringify(existingTrial),
      },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除试验失败:', error);
    return NextResponse.json({ error: '删除试验失败' }, { status: 500 });
  }
}
