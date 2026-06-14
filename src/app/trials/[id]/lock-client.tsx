'use client';

import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrialLockButtonProps {
  trialId: number;
  trialStatus: string;
  userRole: string;
}

export default function TrialLockButton({ trialId, trialStatus, userRole }: TrialLockButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [targetStatus, setTargetStatus] = useState('COMPLETED');
  const [error, setError] = useState('');

  const isLocked = trialStatus === 'LOCKED';
  const isAdmin = userRole === 'ADMIN';

  if (!isAdmin) {
    return null;
  }

  const handleClick = () => {
    setError('');
    setReason('');
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLocked ? 'unlock' : 'lock';
      const body = isLocked
        ? { reason, targetStatus }
        : { reason };

      const res = await fetch(`/api/trials/${trialId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '操作失败');
      }

      setShowDialog(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={isLocked
          ? 'btn-secondary'
          : 'inline-flex items-center justify-center px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors'
        }
      >
        {isLocked ? (
          <Unlock className="w-4 h-4 mr-2" />
        ) : (
          <Lock className="w-4 h-4 mr-2" />
        )}
        {isLocked ? '解锁' : '锁库'}
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isLocked ? '解锁试验' : '锁库试验'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {isLocked && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    解锁后状态
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="COMPLETED">已完成</option>
                    <option value="ACTIVE">进行中</option>
                    <option value="SUSPENDED">暂停</option>
                    <option value="RECRUITING">招募中</option>
                    <option value="DRAFT">草稿</option>
                    <option value="TERMINATED">终止</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isLocked ? '解锁原因' : '锁库原因'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder={isLocked ? '请输入解锁原因...' : '请输入锁库原因...'}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDialog(false)}
                disabled={isLoading}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? '处理中...' : isLocked ? '确认解锁' : '确认锁库'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
