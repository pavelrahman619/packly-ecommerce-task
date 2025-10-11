import { redis } from "../redis/index";
import { INotificationBody } from "../types/notification.type";

export const setNotification = async (
  userId: string,
  notificationBody: INotificationBody,
) => {
  try {
    const res = await redis.lpush(
      `notification : ${userId}`,
      JSON.stringify(notificationBody),
    );
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};

export const getNotifications = async (userId: string) => {
  try {
    const notifications = await redis.lrange(`notification : ${userId}`, 0, -1);
    return notifications;
  } catch (error) {
    console.log(error);
  }
};

export const getNotificationsCount = async (userId: string) => {
  try {
    const count = await redis.llen(`notification : ${userId}`);
    return count;
  } catch (error) {
    console.log(error);
  }
};

export const removeNotification = async (
  userId: string,
  notification_to_remove: string,
) => {
  console.log(notification_to_remove);
  try {
    const count = await redis.lrem(
      `notification : ${userId}`,
      0,
      notification_to_remove,
    );
    return count;
  } catch (error) {
    console.log(error);
  }
};
