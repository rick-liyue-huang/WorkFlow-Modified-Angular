import { TaskHistoryVM } from '../vm';
import { User } from '../domain';
import * as DateFns from 'date-fns';
import * as History from '../domain/history';

const getDayName = (day: number): string => {
  const dayNames: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fry', 'Sat', 'Sun'];
  return dayNames[day - 1];
};

const joinUserNames = (users: User[]): string => {
  const names = users.map((user: User) => user.name);
  return names.join(', ');
};

const getDateDesc = (date: Date | string): string => {
  const nowDate: Date = new Date();
  const historyDate = typeof date === 'string' ? DateFns.parseISO(date) : date;
  const todayDate: Date = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate()
  );
  const yesterdayDate: Date = new Date(
    todayDate.getTime() - 24 * 60 * 60 * 1000
  );
  const thisWeekDate: Date = new Date(
    todayDate.getTime() - (nowDate.getDay() - 1) * 24 * 60 * 60 * 1000
  );
  const lastWeekDate: Date = new Date(
    thisWeekDate.getTime() - 7 * 24 * 60 * 60 * 1000
  );

  const nowTimestamp: number = nowDate.getTime();
  const historyTimestamp: number = historyDate.getTime();
  const deltaTimestamp: number = nowTimestamp - historyTimestamp;

  if (deltaTimestamp < 60 * 1000) {
    return 'some seconds ago';
  } else if (deltaTimestamp < 60 * 60 * 1000) {
    return `${(deltaTimestamp / 1000 / 60).toFixed(0)} minutes ago`;
  }

  if (
    DateFns.format(nowDate, 'yyyy-MM-dd') ===
    DateFns.format(historyDate, 'yyyy-MM-dd')
  ) {
    return `Today ${DateFns.format(historyDate, 'HH:mm')}`;
  }

  if (
    DateFns.format(yesterdayDate, 'yyyy-MM-dd') ===
    DateFns.format(historyDate, 'yyyy-MM-dd')
  ) {
    return `yesterday ${DateFns.format(historyDate, 'HH:mm')}`;
  }

  if (
    DateFns.format(thisWeekDate, 'yyyy-MM w') ===
    DateFns.format(historyDate, 'yyyy-MM w')
  ) {
    return `this week ${getDayName(historyDate.getDay())} ${DateFns.format(
      historyDate,
      'HH:mm'
    )}`;
  }

  if (
    DateFns.format(lastWeekDate, 'yyyy-MM w') ===
    DateFns.format(historyDate, 'yyyy-MM w')
  ) {
    return `last week ${getDayName(historyDate.getDay())} ${DateFns.format(
      historyDate,
      'HH:mm'
    )}`;
  }

  return typeof date === 'string' ? date : DateFns.format(date, 'M/d H:mm');
};

export const getTaskHistoryVMs = (
  histories: History.TaskHistory[]
): TaskHistoryVM[] => {
  return histories.map((history: History.TaskHistory) => {
    switch (history.operation.type) {
      case History.CREATE_TASK:
        return {
          ...history,
          icon: 'add',
          title: `${history.operator.name} create task`,
          dateDesc: getDateDesc(history.date)
        };
      case History.COMPLETE_TASK:
        return {
          ...history,
          icon: 'done',
          title: `${history.operator.name} complete task`,
          dateDesc: getDateDesc(history.date)
        };
      case History.RECREATE_TASK:
        return {
          ...history,
          icon: 'redo',
          title: `${history.operator.name} redo task`,
          dateDesc: getDateDesc(history.date)
        };
      case History.UPDATE_TASK_CONTENT: {
        const content: string = (<History.UpdateTaskContentOperation>(
          history.operation
        )).payload;
        return {
          ...history,
          icon: 'create',
          title: `${history.operator.name} modify task content`,
          content: content,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.UPDATE_TASK_PRIORITY: {
        let priority: string;
        switch (
          (<History.UpdateTaskPriorityOperation>history.operation).payload
        ) {
          case 1:
            priority = 'emergent';
            break;
          case 2:
            priority = 'important';
            break;
          default:
            priority = 'normal';
            break;
        }
        return {
          ...history,
          icon: 'priority_high',
          title: `${history.operator.name} update priority as ${priority}`,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.UPDATE_TASK_REMARK: {
        const content: string = (<History.UpdateTaskRemarkOperation>(
          history.operation
        )).payload;
        return {
          ...history,
          icon: 'create',
          title: `${history.operator.name} update comments`,
          content: content,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.CLEAR_TASK_REMARK: {
        return {
          ...history,
          icon: 'clear',
          title: `${history.operator.name} clear comments`,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.UPDATE_TASK_DUEDATE: {
        const dueDate: Date = (<History.UpdateTaskDueDateOperation>(
          history.operation
        )).payload;
        return {
          ...history,
          icon: 'date_range',
          title: `${history.operator.name} modify DueTime as ${DateFns.format(
            dueDate,
            'M月d日'
          )}`,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.CLEAR_TASK_DUEDATE: {
        return {
          ...history,
          icon: 'date_range',
          title: `${history.operator.name} remove DueTime`,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.CLAIM_TASK: {
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} claim task`,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.ASSIGN_TASK: {
        const name = (<History.AssignTaskOperation>history.operation).payload
          .name;
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} assign to ${name}`,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.REMOVE_TASK_EXECUTOR: {
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} remove executor`,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.ADD_PARTICIPANT: {
        const users: User[] = (<History.AddParticipantOperation>(
          history.operation
        )).payload;
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} add participants ${joinUserNames(
            users
          )}`,
          dateDesc: getDateDesc(history.date)
        };
      }
      case History.REMOVE_PARTICIPANT: {
        const users: User[] = (<History.RemoveParticipantOperation>(
          history.operation
        )).payload;
        return {
          ...history,
          icon: 'person',
          title: `${history.operator.name} remove participants ${joinUserNames(
            users
          )}`,
          dateDesc: getDateDesc(history.date)
        };
      }
      default:
        return {
          ...history,
          title: 'unknown type',
          dateDesc: getDateDesc(history.date)
        };
    }
  });
};
