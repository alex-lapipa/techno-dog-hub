import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface UsageData {
  endpoint: string;
  request_count: number;
  window_start: string;
}

interface EndpointStats {
  endpoint: string;
  total: number;
  successRate: number;
}

interface TimeSeriesData {
  time: string;
  calls: number;
  errors: number;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(142 76% 36%)', // green
  'hsl(45 93% 47%)', // yellow
  'hsl(280 65% 60%)', // purple
];

const ERROR_COLOR = 'hsl(0 84% 60%)';

export default function ApiUsageAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [endpointStats, setEndpointStats] = useState<EndpointStats[]>([]);
  const [summary, setSummary] = useState({
    totalCalls: 0,
    avgCallsPerDay: 0,
    errorRate: 0,
    trend: 'stable' as 'up' | 'down' | 'stable',
    topEndpoint: '',
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      let groupBy: 'hour' | 'day' = 'day';
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          groupBy = 'hour';
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      // Fetch usage data
      const { data: usageData, error } = await supabase
        .from('api_usage')
        .select('endpoint, request_count, window_start')
        .gte('window_start', startDate.toISOString())
        .order('window_start', { ascending: true });

      if (error) throw error;

      // Process time series data
      const timeMap = new Map<string, { calls: number; errors: number }>();
      const endpointMap = new Map<string, { total: number; errors: number }>();

      usageData?.forEach((row: UsageData) => {
        const date = new Date(row.window_start);
        const timeKey = groupBy === 'hour'
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const existing = timeMap.get(timeKey) || { calls: 0, errors: 0 };
        const isError = row.endpoint.includes('error') || false;
        timeMap.set(timeKey, {
          calls: existing.calls + row.request_count,
          errors: existing.errors + (isError ? row.request_count : 0),
        });

        // Endpoint stats
        const endpointName = row.endpoint.replace('/api/v1/', '').replace('api-v1-', '');
        const endpointExisting = endpointMap.get(endpointName) || { total: 0, errors: 0 };
        endpointMap.set(endpointName, {
          total: endpointExisting.total + row.request_count,
          errors: endpointExisting.errors + (isError ? row.request_count : 0),
        });
      });

      // Convert to arrays
      const timeSeries = Array.from(timeMap.entries()).map(([time, data]) => ({
        time,
        calls: data.calls,
        errors: data.errors,
      }));

      const endpoints = Array.from(endpointMap.entries())
        .map(([endpoint, data]) => ({
          endpoint,
          total: data.total,
          successRate: data.total > 0 ? ((data.total - data.errors) / data.total) * 100 : 100,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Calculate summary
      const totalCalls = usageData?.reduce((sum, row) => sum + row.request_count, 0) || 0;
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      const avgCallsPerDay = Math.round(totalCalls / days);

      // Calculate trend (compare first half vs second half)
      const midpoint = Math.floor(timeSeries.length / 2);
      const firstHalf = timeSeries.slice(0, midpoint).reduce((s, d) => s + d.calls, 0);
      const secondHalf = timeSeries.slice(midpoint).reduce((s, d) => s + d.calls, 0);
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (secondHalf > firstHalf * 1.1) trend = 'up';
      else if (secondHalf < firstHalf * 0.9) trend = 'down';

      const totalErrors = timeSeries.reduce((s, d) => s + d.errors, 0);
      const errorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;

      setTimeSeriesData(timeSeries);
      setEndpointStats(endpoints);
      setSummary({
        totalCalls,
        avgCallsPerDay,
        errorRate,
        trend,
        topEndpoint: endpoints[0]?.endpoint || 'N/A',
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const getTrendIcon = () => {
    switch (summary.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">Monitor your API consumption and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as '24h' | '7d' | '30d')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Activity className="h-4 w-4" />
              Total API Calls
            </div>
            <div className="text-2xl font-bold">{summary.totalCalls.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {getTrendIcon()}
              <span className="capitalize">{summary.trend} trend</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              Avg. Calls/Day
            </div>
            <div className="text-2xl font-bold">{summary.avgCallsPerDay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Daily average</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              Error Rate
            </div>
            <div className="text-2xl font-bold">
              {summary.errorRate.toFixed(1)}%
            </div>
            <Badge variant={summary.errorRate < 1 ? 'default' : summary.errorRate < 5 ? 'secondary' : 'destructive'} className="mt-1 text-xs">
              {summary.errorRate < 1 ? 'Healthy' : summary.errorRate < 5 ? 'Elevated' : 'High'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Zap className="h-4 w-4" />
              Top Endpoint
            </div>
            <div className="text-xl font-bold font-mono truncate">{summary.topEndpoint}</div>
            <p className="text-xs text-muted-foreground mt-1">Most called</p>
          </CardContent>
        </Card>
      </div>

      {/* API Calls Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>API Calls Over Time</CardTitle>
          <CardDescription>
            Request volume {timeRange === '24h' ? 'by hour' : 'by day'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="time" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calls"
                  name="API Calls"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  name="Errors"
                  stroke={ERROR_COLOR}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: ERROR_COLOR, r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No API calls in this time range</p>
                <p className="text-sm">Start using the API to see analytics</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endpoint Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most frequently called endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            {endpointStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={endpointStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    dataKey="endpoint" 
                    type="category" 
                    width={80}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Calls']}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No endpoint data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint Distribution</CardTitle>
            <CardDescription>Share of total API calls</CardDescription>
          </CardHeader>
          <CardContent>
            {endpointStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={endpointStats}
                    dataKey="total"
                    nameKey="endpoint"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ endpoint, percent }) => 
                      `${endpoint} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  >
                    {endpointStats.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Calls']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No endpoint data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Performance Table */}
      {endpointStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Performance</CardTitle>
            <CardDescription>Success rates by endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {endpointStats.map((endpoint) => (
                <div key={endpoint.endpoint} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{endpoint.endpoint}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {endpoint.total.toLocaleString()} calls
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${endpoint.successRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {endpoint.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
