import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export interface MathMarkdownProps {
  content?: string | null;
  className?: string;
  inline?: boolean;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({
  content,
  className = '',
  inline = false,
}) => {
  if (!content) return null;

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none text-foreground break-words leading-relaxed ${
        inline ? 'inline-block prose-p:inline prose-p:my-0' : 'prose-p:my-1.5'
      } ${className}`.trim()}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ node, ...props }) =>
            inline ? (
              <span {...props} />
            ) : (
              <p className="my-1 leading-relaxed" {...props} />
            ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          code: ({ node, ...props }) => (
            <code
              className="px-1 py-0.5 rounded bg-muted text-[11px] font-mono text-foreground"
              {...props}
            />
          ),
        }}
      >
        {String(content)}
      </ReactMarkdown>
    </div>
  );
};

export default MathMarkdown;
