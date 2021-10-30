import { isValid, parseISO, format } from 'date-fns';
import * as moment from 'moment';

export const isValidDate = (dateStr: string | Date | moment.Moment) => {
  if (moment.isMoment(dateStr) && moment.isDate(dateStr)) {
    return true;
  }
  if (typeof dateStr === 'string') {
    const date = parseISO(dateStr);
    return isValid(date);
  }
  return false;
};

export const convertToDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};
