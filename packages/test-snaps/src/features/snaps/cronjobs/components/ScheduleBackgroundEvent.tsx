import { logError } from '@metamask/snaps-utils';
import type { ChangeEvent, FormEvent, FunctionComponent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { useInvokeMutation } from '../../../../api';
import { Result } from '../../../../components';
import { getSnapId } from '../../../../utils';
import { CRONJOBS_SNAP_PORT, CRONJOBS_SNAP_ID } from '../constants';

export const ScheduleBackgroundEvent: FunctionComponent = () => {
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [invokeSnap, { isLoading, data, error }] = useInvokeMutation();

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDuration(event.target.value);
  };

  const handleSubmitWithDate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(CRONJOBS_SNAP_ID, CRONJOBS_SNAP_PORT),
      method: 'scheduleNotificationWithDate',
      params: {
        date,
      },
    }).catch(logError);
  };

  const handleSubmitWithDuration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    invokeSnap({
      snapId: getSnapId(CRONJOBS_SNAP_ID, CRONJOBS_SNAP_PORT),
      method: 'scheduleNotificationWithDuration',
      params: {
        duration,
      },
    }).catch(logError);
  };

  return (
    <>
      <Form onSubmit={handleSubmitWithDate} className="mb-3">
        <Form.Group>
          <Form.Label>Date (must be in ISO 8601 format)</Form.Label>
          <Form.Control
            type="text"
            placeholder={new Date().toISOString()}
            value={date}
            onChange={handleDateChange}
            id="backgroundEventDate"
            className="mb-3"
          />
        </Form.Group>

        <Button
          type="submit"
          id="scheduleBackgroundEventWithDate"
          disabled={isLoading}
        >
          Schedule background event with date (notification)
        </Button>
      </Form>

      <Form onSubmit={handleSubmitWithDuration} className="mb-3">
        <Form.Group>
          <Form.Label>Duration (must be in ISO 8601 format)</Form.Label>
          <Form.Control
            type="text"
            placeholder="PT30S"
            value={duration}
            onChange={handleDurationChange}
            id="backgroundEventDuration"
            className="mb-3"
          />
        </Form.Group>

        <Button
          type="submit"
          id="scheduleBackgroundEventWithDuration"
          disabled={isLoading}
        >
          Schedule background event with duration (notification)
        </Button>
      </Form>

      <h3 id="scheduleBackgroundEventResultLabel">Background event id</h3>
      <Result className="mb-3">
        <span id="scheduleBackgroundEventResult">
          {JSON.stringify(data, null, 2)}
          {JSON.stringify(error, null, 2)}
        </span>
      </Result>
    </>
  );
};
