"use client";

/**
 * Registrations Chart Component
 *
 * Line chart showing user registrations over time using Nivo.
 */

import { ResponsiveLine } from "@nivo/line";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  date: string;
  count: number;
}

interface RegistrationsChartProps {
  data: DataPoint[];
  isLoading?: boolean;
}

export function RegistrationsChart({ data, isLoading }: RegistrationsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for Nivo
  const chartData = [
    {
      id: "registrations",
      data: data.map((d) => ({
        x: formatDate(d.date),
        y: d.count,
      })),
    },
  ];

  // Calculate stats
  const total = data.reduce((a, b) => a + b.count, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">User Registrations</CardTitle>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>
                Total: <span className="text-neutral-900 dark:text-neutral-100 font-medium">{total}</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span>
                Avg: <span className="text-neutral-900 dark:text-neutral-100 font-medium">{avg}/day</span>
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length > 0 ? (
            <ResponsiveLine
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: 0, max: "auto" }}
              curve="monotoneX"
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
              }}
              enableGridX={false}
              colors={["#3b82f6"]}
              lineWidth={2}
              pointSize={6}
              pointColor="#3b82f6"
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              enableArea={true}
              areaOpacity={0.15}
              useMesh={true}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fill: "#71717a",
                      fontSize: 10,
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: "#27272a",
                    strokeDasharray: "3 3",
                  },
                },
                crosshair: {
                  line: {
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                  },
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-500">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}
