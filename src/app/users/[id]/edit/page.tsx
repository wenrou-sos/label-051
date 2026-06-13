'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { roleLabels } from '@/lib/utils';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    department: '',
    title: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          router.push('/users');
          return;
        }
        const response = await res.json();
        const data = response.data || {};
        setFormData({
          name: data.name || '',
          email: data.email || '',
          password: '',
          confirmPassword: '',
          role: data.role || '',
          phone: data.phone || '',
          department: data.department || '',
          title: data.title || '',
        });
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = '姓名为必填项';
    }
    if (!formData.email.trim()) {
      newErrors.email = '邮箱为必填项';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = '密码至少6个字符';
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    if (!formData.role) {
      newErrors.role = '请选择角色';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: Record<string, string> = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role,
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      if (formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }
      if (formData.department.trim()) {
        payload.department = formData.department.trim();
      }
      if (formData.title.trim()) {
        payload.title = formData.title.trim();
      }

      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/users');
      } else {
        alert(data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新用户失败:', error);
      alert('更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/users" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">编辑用户</h2>
          <p className="text-gray-500 mt-1">修改用户信息</p>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入姓名"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="请输入邮箱"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新密码
              </label>
              <input
                type="password"
                name="password"
                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="留空则不修改"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                确认新密码
              </label>
              <input
                type="password"
                name="confirmPassword"
                className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="留空则不修改"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                角色 <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                className={`input-field ${errors.role ? 'border-red-500' : ''}`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">请选择角色</option>
                {Object.entries(roleLabels).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                电话
              </label>
              <input
                type="text"
                name="phone"
                className="input-field"
                value={formData.phone}
                onChange={handleChange}
                placeholder="请输入电话"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部门
              </label>
              <input
                type="text"
                name="department"
                className="input-field"
                value={formData.department}
                onChange={handleChange}
                placeholder="请输入部门"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                职称
              </label>
              <input
                type="text"
                name="title"
                className="input-field"
                value={formData.title}
                onChange={handleChange}
                placeholder="请输入职称"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/users" className="btn-secondary">
              取消
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
