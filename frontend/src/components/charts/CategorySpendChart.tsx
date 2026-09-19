import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategorySpending } from '../../types/dashboard';

interface CategorySpendChartProps {
  data: CategorySpending[];
  currency?: string;
}

export const CategorySpendChart: React.FC<CategorySpendChartProps> = ({ data, currency = '$' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-sm">No expenses recorded for this period yet</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: Number(item.amount),
    color: item.color || '#6366f1',
    percentage: item.percentage,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold">{entry.name}</p>
          <p className="text-slate-300">
            Amount: <span className="font-bold text-white">{currency}{entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </p>
          <p className="text-slate-400">Share: {entry.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
