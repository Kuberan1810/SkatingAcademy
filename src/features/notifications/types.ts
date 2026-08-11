export type NotificationType = 'fees' | 'attendance' | 'student' | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    timeAgo: string;
    isUnread: boolean;
}

export interface NotificationFilter {
    id: string;
    label: string;
    count?: number;
}
