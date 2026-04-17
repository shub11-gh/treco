import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, Footprints, Bike, Train, Car, Leaf, Calendar, BarChart2, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ListSkeleton } from '../components/Skeletons';
import api from '../lib/api';

const modeConfig = {
  Bus:   { icon: Bus,        color: 'text-blue-400',   bg: 'bg-blue-400/10',   chartColor: '#60a5fa', label: 'Bus'   },
  Metro: { icon: Train,      color: 'text-purple-400', bg: 'bg-purple-400/10', chartColor: '#a78bfa', label: 'Metro' },
  Walk:  { icon: Footprints, color: 'text-green-400',  bg: 'bg-green-400/10',  chartColor: '#4ade80', label: 'Walk'  },
  Cycle: { icon: Bike,       color: 'text-yellow-400', bg: 'bg-yellow-400/10', chartColor: '#facc15', label: 'Cycle' },
  Cab:   { icon: Car,        color: 'text-red-400',    bg: 'bg-red-400/10',    chartColor: '#f87171', label: 'Cab'   },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function shortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Resolve CSS variable for chart ticks — adapts to light/dark theme
function tickColor() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--color-muted-foreground')
    .trim() || '#71717a';
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim(),
        border: `1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--color-border').trim()}`,
        color: getComputedStyle(document.documentElement).getPropertyValue('--color-card-foreground').trim(),
      }}
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value} {p.name === 'CO2 Saved' ? 'kg' : 'pts'}</p>
      ))}
    </div>
  );
}

export default function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('timeline');

  useEffect(() => {
    api.get('/commutes/history')
      .then(({ data }) => setActivities(data.activities))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = activities.reduce((acc, act) => {
    const dateKey = formatDate(act.createdAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(act);
    return acc;
  }, {});

  const buildChartData = () => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = shortDate(d.toISOString());
      days[key] = { date: key, 'CO2 Saved': 0, Points: 0 };
    }
    activities.forEach(act => {
      const key = shortDate(act.createdAt);
      if (days[key]) {
        days[key]['CO2 Saved'] = Number((days[key]['CO2 Saved'] + (act.co2SavedKg || 0)).toFixed(2));
        days[key]['Points'] += act.pointsEarned || 0;
      }
    });
    return Object.values(days);
  };

  const modeBreakdown = () => {
    const counts = {};
    activities.forEach(act => {
      counts[act.transportMode] = (counts[act.transportMode] || 0) + 1;
    });
    return Object.entries(counts).map(([mode, count]) => ({
      mode, count, color: modeConfig[mode]?.chartColor || '#10b981'
    }));
  };

  const totalCO2 = activities.reduce((s, a) => s + (a.co2SavedKg || 0), 0).toFixed(2);
  const totalPts  = activities.reduce((s, a) => s + (a.pointsEarned || 0), 0);

  if (loading) {
    return (
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="h-9 w-56 bg-muted rounded-lg animate-pulse" />
        <ListSkeleton count={4} />
      </div>
    );
  }

  const chartData = buildChartData();
  const breakdownData = modeBreakdown();

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" /> Activity History
        </h1>
        <p className="text-muted-foreground">Your last {activities.length} eco-commutes — every trip counts.</p>
      </div>

      {activities.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border border-border/50 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-xl shadow-lg">
          {[
            { label: 'Total Trips', value: activities.length, unit: '' },
            { label: 'CO2 Saved', value: totalCO2, unit: ' kg' },
            { label: 'Points Earned', value: totalPts.toLocaleString(), unit: ' pts' },
          ].map(({ label, value, unit }, idx, arr) => (
            <div key={label} className={`p-4 md:p-6 text-center ${idx !== arr.length - 1 ? 'border-r border-border/50' : ''}`}>
              <p className="text-2xl md:text-3xl font-black text-primary drop-shadow-sm">{value}{unit}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
          {[
            { id: 'timeline', icon: Calendar,       label: 'Timeline'   },
            { id: 'charts',   icon: BarChart2,      label: 'CO2 Charts' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                tab === id ? 'bg-background text-foreground shadow-lg shadow-background/20 backdrop-blur-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      )}

      {activities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
          <Leaf className="w-12 h-12 opacity-20" />
          <p className="text-lg font-medium">No commutes yet.</p>
          <p className="text-sm">Head to the Smart Engine and log your first green trip!</p>
        </div>
      )}

      {/* Timeline Tab */}
      {tab === 'timeline' && activities.length > 0 && (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([date, acts], gi) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">{date}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-col gap-3">
                {acts.map((act, i) => {
                  const cfg = modeConfig[act.transportMode] || modeConfig.Bus;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={act._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (gi * 3 + i) * 0.05 }}
                    >
                      <Card className="border-border/40 bg-card/40 backdrop-blur-md hover:border-primary/50 hover:bg-card/70 transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-px">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg} border-t border-white/5`}>
                              <Icon className={`w-6 h-6 ${cfg.color} drop-shadow-md`} />
                            </div>
                            <div>
                              <p className="font-bold text-base">{cfg.label}</p>
                              <p className="text-xs text-muted-foreground font-medium">{formatTime(act.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 md:gap-8 text-right">
                            <div className="bg-background/40 px-3 py-1.5 rounded-lg border border-border/50">
                              <p className="text-sm font-black text-primary">+{act.pointsEarned} <span className="text-[10px] uppercase">pts</span></p>
                            </div>
                            <div className="hidden sm:block">
                              <p className="text-sm font-black text-green-500 line-clamp-1">{act.co2SavedKg} kg <span className="text-xs text-muted-foreground font-normal">CO2</span></p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Tab */}
      {tab === 'charts' && activities.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
            <CardHeader className="border-b border-border/30 bg-background/20">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" /> Last 7 Days — CO2 Saved (kg)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor() }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor() }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="CO2 Saved" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((_, i) => <Cell key={i} fill="#10b981" fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
            <CardHeader className="border-b border-border/30 bg-background/20">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-accent" /> Last 7 Days — Points Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor() }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: tickColor() }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="Points" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((_, i) => <Cell key={i} fill="#3b82f6" fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {breakdownData.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
              <CardHeader className="border-b border-border/30 bg-background/20">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-yellow-400" /> Transport Mode Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {breakdownData.map(({ mode, count }) => {
                  const cfg = modeConfig[mode] || modeConfig.Bus;
                  const Icon = cfg.icon;
                  return (
                    <div key={mode} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 backdrop-blur shadow-sm ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${cfg.color} drop-shadow-sm`} />
                      <span className="text-sm font-bold">{cfg.label}</span>
                      <span className="text-xs font-black bg-background/50 px-2 py-0.5 rounded-md text-foreground">{count}x</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
