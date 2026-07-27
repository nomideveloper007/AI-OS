import React from 'react';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

type Block =
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'paragraph'; text: string };

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const language = fence[1] || 'text';
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      blocks.push({ type: 'code', language, code: codeLines.join('\n') });
      continue;
    }

    // Table (header + separator + rows)
    if (
      line.includes('|') &&
      i + 1 < lines.length &&
      /^\s*\|?[\s-:|]+\|?\s*$/.test(lines[i + 1])
    ) {
      const splitRow = (row: string) =>
        row
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'list', ordered: false, items });
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'list', ordered: true, items });
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Paragraph (consume until blank)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      // Stop if next structural block begins
      if (
        lines[i].startsWith('```') ||
        /^\s*[-*+]\s+/.test(lines[i]) ||
        /^\s*\d+\.\s+/.test(lines[i])
      ) {
        break;
      }
      para.push(lines[i]);
      i += 1;
    }
    if (para.length) {
      blocks.push({ type: 'paragraph', text: para.join('\n') });
    }
  }

  return blocks;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on inline code, links, bold, italic
  const regex =
    /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('`')) {
      nodes.push(
        <code
          key={key++}
          className="px-1 py-0.5 rounded bg-slate-200/80 text-[11px] font-mono text-indigo-700"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
          >
            {linkMatch[1]}
          </a>
        );
      }
    } else if (token.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-extrabold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*')) {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  return nodes.length ? nodes : [text];
}

/**
 * Lightweight markdown renderer for Playground responses.
 * Supports paragraphs, lists, tables, fenced code, links, bold/italic, inline code.
 */
export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className }) => {
  const blocks = parseBlocks(content || '');

  if (!content) {
    return <p className="text-slate-400 text-xs font-medium">No content</p>;
  }

  return (
    <div className={`space-y-3 text-xs text-slate-800 leading-relaxed ${className || ''}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-800 border-b border-slate-700">
                {block.language}
              </div>
              <pre className="p-3 overflow-x-auto text-[11px] font-mono text-emerald-300 whitespace-pre">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={idx} className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    {block.headers.map((h, hi) => (
                      <th key={hi} className="px-3 py-2 font-extrabold border-b border-slate-200">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className="odd:bg-white even:bg-slate-50">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 border-b border-slate-100 align-top">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag
              key={idx}
              className={`pl-5 space-y-1 ${block.ordered ? 'list-decimal' : 'list-disc'}`}
            >
              {block.items.map((item, ii) => (
                <li key={ii} className="font-medium">
                  {renderInline(item)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={idx} className="font-medium whitespace-pre-wrap">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
};
