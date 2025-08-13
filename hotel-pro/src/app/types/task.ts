export interface Task {
    _id: string;
    text: string;
    assignedTo: string; // user _id
    username: string;
    role: string;
    done: boolean;
}