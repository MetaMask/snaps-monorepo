/**
 * The parameters for calling the `scheduleNotificationWithDate` JSON-RPC method.
 *
 * @property date - The ISO 8601 date of when the notification should be scheduled.
 */
export type ScheduleNotificationParamsWithDate = {
  date: string;
};

/**
 * The parameters for calling the `scheduleNotificationWithDuration` JSON-RPC method.
 *
 * @property duration - The ISO 8601 duration of when the notification should be scheduled.
 */
export type ScheduleNotificationParamsWithDuration = {
  duration: string;
};

/**
 * The parameters for calling the `cancelNotification` JSON-RPC method.
 *
 * @property id - The id of the notification event to cancel.
 */
export type CancelNotificationParams = {
  id: string;
};
