import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronDown, TrendingUp } from 'lucide-react';

export const TrafficOverviewCard: React.FC = () => {
  const { website, websites, scans } = useApp();
  const [selectedRange, setSelectedRange] = useState('7 Days');
  const [activePointIndex, setActivePointIndex] = useState<number>(4);

  // Chart dimensions
  const width = 360;
  const height = 140;
  const paddingX = 25;
  const paddingY = 20;

  const hasScan = useMemo(() => {
    if (websites.length === 0 || !website?.id) return false;
    return scans.some((s) => s.domain === website.domain);
  }, [websites, website, scans]);

  // Generate deterministic traffic points based on website domain and scan status
  const trafficData = useMemo(() => {
    if (!hasScan || !website?.domain) {
      return Array.from({ length: 7 }, (_, i) => {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - (6 - i));
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { date: dateStr, visitors: 0 };
      });
    }

    let hash = 0;
    const str = website.domain;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const baseVisitors = 150 + (absHash % 850);
    const pointsCount = selectedRange === '7 Days' ? 7 : 30;

    return Array.from({ length: pointsCount }, (_, i) => {
      const dayVariation = Math.sin(absHash + i) * 0.3 + 0.05;
      const visitors = Math.round(baseVisitors * (1 + dayVariation));
      
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - (pointsCount - 1 - i));
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { date: dateStr, visitors };
    });
  }, [hasScan, website, selectedRange]);

  const maxVal = useMemo(() => {
    const max = Math.max(...trafficData.map((d) => d.visitors), 0);
    return max > 0 ? max * 1.2 : 100;
  }, [trafficData]);

  const minVal = 0;

  const points = useMemo(() => {
    return trafficData.map((d, index) => {
      const x = paddingX + (index / (trafficData.length - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((d.visitors - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
      return { x, y, date: d.date, visitors: d.visitors };
    });
  }, [trafficData, maxVal]);

  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`
    : '';

  const activeIndex = Math.min(activePointIndex, points.length - 1);
  const activePoint = points[activeIndex >= 0 ? activeIndex : 0] || { x: 0, y: 0, date: '', visitors: 0 };

  const totalVisitors = useMemo(() => {
    if (!hasScan) return 0;
    return trafficData.reduce((sum, d) => sum + d.visitors, 0);
  }, [hasScan, trafficData]);

  const trendPercentage = useMemo(() => {
    if (!hasScan || !website?.domain) return '0%';
    let hash = 0;
    const str = website.domain;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const val = ((absHash % 250) / 10) + 1.5;
    return `${val.toFixed(1)}%`;
  }, [hasScan, website]);

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base">
          Traffic Overview
        </h3>
        <div className="relative">
          <button 
            onClick={() => {
              setSelectedRange(selectedRange === '7 Days' ? '30 Days' : '7 Days');
              setActivePointIndex(0);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {selectedRange}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Stat */}
      <div>
        <p className="text-xs font-medium text-slate-500">Visitors</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {hasScan ? totalVisitors.toLocaleString() : '0'}
          </span>
          {hasScan && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
              <TrendingUp className="w-3 h-3" />
              {trendPercentage}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="relative pt-2">
        {/* Floating Tooltip at Active Point */}
        {hasScan && activePoint.visitors > 0 && (
          <div 
            className="absolute z-10 -translate-x-1/2 -translate-y-full mb-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-md text-center transition-all duration-200 pointer-events-none"
            style={{ 
              left: `${(activePoint.x / width) * 100}%`, 
              top: `${(activePoint.y / height) * 100}%` 
            }}
          >
            <p className="text-[11px] text-slate-400 leading-tight font-medium">
              {activePoint.date}
            </p>
            <p className="text-xs font-extrabold text-slate-900 leading-tight">
              {activePoint.visitors} <span className="text-[10px] font-normal text-slate-500">Visitors</span>
            </p>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#E2E8F0" strokeWidth="1" />

          {/* Area Fill */}
          {hasScan && <path d={areaPath} fill="url(#trafficGrad)" />}

          {/* Line Stroke */}
          {hasScan ? (
            <path d={linePath} fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#CBD5E1" strokeWidth="2" strokeDasharray="5 5" />
          )}

          {/* Interactive Data Dots */}
          {hasScan && points.map((p, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setActivePointIndex(idx)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={activeIndex === idx ? "6" : "3.5"}
                fill={activeIndex === idx ? "#4F46E5" : "#6366F1"}
                stroke="#FFFFFF"
                strokeWidth={activeIndex === idx ? "3" : "1.5"}
                className="transition-all duration-200"
              />
            </g>
          ))}
        </svg>

        {/* X-Axis Date Labels */}
        <div className="flex justify-between px-1 mt-1 text-[11px] font-medium text-slate-400">
          {trafficData.map((d, i) => {
            const shouldRender = selectedRange === '7 Days' || i % 6 === 0 || i === trafficData.length - 1;
            if (!shouldRender) return null;
            return (
              <span 
                key={i} 
                className={`cursor-pointer ${i === activeIndex && hasScan ? 'text-[#4F46E5] font-bold' : ''}`}
                onClick={() => hasScan && setActivePointIndex(i)}
              >
                {d.date}
              </span>
            );
          })}
        </div>

        {!hasScan && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
              Connect & Scan website to activate traffic tracking
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

