import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../api/transactionApi';
import { accountApi } from '../api/accountApi';
import { categoryApi } from '../api/categoryApi';
import { authApi } from '../api/authApi';
import { Transaction, TransactionPayload, TransactionFilters } from '../types/transaction';
import { TransactionType } from '../types/category';
import { Frequency } from '../types/recurring';
import { useAuthStore } from '../store/useAuthStore';
import { Modal } from '../components/common/Modal';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  ExternalLink,
  Layers,
  Copy,
  RotateCcw,
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const currency = user?.currency === 'EUR' ? '€' : user?.currency === 'GBP' ? '£' : user?.currency === 'INR' ? '₹' : '$';

  // Filters & Pagination State
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form State
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('MONTHLY');
  const [intervalCount, setIntervalCount] = useState('1');
  const [recurringEndDate, setRecurringEndDate] = useState('');

  const filterParams: TransactionFilters = {
    page,
    size: pageSize,
    accountId: selectedAccount || undefined,
    categoryId: selectedCategory || undefined,
    type: (selectedType as TransactionType) || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: searchTerm || undefined,
  };

  const { data: pagedData, isLoading } = useQuery({
    queryKey: ['transactions', filterParams],
    queryFn: () => transactionApi.getTransactions(filterParams),
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
    mutationFn: transactionApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TransactionPayload }) =>
      transactionApi.updateTransaction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      closeModal();
    },
  });

  // Multi-Entry State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState(new Date().toISOString().split('T')[0]);
  const [defaultAccountId, setDefaultAccountId] = useState('');
  const [defaultType, setDefaultType] = useState<TransactionType>('EXPENSE');
  const [bulkRows, setBulkRows] = useState<
    {
      id: string;
      type: TransactionType;
      date: string;
      accountId: string;
      categoryId: string;
      amount: string;
      notes: string;
    }[]
  >([]);

  const deleteMutation = useMutation({
    mutationFn: transactionApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (payloads: TransactionPayload[]) => transactionApi.createBulkTransactions(payloads),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      closeBulkModal();
    },
  });

  const openBulkModal = () => {
    const initialAccount = accounts && accounts.length > 0 ? accounts[0].id : '';
    const initialDate = new Date().toISOString().split('T')[0];
    const initialType: TransactionType = 'EXPENSE';

    setDefaultAccountId(initialAccount);
    setDefaultDate(initialDate);
    setDefaultType(initialType);

    const getFirstCategory = (t: TransactionType) => {
      const match = categories?.find((c) => c.type === t);
      return match ? match.id : '';
    };

    const initialRows = Array.from({ length: 3 }).map((_, idx) => ({
      id: `row-${Date.now()}-${idx}`,
      type: initialType,
      date: initialDate,
      accountId: initialAccount,
      categoryId: getFirstCategory(initialType),
      amount: '',
      notes: '',
    }));

    setBulkRows(initialRows);
    setIsBulkModalOpen(true);
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setBulkRows([]);
  };

  const addBulkRow = () => {
    const getFirstCategory = (t: TransactionType) => {
      const match = categories?.find((c) => c.type === t);
      return match ? match.id : '';
    };

    setBulkRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random()}`,
        type: defaultType,
        date: defaultDate,
        accountId: defaultAccountId || (accounts && accounts.length > 0 ? accounts[0].id : ''),
        categoryId: getFirstCategory(defaultType),
        amount: '',
        notes: '',
      },
    ]);
  };

  const copyBulkRow = (index: number) => {
    const source = bulkRows[index];
    if (!source) return;
    const newRow = {
      ...source,
      id: `row-${Date.now()}-${Math.random()}`,
    };
    const updated = [...bulkRows];
    updated.splice(index + 1, 0, newRow);
    setBulkRows(updated);
  };

  const removeBulkRow = (index: number) => {
    if (bulkRows.length <= 1) return;
    setBulkRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index: number, field: string, value: string) => {
    setBulkRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[index] };

      if (field === 'type') {
        const newType = value as TransactionType;
        row.type = newType;
        const catMatch = categories?.find((c) => c.id === row.categoryId);
        if (!catMatch || catMatch.type !== newType) {
          const firstCat = categories?.find((c) => c.type === newType);
          row.categoryId = firstCat ? firstCat.id : '';
        }
      } else {
        (row as any)[field] = value;
      }

      updated[index] = row;
      return updated;
    });
  };

  const applyDefaultsToAll = () => {
    setBulkRows((prev) =>
      prev.map((row) => {
        const newType = defaultType;
        let newCat = row.categoryId;
        const catMatch = categories?.find((c) => c.id === newCat);
        if (!catMatch || catMatch.type !== newType) {
          const firstCat = categories?.find((c) => c.type === newType);
          newCat = firstCat ? firstCat.id : '';
        }
        return {
          ...row,
          date: defaultDate || row.date,
          accountId: defaultAccountId || row.accountId,
          type: newType,
          categoryId: newCat,
        };
      })
    );
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = bulkRows.filter(
      (r) => r.accountId && r.categoryId && parseFloat(r.amount) > 0 && r.date
    );

    if (validRows.length === 0) {
      alert('Please fill out at least one valid transaction row with an amount greater than 0.');
      return;
    }

    const payloads: TransactionPayload[] = validRows.map((r) => ({
      accountId: r.accountId,
      categoryId: r.categoryId,
      amount: parseFloat(r.amount),
      type: r.type,
      date: r.date,
      notes: r.notes || undefined,
    }));

    bulkCreateMutation.mutate(payloads);
  };

  const totalBulkExpense = bulkRows
    .filter((r) => r.type === 'EXPENSE' && !isNaN(parseFloat(r.amount)))
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const totalBulkIncome = bulkRows
    .filter((r) => r.type === 'INCOME' && !isNaN(parseFloat(r.amount)))
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);


  const openCreateModal = () => {
    setEditingTransaction(null);
    setAccountId(accounts && accounts.length > 0 ? accounts[0].id : '');
    setCategoryId(categories && categories.length > 0 ? categories[0].id : '');
    setAmount('');
    setType('EXPENSE');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setReceiptUrl('');
    setIsRecurring(false);
    setFrequency('MONTHLY');
    setIntervalCount('1');
    setRecurringEndDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setAccountId(t.accountId);
    setCategoryId(t.categoryId);
    setAmount(t.amount.toString());
    setType(t.type);
    setDate(t.date);
    setNotes(t.notes || '');
    setReceiptUrl(t.receiptUrl || '');
    setIsRecurring(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TransactionPayload = {
      accountId,
      categoryId,
      amount: parseFloat(amount),
      type,
      date,
      notes: notes || undefined,
      receiptUrl: receiptUrl || undefined,
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
      intervalCount: isRecurring ? parseInt(intervalCount) || 1 : undefined,
      recurringEndDate: isRecurring && recurringEndDate ? recurringEndDate : undefined,
    };

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleExportCsv = async () => {
    try {
      await transactionApi.exportCsv({
        accountId: selectedAccount || undefined,
        categoryId: selectedCategory || undefined,
        type: (selectedType as TransactionType) || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchTerm || undefined,
      });
    } catch (err) {
      alert('Failed to export transactions.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions Ledger</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Filter, search, add, or export household transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openBulkModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 shadow-sm transition-all"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Multi-Entry</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>

        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search notes/category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Account Filter */}
        <div>
          <select
            value={selectedAccount}
            onChange={(e) => {
              setSelectedAccount(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          >
            <option value="">All Accounts</option>
            {accounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          >
            <option value="">All Types</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          />
        </div>

        {/* End Date */}
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : pagedData && pagedData.content.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Account</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {pagedData.content.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <CategoryIcon name={tx.categoryIcon} color={tx.categoryColor} className="w-4 h-4" />
                          <span className="font-semibold text-slate-800">{tx.categoryName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {tx.accountName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {tx.userName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {tx.notes || '-'}
                        {tx.receiptUrl && (
                          <a
                            href={tx.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-1.5 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                            title="Receipt link"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {tx.isRecurring && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 font-semibold">
                            Auto
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                        <span
                          className={
                            tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                          }
                        >
                          {tx.type === 'INCOME' ? '+' : '-'}{currency}
                          {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this transaction? The account balance will be reversed.')) {
                                deleteMutation.mutate(tx.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold">{pagedData.page * pagedData.size + 1}</span> to{' '}
                <span className="font-semibold">
                  {Math.min((pagedData.page + 1) * pagedData.size, pagedData.totalElements)}
                </span>{' '}
                of <span className="font-semibold">{pagedData.totalElements}</span> entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagedData.page === 0}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-700 px-2">
                  Page {pagedData.page + 1} of {pagedData.totalPages || 1}
                </span>
                <button
                  disabled={pagedData.last || pagedData.page + 1 >= pagedData.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No transactions match your filters</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your date range or filters, or add a new transaction.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    type === 'EXPENSE'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    type === 'INCOME'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Income
                </button>
              </div>
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
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {accounts?.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({currency}{Number(acc.balance).toFixed(2)})
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Weekly grocery run at Trader Joe's"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Receipt URL (Optional)
            </label>
            <input
              type="url"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://drive.google.com/... or receipt link"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {!editingTransaction && (
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  Repeat this transaction automatically (Recurring)
                </span>
              </label>

              {isRecurring && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as Frequency)}
                      className="w-full p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="BI_WEEKLY">Every 2 Weeks</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Interval
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={intervalCount}
                      onChange={(e) => setIntervalCount(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={recurringEndDate}
                      onChange={(e) => setRecurringEndDate(e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {editingTransaction ? 'Update Transaction' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Multi-Entry Transaction Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={closeBulkModal}
        title="Multi-Entry Transaction Batch"
        maxWidth="max-w-5xl"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          {/* Header Controls for Batch Defaults */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                Row Defaults & Batch Controls
              </span>
              <button
                type="button"
                onClick={applyDefaultsToAll}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Apply Defaults to All Rows
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Default Date
                </label>
                <input
                  type="date"
                  value={defaultDate}
                  onChange={(e) => setDefaultDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Default Account
                </label>
                <select
                  value={defaultAccountId}
                  onChange={(e) => setDefaultAccountId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Default Type
                </label>
                <select
                  value={defaultType}
                  onChange={(e) => setDefaultType(e.target.value as TransactionType)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Summary Metrics */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-4">
              <span>
                Total Rows: <strong className="text-slate-900">{bulkRows.length}</strong>
              </span>
              <span>
                Expenses Sum:{' '}
                <strong className="text-rose-600">
                  -{currency}
                  {totalBulkExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </span>
              <span>
                Income Sum:{' '}
                <strong className="text-emerald-600">
                  +{currency}
                  {totalBulkIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
            <div className="text-indigo-900 font-bold">
              Net Impact:{' '}
              <span className={totalBulkIncome - totalBulkExpense >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {totalBulkIncome - totalBulkExpense >= 0 ? '+' : ''}
                {currency}
                {(totalBulkIncome - totalBulkExpense).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Multi-Entry Table */}
          <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-2xl shadow-sm bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-28">Type</th>
                  <th className="py-2.5 px-3 w-36">Date</th>
                  <th className="py-2.5 px-3 w-40">Account</th>
                  <th className="py-2.5 px-3 w-44">Category</th>
                  <th className="py-2.5 px-3 w-32">Amount ({currency})</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {bulkRows.map((row, index) => {
                  const availableCategories = categories?.filter((c) => c.type === row.type) || [];
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-3 text-center text-slate-400 font-bold">{index + 1}</td>
                      <td className="py-2 px-3">
                        <select
                          value={row.type}
                          onChange={(e) => updateBulkRow(index, 'type', e.target.value)}
                          className={`w-full p-1.5 rounded-lg border text-xs font-semibold focus:outline-none ${
                            row.type === 'EXPENSE'
                              ? 'bg-rose-50/70 border-rose-200 text-rose-700'
                              : 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
                          }`}
                        >
                          <option value="EXPENSE">Expense</option>
                          <option value="INCOME">Income</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          required
                          value={row.date}
                          onChange={(e) => updateBulkRow(index, 'date', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          required
                          value={row.accountId}
                          onChange={(e) => updateBulkRow(index, 'accountId', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                        >
                          {accounts?.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <select
                          required
                          value={row.categoryId}
                          onChange={(e) => updateBulkRow(index, 'categoryId', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white"
                        >
                          {availableCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          placeholder="0.00"
                          value={row.amount}
                          onChange={(e) => updateBulkRow(index, 'amount', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Notes..."
                          value={row.notes}
                          onChange={(e) => updateBulkRow(index, 'notes', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyBulkRow(index)}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Duplicate Row"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={bulkRows.length <= 1}
                            onClick={() => removeBulkRow(index)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none"
                            title="Remove Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={addBulkRow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Add Another Row</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeBulkModal}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bulkCreateMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                {bulkCreateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save {bulkRows.length} Transactions</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

