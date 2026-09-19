import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringApi } from '../api/recurringApi';
import { accountApi } from '../api/accountApi';
import { categoryApi } from '../api/categoryApi';
import { RecurringPayload, Frequency } from '../types/recurring';
import { TransactionType } from '../types/category';
import { useAuthStore } from '../store/useAuthStore';
import { Modal } from '../components/common/Modal';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  Zap,
  Loader2,
} from 'lucide-react';

export const Recurring: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingMsg, setProcessingMsg] = useState<string | null>(null);

  // Form State
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [frequency, setFrequency] = useState<Frequency>('MONTHLY');
  const [intervalCount, setIntervalCount] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const { data: recurringList, isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: recurringApi.getRecurring,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountApi.getAccounts,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: recurringApi.createRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      closeModal();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: recurringApi.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: recurringApi.deleteRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });

  const processMutation = useMutation({
    mutationFn: recurringApi.processDue,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setProcessingMsg(`Batch run complete! Auto-generated ${data.generatedTransactions} due transactions.`);
      setTimeout(() => setProcessingMsg(null), 5000);
    },
  });

  const openModal = () => {
    setAccountId(accounts && accounts.length > 0 ? accounts[0].id : '');
    setCategoryId(categories && categories.length > 0 ? categories[0].id : '');
    setAmount('');
    setType('EXPENSE');
    setFrequency('MONTHLY');
    setIntervalCount('1');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setNotes('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: RecurringPayload = {
      accountId,
      categoryId,
      amount: parseFloat(amount),
      type,
      frequency,
      intervalCount: parseInt(intervalCount) || 1,
      startDate,
      endDate: endDate || undefined,
      notes: notes || undefined,
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recurring Schedules</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Automate fixed expenses like rent, subscriptions, or recurring salary
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => processMutation.mutate(undefined)}
            disabled={processMutation.isPending}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Process Due Now</span>
          </button>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Schedule</span>
          </button>
        </div>
      </div>

      {processingMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>{processingMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : recurringList && recurringList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringList.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                item.isActive
                  ? 'border-slate-200/80 shadow-sm hover:shadow-md'
                  : 'border-slate-200 bg-slate-50/60 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CategoryIcon name={item.categoryIcon} color={item.categoryColor} />
                    <div>
                      <h3 className="font-bold text-sm text-slate-800">{item.categoryName}</h3>
                      <span className="text-[11px] font-medium text-slate-400">
                        {item.accountName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleMutation.mutate(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      title={item.isActive ? 'Pause' : 'Resume'}
                    >
                      {item.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this recurring schedule? Past generated transactions remain intact.')) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p
                    className={`text-xl font-extrabold ${
                      item.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {item.type === 'INCOME' ? '+' : '-'}{currency}
                    {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {item.frequency} (Every {item.intervalCount})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">{item.notes}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Next: <strong className="text-slate-700">{item.nextExecutionDate}</strong></span>
                </div>
                {item.lastExecutedDate && (
                  <span className="text-[11px] text-slate-400">
                    Last: {item.lastExecutedDate}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <Repeat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No recurring transactions scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Set up automatic scheduled transactions for rent, utilities, streaming services, or recurring wages.
          </p>
          <button
            onClick={openModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            Create Recurring Schedule
          </button>
        </div>
      )}

      {/* New Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="New Recurring Transaction Schedule"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Account
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                {accounts?.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Category
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                {categories
                  ?.filter((c) => c.type === type)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BI_WEEKLY">Bi-Weekly (2 Weeks)</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Interval Multiplier
              </label>
              <input
                type="number"
                min="1"
                required
                value={intervalCount}
                onChange={(e) => setIntervalCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Monthly Netflix standard plan"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              Create Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
