import { WorkItemStatus, WorkItemType } from "./workItem";

export interface WorkItemFormData {
    itemType: WorkItemType;
    title: string;
    description: string;
    status: WorkItemStatus;
    assignedTo: string;
    startDate: string;
    endDate: string;
    linkedWorkItemId: string;
}

export const defaultFormData = (managedBy = ""): WorkItemFormData => ({
    itemType: "TASK",
    title: "",
    description: "",
    status: "TODO",
    assignedTo: managedBy,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    linkedWorkItemId: "",
});