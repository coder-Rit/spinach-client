import { WorkItemStatus, WorkItemType } from "../types/workItem";

export const BOARD_COLUMNS: WorkItemStatus[] = [
    "TODO",
    "IN_PROGRESS",
    "CODE_COMPLETE",
    "DEPLOYED_ON_STAGE",
    "DONE",
];

export const STATUS_LABELS: Record<WorkItemStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    CODE_COMPLETE: "Code Complete",
    DEPLOYED_ON_STAGE: "Deployed On Stage",
    DONE: "Done",
};

const chipBase =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs border leading-none whitespace-nowrap";

export const typeChipClass: Record<WorkItemType, string> = {
    TASK: `${chipBase} bg-sky-950/40 border-sky-700 text-sky-200`,
    STORY: `${chipBase} bg-fuchsia-950/40 border-fuchsia-700 text-fuchsia-200`,
};

export const statusChipClass: Record<WorkItemStatus, string> = {
    TODO: `${chipBase} bg-neutral-900 border-neutral-600 text-neutral-200`,
    IN_PROGRESS: `${chipBase} bg-amber-950/40 border-amber-700 text-amber-200`,
    CODE_COMPLETE: `${chipBase} bg-indigo-950/40 border-indigo-700 text-indigo-200`,
    DEPLOYED_ON_STAGE: `${chipBase} bg-cyan-950/40 border-cyan-700 text-cyan-200`,
    DONE: `${chipBase} bg-emerald-950/40 border-emerald-700 text-emerald-200`,
};

export const inputClassName =
    "bg-neutral-900/70 border border-transparent px-3 py-2.5 rounded-md outline-none focus:bg-neutral-900 focus:ring-1 focus:ring-neutral-500";

export const primaryBtnSmClass =
    "bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 duration-300 font-medium text-sm";

export const modalClassName =
    "fixed z-[50] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56rem] max-w-[calc(100vw-3rem)] bg-neutral-800 border border-neutral-700 rounded-xl p-8 max-h-[90vh] overflow-y-auto";

export const toProjectKey = (title: string) => {
    const normalized = (title || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const key = (normalized || "PRJ").slice(0, 3);
    return key.padEnd(3, "X");
};

export const formatDateInput = (value: string | null) => (value ? value.slice(0, 10) : "");
export const toApiDateTime = (value: string) => (value ? `${value}T00:00:00` : undefined);
export const getTodayDate = () => new Date().toISOString().slice(0, 10);