const rules = {
  // Normalize line endings
  crlf: (md: string): string => md.replace(/\r\n/gm, "\n"),
  cr: (md: string): string => md.replace(/\r/gm, "\n"),
  // Escape all HTML
  escapeGT: (md: string): string => md.replace(/>/gm, "&gt;"),
  escapeLT: (md: string): string => md.replace(/</gm, "&lt;"),
  // Markdown
  headings: (md: string): string =>
    md.replace(/^(#+)\s+(.*)/gm, (_, p, h) => {
      const hn = Math.min(Math.max(p.length, 0), 5);
      return `<h${hn}>${h}</h${hn}>`;
    }),
  bold: (md: string): string =>
    md.replace(/(\*\*|__)(?=(?:(?:[^`]*`[^`\n]*`)*[^`]*$))(?![^\/<]*>.*<\/.+>)(.*?)\1/gm, "<b>$2</b>"),
  em: (md: string): string =>
    md.replace(/(\*|_)(?=(?:(?:[^`]*`[^`\n]*`)*[^`]*$))(?![^\/<]*>.*<\/.+>)(.*?)\1/gm, "<em>$2</em>"),
  strike: (md: string): string =>
    md.replace(/(\~\~)(?=(?:(?:[^`]*`[^`\n]*`)*[^`]*$))(?![^\/<]*>.*<\/.+>)(.*?)\1/gm, "<s>$2</s>"),
  quote: (md: string): string => md.replace(/\:\"(.*?)\"\:/gm, "<q>$1</q>"),
  code: (md: string): string => md.replace(/`(.*?)`/gm, "<code>$1</code>"),
  ul: (md: string): string => md.replace(/^\*(.*)/gm, (_, li) => `<ul><li>${li.trim()}</li></ul>`),
  ol: (md: string): string => md.replace(/^[0-9]+[\.)](.*)/gm, (_, li) => `<ol><li>${li.trim()}</li></ol>`),
  block: (md: string): string => md.replace(/^(?:&gt;|\>)(.*)/gm, (_, q) => `<blockquote>${q.trim()}</blockquote>`),
  // Secondary adjustments
  fixUl: (md: string): string => md.replace(/<\/ul>[\s\n]*<ul>/gm, ""),
  fixOl: (md: string): string => md.replace(/<\/ol>[\s\n]*<ol>/gm, ""),
  fixBlock: (md: string): string => md.replace(/<\/blockquote><blockquote>/gm, "\n"),
  fixHeadings1: (md: string): string => md.replace(/(<h[0-9]>[^<]+<\/h[0-9]>)\n\n/gm, "$1\n"),
  fixHeadings2: (md: string): string => md.replace(/\n\n\n(<h[0-9]>[^<]+<\/h[0-9]>)/gm, "\n\n$1"),
};

export function parseMd(md: string): string {
  Object.values(rules).forEach((rule) => (md = rule(md)));
  return md;
}
