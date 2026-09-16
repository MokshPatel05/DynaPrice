import React from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import type { PriceHistory } from '../types/product';

interface PriceSparklineProps {
  history: PriceHistory[];
  color?: string;
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black text-white text-xs px-2 py-1 border border-black font-mono">
      ${payload[0].value.toFixed(2)}
    </div>
  );
};

export const PriceSparkline: React.FC<PriceSparklineProps> = ({
  history,
  color = '#000000',
}) => {
  if (history.length < 2) {
    return (
      <div className="h-14 flex items-center justify-center text-xs text-gray-400 font-mono border border-dashed border-gray-300">
        No history yet
      </div>
    );
  }

  const data = history.map((h) => ({ price: h.price }));

  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
