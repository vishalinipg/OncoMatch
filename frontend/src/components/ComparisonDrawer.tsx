import React, { useState, useMemo } from 'react';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  Sliders, 
  Activity, 
  TrendingDown, 
  Trash2, 
  ExternalLink,
  Pill,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  CartesianGrid,
  Legend
} from 'recharts';
import { ComparisonItem } from '../types';
import { SensitivityBadge } from './SensitivityBadge';

interface ComparisonDrawerProps {
  pinnedItems: ComparisonItem[];
  onRemoveItem: (id: string | number) => void;
  onClearAll: () => void;
  onNavigateToPrediction?: (drugId: number) => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  pinnedItems,
  onRemoveItem,
  onClearAll,
  onNavigateToPrediction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If no pinned items, don't render
  if (pinnedItems.length === 0) return null;

  // Generate multi-curve data on the SAME axis for all pinned items
  const multiCurveData = useMemo(() => {
    if (pinnedItems.length === 0) return [];

    // Find the global min and max concentration across all items
    const allMin = Math.min(...pinnedItems.map(p => p.min_conc_uM || 0.001));
    const allMax = Math.max(...pinnedItems.map(p => p.max_conc_uM || 10.0));

    const logMin = Math.log10(Math.max(0.0001, allMin));
    const logMax = Math.log10(Math.max(allMin * 10, allMax));
    const steps = 35;
    const stepSize = (logMax - logMin) / steps;

    const points = [];
    for (let i = 0; i <= steps; i++) {
      const logC = logMin + i * stepSize;
      const c = Math.pow(10, logC);
      const point: any = {
        conc: Number(c.toFixed(4)),
        logConc: Number(logC.toFixed(2)),
      };

      pinnedItems.forEach((item, idx) => {
        const ic50 = item.predicted_ic50_uM || 1.0;
        const hill = 1.15;
        const viability = 100 / (1 + Math.pow(c / ic50, hill));
        point[`item_${idx}`] = Number(viability.toFixed(1));
      });

      points.push(point);
    }
    return points;
  }, [pinnedItems]);

  const baseItem = pinnedItems[0];

  return (
    <>
      {/* Sticky Bottom Comparison Tray (When minimized) */}
      <div className="fixed bottom-4 right-6 z-40 flex items-center bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-card-hover border border-slate-700/80 px-4 py-2.5 space-x-4 animate-slideUp">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-bold font-sans">
            Comparison Pinboard ({pinnedItems.length}/3)
          </span>
        </div>

        {/* Chips */}
        <div className="flex items-center space-x-2">
          {pinnedItems.map((item, idx) => (
            <div 
              key={item.id} 
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium"
              style={{ borderLeftColor: item.color, borderLeftWidth: 3 }}
            >
              <span className="truncate max-w-[120px] font-sans font-semibold">{item.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
                className="text-slate-400 hover:text-slate-200 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Compare Side-by-Side</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Clear all pinned items"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Comparison Drawer Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-white sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Side-by-Side Pharmacological Comparison</span>
                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                      {pinnedItems.length} Models Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Overlaid 4PL sigmoidal dose-response curves and direct delta metrics comparison.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onClearAll}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Multi-Curve Overlay Chart */}
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-teal-600" /> Multi-Compound Dose-Response Overlay
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-medium">
                    {pinnedItems.map((item, idx) => (
                      <span key={item.id} className="flex items-center space-x-1.5">
                        <span className="w-3 h-1 rounded" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-800 font-semibold">{item.title}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-64 w-full bg-white p-3 rounded-xl border border-slate-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={multiCurveData} margin={{ top: 10, right: 20, left: -15, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="conc" 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        tickLine={false}
                        tickFormatter={(v) => Number(v) < 0.01 ? `${(Number(v)*1000).toFixed(0)}nM` : `${Number(v).toFixed(2)}µM`}
                        label={{ value: 'Screening Concentration (µM)', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#64748b' }}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        ticks={[0, 25, 50, 75, 100]} 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        tickLine={false}
                        label={{ value: '% Cell Viability', angle: -90, position: 'insideLeft', offset: 15, fontSize: 9, fill: '#64748b' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }}
                        formatter={(val: any, name: string) => {
                          const idx = parseInt(name.replace('item_', ''), 10);
                          const item = pinnedItems[idx];
                          return [`${val}% Viability`, item?.title || name];
                        }}
                        labelFormatter={(lbl: any) => `Conc: ${lbl} µM`}
                      />
                      <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '50% Kill (IC50)', fill: '#d97706', fontSize: 9, position: 'insideTopLeft' }} />
                      
                      {pinnedItems.map((item, idx) => (
                        <Line
                          key={item.id}
                          type="monotone"
                          dataKey={`item_${idx}`}
                          stroke={item.color}
                          strokeWidth={2.5}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Direct Metric Delta Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
                  Side-by-Side Parametric Metric Delta
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                        <th className="py-2.5 px-4">Compound / Model</th>
                        <th className="py-2.5 px-4 text-right font-mono">Predicted ln(IC50)</th>
                        <th className="py-2.5 px-4 text-right font-mono">Delta vs Item 1</th>
                        <th className="py-2.5 px-4 text-right font-mono">IC50 (µM)</th>
                        <th className="py-2.5 px-4 text-center">Resistance Tier</th>
                        <th className="py-2.5 px-4">Putative Target</th>
                        <th className="py-2.5 px-4">Target Pathway</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pinnedItems.map((item, idx) => {
                        const lnIc50 = item.predicted_ln_ic50 ?? 0;
                        const baseLn = baseItem.predicted_ln_ic50 ?? 0;
                        const delta = lnIc50 - baseLn;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                              <span>{item.title}</span>
                              <span className="font-mono text-[10px] text-slate-400 font-normal">#{item.id}</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-teal-800 tabular-nums">
                              {lnIc50.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums text-xs">
                              {idx === 0 ? (
                                <span className="text-slate-400 font-sans text-[10px]">Reference</span>
                              ) : delta < 0 ? (
                                <span className="text-emerald-700 font-bold">{delta.toFixed(2)} (More Potent)</span>
                              ) : (
                                <span className="text-rose-700 font-bold">+{delta.toFixed(2)} (Less Potent)</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-800 font-bold tabular-nums">
                              {item.predicted_ic50_uM ? `${item.predicted_ic50_uM.toFixed(3)} µM` : '-'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.sensitivity_category ? (
                                <SensitivityBadge category={item.sensitivity_category} />
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-medium">
                              {item.putative_target || '-'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                              {item.pathway_name || '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {onNavigateToPrediction && item.type === 'drug' && typeof item.id === 'number' && (
                                <button
                                  onClick={() => {
                                    onNavigateToPrediction(Number(item.id));
                                    setIsExpanded(false);
                                  }}
                                  className="text-xs text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                                >
                                  Inspect Curve
                                </button>
                              )}
                              {item.type === 'cell_line' && (
                                <span className="text-[11px] text-slate-400 font-mono">Cell Line Model</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                Comparison pinboard active across all tabs and data tables.
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
