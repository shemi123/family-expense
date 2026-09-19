import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '../api/budgetApi';
import { categoryApi } from '../api/categoryApi';
import { BudgetSummary } from '../types/budget';
import { useAuthStore } from '../store/useAuthStore';
import { Modal } from '../components/common/Modal';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export const Budgets: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');

  const { data: budgetSummaries, isLoading } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetApi.getBudgetSummaries(month, year),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'EXPENSE'],
    queryFn: () => categoryApi.getCategories('EXPENSE'),
  });

  const setBudgetMutation = useMutation({
    mutationFn: budgetApi.setBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      closeModal();
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: budgetApi.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const openModal = (categoryId?: string, currentLimit?: number) => {
    setSelectedCategoryId(categoryId || (categories && categories.length > 0 ? categories[0].id : ''));
    setLimitAmount(currentLimit ? currentLimit.toString() : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategoryId('');
    setLimitAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetMutation.mutate({
      categoryId: selectedCategoryId,
      month,
      year,
      limitAmount: parseFloat(limitAmount) || 0,
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Monthly Category Budgets</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Set spending ceilings and monitor real-time over-budget alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Navigator */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 min-w-[110px] text-center">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : budgetSummaries && budgetSummaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetSummaries.map((b) => {
            const isOver = b.isOverBudget;
            const pct = Math.min(b.percentageUsed, 100);
            const progressColor =
              b.percentageUsed >= 100
                ? 'bg-rose-500'
                : b.percentageUsed >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500';

            return (
              <div
                key={b.categoryId}
                className={`p-6 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                  isOver
                    ? 'border-rose-300 shadow-md shadow-rose-500/10 ring-1 ring-rose-300'
                    : 'border-slate-200/80 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon name={b.categoryIcon} color={b.categoryColor} />
                      <div>
                        <h3 className="font-bold text-sm text-slate-800">{b.categoryName}</h3>
                        <span className="text-[11px] font-medium text-slate-400">
                          Budget for {monthNames[month - 1]}
                        </span>
                      </div>
                    </div>

                    {b.budgetId && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove budget limit for "${b.categoryName}"?`)) {
                            deleteBudgetMutation.mutate(b.budgetId!);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Over-budget alert badge */}
                  {isOver && (
                    <div className="mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span>
                        Over budget by {currency}
                        {Number(b.spentAmount - b.limitAmount).toFixed(2)} ({b.percentageUsed}%)
                      </span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Spent: {currency}{Number(b.spentAmount).toFixed(2)}</span>
                      <span className="font-bold text-slate-700">Limit: {currency}{Number(b.limitAmount).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Remaining</span>
                  <span
                    className={`text-sm font-bold ${
                      b.remainingAmount < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {b.remainingAmount < 0 ? '-' : ''}{currency}
                    {Math.abs(Number(b.remainingAmount)).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No category budgets set for this month</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Set monthly targets for Groceries, Dining, Rent, or Shopping to prevent overspending.
          </p>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            Create First Budget
          </button>
        </div>
      )}

      {/* Set Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Set Budget for ${monthNames[month - 1]} ${year}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Expense Category
            </label>
            <select
              required
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Monthly Limit ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              placeholder="e.g. 500.00"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              disabled={setBudgetMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              Save Budget Limit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
