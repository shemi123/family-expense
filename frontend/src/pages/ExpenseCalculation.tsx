import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expenseCalculationApi } from '../api/expenseCalculationApi';
import { accountApi } from '../api/accountApi';
import { categoryApi } from '../api/categoryApi';
import { CalculationPeriod, ExpenseCalculationFilterParams } from '../types/expenseCalculation';
import { useAuthStore } from '../store/useAuthStore';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Users,
  WalletCards,
  Loader2,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  Layers,
} from 'lucide-react';

export const ExpenseCalculation: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  // Preset & Filter state
  const [period, setPeriod] = useState<CalculationPeriod>('THIS_MONTH');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filterParams: ExpenseCalculationFilterParams = {
    period: period === 'CUSTOM' ? 'CUSTOM' : period,
    startDate: period === 'CUSTOM' && startDate ? startDate : undefined,
    endDate: period === 'CUSTOM' && endDate ? endDate : undefined,
    accountId: selectedAccount || undefined,
    categoryId: selectedCategory || undefined,
  };

  const { data: calculation, isLoading } = useQuery({
    queryKey: ['expense-calculation', filterParams],
    queryFn: () => expenseCalculationApi.getCalculation(filterParams),
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountApi.getAccounts,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories('EXPENSE'),
  });

  const presets: { id: CalculationPeriod; label: string }[] = [
    { id: 'THIS_MONTH', label: 'This Month' },
    { id: 'LAST_MONTH', label: 'Last Month' },
    { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
    { id: 'LAST_90_DAYS', label: 'Last 90 Days' },
    { id: 'THIS_YEAR', label: 'This Year' },
    { id: 'CUSTOM', label: 'Custom Range' },
  ];

  // Helper for max value in trend bars
  const maxDailyAmount = calculation?.dailyTrend
    ? Math.max(...calculation.dailyTrend.map((d) => Number(d.amount)), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-7 h-7 text-indigo-600" />
            Expense Calculator & Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Detailed spending calculations, period comparisons, daily averages, and budget analytics
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                period === p.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Account</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
          >
            <option value="">All Accounts</option>
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Expense Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
          >
            <option value="">All Expense Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {period === 'CUSTOM' && (
          <>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
              />
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-72 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 mt-2">Computing calculations...</p>
        </div>
      ) : calculation ? (
        <>
          {/* Active Period Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 bg-indigo-50/60 px-4 py-2.5 rounded-xl border border-indigo-100">
            <span className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Period: {calculation.startDate} to {calculation.endDate} ({calculation.totalDaysInPeriod} days)
            </span>
            <span>
              Net Income vs Expense Ratio:{' '}
              <strong className="text-slate-800">{calculation.expenseToIncomeRatio}%</strong>
            </span>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Expense */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">
                  {currency}
                  {Number(calculation.totalExpense).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  {calculation.expenseChangePercentage >= 0 ? (
                    <span className="inline-flex items-center text-rose-600 font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{calculation.expenseChangePercentage}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-emerald-600 font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {calculation.expenseChangePercentage}%
                    </span>
                  )}
                  <span className="text-slate-400">vs prev period</span>
                </div>
              </div>
            </div>

            {/* Card 2: Daily Average */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Average Spend</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">
                  {currency}
                  {Number(calculation.averageDailyExpense).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <span className="text-xs text-slate-400 font-normal"> /day</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Weekly Avg: <strong className="text-slate-700">{currency}{Number(calculation.averageWeeklyExpense).toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {/* Card 3: Transaction Stats */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expense Entries</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">
                  {calculation.totalExpenseTransactions}
                  <span className="text-xs text-slate-400 font-normal"> transactions</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Avg transaction: <strong className="text-slate-700">{currency}{Number(calculation.averageExpenseTransactionAmount).toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {/* Card 4: Budget Utilization */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Budget Used</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  {calculation.budgetUtilizationPercentage > 100 ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">{calculation.budgetUtilizationPercentage}% Used</span>
                  <span className="text-slate-400">Limit: {currency}{Number(calculation.totalBudgetLimit).toFixed(0)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      calculation.budgetUtilizationPercentage > 100
                        ? 'bg-rose-500'
                        : calculation.budgetUtilizationPercentage > 85
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(calculation.budgetUtilizationPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Safe daily spend remaining: <strong className="text-slate-800">{currency}{Number(calculation.suggestedSafeDailySpend).toFixed(2)}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown Progress Bars */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  Category Expense Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Percentage breakdown and average expenditure per category
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600">
                {calculation.categoryBreakdown.length} Categories
              </span>
            </div>

            {calculation.categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {calculation.categoryBreakdown.map((cat) => (
                  <div key={cat.categoryId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={cat.icon} color={cat.color} className="w-4 h-4" />
                        <span className="text-slate-800 font-bold">{cat.categoryName}</span>
                        <span className="text-slate-400 font-normal">
                          ({cat.transactionCount} entries · Avg {currency}{Number(cat.averageTransactionAmount).toFixed(2)})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-900 font-bold">
                          {currency}
                          {Number(cat.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="ml-2 text-indigo-600 font-black">{cat.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                          backgroundColor: cat.color || '#4f46e5',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No expense entries match your selected period or filters.
              </div>
            )}
          </div>

          {/* Account & Member Distribution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Spend Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <WalletCards className="w-4 h-4 text-indigo-600" />
                Expenses by Account
              </h3>
              <div className="space-y-3">
                {calculation.accountBreakdown.map((acc) => (
                  <div key={acc.accountId} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{acc.accountName}</p>
                      <p className="text-[11px] text-slate-400">{acc.transactionCount} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{currency}{Number(acc.amount).toFixed(2)}</p>
                      <p className="text-[11px] font-bold text-indigo-600">{acc.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Member Spend Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Expenses by Household Member
              </h3>
              <div className="space-y-3">
                {calculation.userBreakdown.map((usr) => (
                  <div key={usr.userId} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {usr.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{usr.userName}</p>
                        <p className="text-[11px] text-slate-400">{usr.transactionCount} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{currency}{Number(usr.amount).toFixed(2)}</p>
                      <p className="text-[11px] font-bold text-indigo-600">{usr.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Trend Visualizer */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Daily Expense Trend Visualization
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily spending volume over selected range ({calculation.dailyTrend.length} days)
                </p>
              </div>
            </div>

            {calculation.dailyTrend.length > 0 ? (
              <div className="pt-6 pb-2">
                <div className="h-44 flex items-end gap-1.5 sm:gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                  {calculation.dailyTrend.map((d) => {
                    const amt = Number(d.amount);
                    const heightPct = Math.max(Math.round((amt / maxDailyAmount) * 100), amt > 0 ? 4 : 1);
                    return (
                      <div key={d.date} className="flex-1 min-w-[20px] flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] p-2 rounded-lg z-20 whitespace-nowrap shadow-xl">
                          <span className="font-bold">{d.date}</span>
                          <span>{currency}{amt.toFixed(2)} ({d.transactionCount} tx)</span>
                        </div>
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            amt > 0 ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-100'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{calculation.startDate}</span>
                  <span>{calculation.endDate}</span>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
};
