import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { RoleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
    if (!hasPermission(userRole, 'user:read')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        department: true,
        title: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            createdTrials: true,
            createdSubjects: true,
            createdVisits: true,
            createdAEs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json({ error: '获取用户详情失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'user:update')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const body = await req.json();
    const { email, name, role, phone, department, title, password } = body;
    const updateData: any = {};
    const userId = parseInt((session.user as any).id, 10);

    if (email !== undefined) {
      if (email.trim() !== existing.email) {
        const duplicate = await prisma.user.findUnique({ where: { email: email.trim() } });
        if (duplicate) {
          return NextResponse.json({ error: '邮箱已存在' }, { status: 400 });
        }
        updateData.email = email.trim();
      }
    }

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (department !== undefined) updateData.department = department || null;
    if (title !== undefined) updateData.title = title || null;

    if (role !== undefined) {
      if (!Object.values(RoleType).includes(role)) {
        return NextResponse.json({ error: '无效的角色类型' }, { status: 400 });
      }
      if (role !== existing.role) {
        if (id === userId) {
          return NextResponse.json({ error: '不能修改自己的角色' }, { status: 400 });
        }
        updateData.role = role;
      }
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json({ error: '密码长度不能少于6位' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        department: true,
        title: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        newValue: JSON.stringify(updateData),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userRole = (session.user as any).role as RoleType;
    if (!hasPermission(userRole, 'user:delete')) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的用户ID' }, { status: 400 });
    }

    const userId = parseInt((session.user as any).id, 10);
    if (id === userId) {
      return NextResponse.json({ error: '不能删除自己' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const [trialCount, subjectCount, visitCount, aeCount] = await Promise.all([
      prisma.trial.count({ where: { createdById: id } }),
      prisma.subject.count({ where: { createdById: id } }),
      prisma.visit.count({ where: { createdById: id } }),
      prisma.adverseEvent.count({ where: { createdById: id } }),
    ]);

    if (trialCount > 0 || subjectCount > 0 || visitCount > 0 || aeCount > 0) {
      return NextResponse.json(
        { error: '该用户已创建过业务记录，无法删除' },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'User',
        entityId: id,
        oldValue: JSON.stringify(existing),
        userId,
        userEmail: session.user?.email || undefined,
      },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 });
  }
}
