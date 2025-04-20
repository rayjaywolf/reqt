import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const components = {
    h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1
            className={cn(
                'text-4xl font-black tracking-tight uppercase mb-6 border-4 border-black p-2 bg-white text-black inline-block',
                className
            )}
            {...props}
        />
    ),
    h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2
            className={cn(
                'text-3xl font-black tracking-tight uppercase mb-4 border-2 border-black p-2 bg-purple-600 text-white inline-block',
                className
            )}
            {...props}
        />
    ),
    h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3
            className={cn(
                'text-2xl font-black tracking-tight uppercase mb-3 border-2 border-black p-2 bg-[#FF6B00] text-white inline-block',
                className
            )}
            {...props}
        />
    ),
    p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p
            className={cn(
                'text-lg mb-4 font-mono text-white',
                className
            )}
            {...props}
        />
    ),
    a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
        <a
            className={cn(
                'text-purple-400 underline hover:text-purple-300 transition-colors',
                className
            )}
            {...props}
        />
    ),
    ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
        <ul
            className={cn(
                'list-disc list-inside mb-4 text-white font-mono',
                className
            )}
            {...props}
        />
    ),
    ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
        <ol
            className={cn(
                'list-decimal list-inside mb-4 text-white font-mono',
                className
            )}
            {...props}
        />
    ),
    li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
        <li
            className={cn(
                'mb-2',
                className
            )}
            {...props}
        />
    ),
    blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote
            className={cn(
                'border-l-4 border-purple-600 pl-4 italic my-4 text-white font-mono',
                className
            )}
            {...props}
        />
    ),
    img: ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <div className="my-6 border-4 border-black overflow-hidden">
            <img
                className={cn(
                    'w-full h-auto',
                    className
                )}
                {...props}
            />
        </div>
    ),
    hr: ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
        <hr
            className={cn(
                'my-8 border-2 border-white',
                className
            )}
            {...props}
        />
    ),
    table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="overflow-x-auto my-6 border-4 border-black">
            <table
                className={cn(
                    'w-full border-collapse',
                    className
                )}
                {...props}
            />
        </div>
    ),
    th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th
            className={cn(
                'border-2 border-black bg-purple-600 text-white p-2 font-black uppercase text-sm',
                className
            )}
            {...props}
        />
    ),
    td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td
            className={cn(
                'border-2 border-black bg-black text-white p-2',
                className
            )}
            {...props}
        />
    ),
    pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
        <pre
            className={cn(
                'bg-black border-4 border-black p-4 overflow-x-auto my-4 font-mono text-white',
                className
            )}
            {...props}
        />
    ),
    code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <code
            className={cn(
                'bg-black border-2 border-black p-1 font-mono text-white',
                className
            )}
            {...props}
        />
    ),
}; 