import { MOCK_STATS } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Users, Briefcase, TrendingUp, Award } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary">Admin Overview</h1>
        <p className="text-muted-foreground">Campus-wide statistics, placement data, and engagement analytics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="1,250" icon={Users} trend="+12%" />
        <StatCard title="Placed Students" value="482" icon={Briefcase} trend="+5%" />
        <StatCard title="Avg Attendance" value="88%" icon={TrendingUp} trend="-2%" negative />
        <StatCard title="Events Hosted" value="54" icon={Award} trend="+8" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Placement Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Placement Stats by Branch</CardTitle>
            <CardDescription>Percentage of eligible students placed</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_STATS.placements}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="placed" name="Placed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="Total Eligible" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Campus Attendance Trends</CardTitle>
            <CardDescription>Monthly average attendance across all years</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_STATS.attendance}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="avg" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorAvg)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Skill Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Student Skill Distribution</CardTitle>
          <CardDescription>Top technical skills verified across the campus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_STATS.skills.map((item, index) => (
              <div key={item.skill} className="flex items-center gap-4">
                <div className="w-24 font-medium text-sm">{item.skill}</div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${(item.count / 200) * 100}%` }} // Mock normalization
                  />
                </div>
                <div className="w-12 text-right text-sm text-muted-foreground">{item.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, negative }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="text-2xl font-bold">{value}</div>
          <div className={`text-xs flex items-center ${negative ? 'text-red-500' : 'text-green-500'}`}>
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}