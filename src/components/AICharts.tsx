import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  title?: string;
  message?: string;
}

const CHART_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#06b6d4'];

function EmptyChart({ title }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm gap-2">
      {title && <p className="font-semibold text-foreground text-xs">{title}</p>}
      <p>No data available to display</p>
    </div>
  );
}

export function BarChartComponent({ data, title, message }: ChartProps) {
  if (!Array.isArray(data) || data.length === 0) return <EmptyChart title={title} />;

  return (
    <div className="space-y-1">
      {title && <p className="text-xs font-semibold text-foreground px-1">{title}</p>}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {message && <p className="text-[11px] text-muted-foreground px-1 pt-1">{message}</p>}
    </div>
  );
}

export function PieChartComponent({ data, title, message }: ChartProps) {
  if (!Array.isArray(data) || data.length === 0) return <EmptyChart title={title} />;

  return (
    <div className="space-y-1">
      {title && <p className="text-xs font-semibold text-foreground px-1">{title}</p>}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={75}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
            itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {message && <p className="text-[11px] text-muted-foreground px-1 pt-1">{message}</p>}
    </div>
  );
}

