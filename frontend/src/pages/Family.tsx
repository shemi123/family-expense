import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { categoryApi } from '../api/categoryApi';
import { Role } from '../types/auth';
import { TransactionType } from '../types/category';
import { useAuthStore } from '../store/useAuthStore';
import { Modal } from '../components/common/Modal';
import { CategoryIcon } from '../components/common/CategoryIcon';
import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  Tags,
  Plus,
  Trash2,
  Lock,
  Loader2,
} from 'lucide-react';

export const Family: React.FC = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === 'ADMIN';

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [memberRole, setMemberRole] = useState<Role>('MEMBER');
  const [memberError, setMemberError] = useState<string | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<TransactionType>('EXPENSE');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catColor, setCatColor] = useState('#6366f1');

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: authApi.getFamilyMembers,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const addMemberMutation = useMutation({
    mutationFn: authApi.addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      setIsMemberModalOpen(false);
      setMemberName('');
      setMemberEmail('');
      setMemberPassword('');
      setMemberError(null);
    },
    onError: (err: any) => {
      setMemberError(err.response?.data?.detail || err.response?.data?.message || 'Failed to add member');
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCategoryModalOpen(false);
      setCatName('');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError(null);
    addMemberMutation.mutate({
      name: memberName,
      email: memberEmail,
      password: memberPassword,
      role: memberRole,
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    addCategoryMutation.mutate({
      name: catName,
      type: catType,
      icon: catIcon,
      color: catColor,
    });
  };

  const availableIcons = [
    'Tag', 'Home', 'ShoppingCart', 'Utensils', 'Zap', 'Car', 'HeartPulse',
    'Film', 'ShoppingBag', 'Briefcase', 'GraduationCap', 'TrendingUp',
    'Gift', 'Smile', 'CreditCard', 'Coffee', 'Plane', 'Book',
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Household Settings & Members</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your family members, access roles, and custom spending categories
          </p>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Family Members</h3>
              <p className="text-xs text-slate-500">People with access to this household budget</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {loadingMembers ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members?.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 shadow-sm">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{m.name}</p>
                    <p className="text-xs text-slate-400 truncate">{m.email}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                    m.role === 'ADMIN'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {m.role === 'ADMIN' ? (
                    <ShieldCheck className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Categories</h3>
              <p className="text-xs text-slate-500">System presets and custom family categories</p>
            </div>
          </div>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Custom Category</span>
          </button>
        </div>

        {loadingCategories ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories?.map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CategoryIcon name={cat.icon} color={cat.color} className="w-4 h-4" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{cat.name}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {cat.type} • {cat.isSystem ? 'System' : 'Custom'}
                    </span>
                  </div>
                </div>

                {!cat.isSystem ? (
                  <button
                    onClick={() => {
                      if (confirm(`Delete custom category "${cat.name}"?`)) {
                        deleteCategoryMutation.mutate(cat.id);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span title="System Preset">
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        title="Invite Family Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          {memberError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {memberError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Bob"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="bob@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={memberPassword}
              onChange={(e) => setMemberPassword(e.target.value)}
              placeholder="•••••••• (min 6 chars)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Household Role
            </label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value as Role)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="MEMBER">Member (Can add and view transactions/budgets)</option>
              <option value="ADMIN">Admin (Can manage accounts, members, and categories)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMemberMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              Add to Family
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Custom Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Custom Category"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Pet Care, Gardening, Side Project"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Type
              </label>
              <select
                value={catType}
                onChange={(e) => setCatType(e.target.value as TransactionType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <span className="text-xs text-slate-500">{catColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
              {availableIcons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setCatIcon(ic)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    catIcon === ic
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-200/60 text-slate-700'
                  }`}
                >
                  <CategoryIcon name={ic} color={catIcon === ic ? '#ffffff' : catColor} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addCategoryMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
