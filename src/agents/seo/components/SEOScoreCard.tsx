import React from 'react';
import type { SEOScore } from '../types/SEOScore';
import { Gauge } from 'lucide-react';

interface Props {
  score: SEOScore;
  domain?: string;
}

const gradeColor: Record<string, string> = {
  excellent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  good: 'text-teal-700 bg-teal-50 border-teal-200',
  fair: 'text-amber-700 bg-amber-50 border-amber-200',
  poor: 'text-orange-700 bg-orange-50 border-orange-200',
  critical: 'text-rose-700 bg-rose-50 border-rose-200',
};

const LABELS: Array<{ key: keyof SEOScore['breakdown']; label: string }> = [
  { key: 'titleTags', label: 'Title Tags' },
  { key: 'metaDescriptions', label: 'Meta Descriptions' },
  { key: 'headingStructure', label: 'Headings' },
  { key: 'canonicalUrls', label: 'Canonical' },
  { key: 'robotsTxt', label: 'Robots.txt' },
  { key: 'sitemapXml', label: 'Sitemap' },
  { key: 'internalLinking', label: 'Internal Links' },
  { key: 'externalLinks', label: 'External Links' },
  { key: 'imageAlt', label: 'Image ALT' },
  { key: 'openGraph', label: 'Open Graph' },
  { key: 'twitterCards', label: 'Twitter Cards' },
  { key: 'schemaMarkup', label: 'Schema' },
  { key: 'contentQuality', label: 'Content' },
  { key: 'keywordUsage', label: 'Keywords' },
  { key: 'pageSpeed', label: 'Page Speed' },
  { key: 'mobileFriendliness', label: 'Mobile' },
];

export const SEOScoreCard: React.FC<Props> = ({ score, domain }) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Gauge className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Overall SEO Score</h3>
        {domain ? (
          <span className="ml-auto text-[10px] font-bold text-slate-400 truncate">{domain}</span>
        ) : null}
      </div>

      <div className="flex items-end gap-3">
        <p className="text-4xl font-extrabold text-slate-900">{score.breakdown.overall}</p>
        <span
          className={`mb-1 px-2 py-0.5 rounded-md border text-[10px] font-bold capitalize ${
            gradeColor[score.grade]
          }`}
        >
          {score.grade}
        </span>
        {score.delta != null ? (
          <span
            className={`mb-1 text-[11px] font-bold ${
              score.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {score.delta >= 0 ? '+' : ''}
            {score.delta} vs previous
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LABELS.map((row) => (
          <div
            key={row.key}
            className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70"
          >
            <p className="text-[10px] font-bold text-slate-400">{row.label}</p>
            <p className="text-sm font-extrabold text-slate-800">{score.breakdown[row.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
