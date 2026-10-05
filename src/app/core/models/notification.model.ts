export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}
