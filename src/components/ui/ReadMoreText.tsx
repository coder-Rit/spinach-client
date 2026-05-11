import { useState } from "react";

interface ReadMoreTextProps {
    text: string;
    maxLength?: number;
    className?: string;
}

const ReadMoreText = ({ text, maxLength = 120, className = "" }: ReadMoreTextProps) => {
    const [expanded, setExpanded] = useState(false);

    if (!text) return <span className={`text-neutral-500 italic ${className}`}>No description.</span>;
    if (text.length <= maxLength) return <span className={className}>{text}</span>;

    return (
        <span className={className}>
            {expanded ? text : `${text.slice(0, maxLength)}…`}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((v) => !v);
                }}
                className="ml-1 text-emerald-400 hover:text-emerald-300 text-xs underline underline-offset-2"
            >
                {expanded ? "Show less" : "Read more"}
            </button>
        </span>
    );
};

export default ReadMoreText;