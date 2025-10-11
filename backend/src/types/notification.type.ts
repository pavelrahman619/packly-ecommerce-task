export type INotificationBody = {
  id: string;
  message: string;
  type: "appointment update";
  payload: object;
  createdAt: Date;
  seen: boolean;
};
