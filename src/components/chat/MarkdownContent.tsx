import React from "react";

interface MarkdownContentProps {
    content: string;
    className?: string;
}

const renderInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={i} className="font-semibold text-white">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return (
                <em key={i} className="italic text-neutral-300">
                    {part.slice(1, -1)}
                </em>
            );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return (
                <code
                    key={i}
                    className="bg-neutral-950 border border-neutral-700 rounded px-1.5 py-0.5 text-sm font-mono text-emerald-300"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part ? <React.Fragment key={i}>{part}</React.Fragment> : null;
    });
};

const MarkdownContent = ({ content, className = "" }: MarkdownContentProps) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block
        if (line.startsWith("```")) {
            const lang = line.slice(3).trim();
            let code = "";
            i++;
            while (i < lines.length && !lines[i].startsWith("```")) {
                code += lines[i] + "\n";
                i++;
            }
            elements.push(
                <div key={`cb-${i}`} className="my-3">
                    {lang && (
                        <div className="text-xs text-neutral-500 bg-neutral-950 border border-b-0 border-neutral-700 rounded-t-lg px-3 py-1 font-mono">
                            {lang}
                        </div>
                    )}
                    <pre
                        className={`bg-neutral-950 border border-neutral-700 ${lang ? "rounded-b-lg rounded-tr-lg" : "rounded-lg"} p-3 overflow-x-auto`}
                    >
                        <code className="text-sm text-emerald-300 font-mono">{code.trimEnd()}</code>
                    </pre>
                </div>
            );
            i++;
            continue;
        }

        // H1
        if (line.startsWith("# ")) {
            elements.push(
                <h1 key={`h1-${i}`} className="text-xl font-bold mt-4 mb-2 text-white">
                    {renderInline(line.slice(2))}
                </h1>
            );
            i++;
            continue;
        }

        // H2
        if (line.startsWith("## ")) {
            elements.push(
                <h2 key={`h2-${i}`} className="text-lg font-semibold mt-3 mb-1.5 text-white">
                    {renderInline(line.slice(3))}
                </h2>
            );
            i++;
            continue;
        }

        // H3
        if (line.startsWith("### ")) {
            elements.push(
                <h3 key={`h3-${i}`} className="text-base font-semibold mt-2 mb-1 text-neutral-100">
                    {renderInline(line.slice(4))}
                </h3>
            );
            i++;
            continue;
        }

        // Blockquote
        if (line.startsWith("> ")) {
            const items: string[] = [];
            while (i < lines.length && lines[i].startsWith("> ")) {
                items.push(lines[i].slice(2));
                i++;
            }
            elements.push(
                <blockquote
                    key={`bq-${i}`}
                    className="border-l-2 border-emerald-600 pl-3 my-2 text-neutral-400 italic"
                >
                    {items.map((item, idx) => (
                        <p key={idx}>{renderInline(item)}</p>
                    ))}
                </blockquote>
            );
            continue;
        }

        // Unordered list
        if (/^[-*+] /.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*+] /.test(lines[i])) {
                items.push(lines[i].slice(2));
                i++;
            }
            elements.push(
                <ul key={`ul-${i}`} className="list-disc pl-5 my-2 space-y-1 marker:text-emerald-500">
                    {items.map((item, idx) => (
                        <li key={idx} className="text-[15px] leading-relaxed">
                            {renderInline(item)}
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // Ordered list
        if (/^\d+\. /.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\. /.test(lines[i])) {
                items.push(lines[i].replace(/^\d+\. /, ""));
                i++;
            }
            elements.push(
                <ol key={`ol-${i}`} className="list-decimal pl-5 my-2 space-y-1 marker:text-emerald-500">
                    {items.map((item, idx) => (
                        <li key={idx} className="text-[15px] leading-relaxed">
                            {renderInline(item)}
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        // Horizontal rule
        if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
            elements.push(<hr key={`hr-${i}`} className="border-neutral-700 my-3" />);
            i++;
            continue;
        }

        // Empty line
        if (line.trim() === "") {
            elements.push(<div key={`br-${i}`} className="h-1.5" />);
            i++;
            continue;
        }

        // Regular paragraph
        elements.push(
            <p key={`p-${i}`} className="text-[15px] leading-relaxed">
                {renderInline(line)}
            </p>
        );
        i++;
    }

    return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
};

export default MarkdownContent;