import { differenceInDays, isPast } from 'date-fns';

export interface JobExpirationStatus {
  isExpired: boolean;
  daysUntilExpiration: number;
  showWarning: boolean;
}

export function getJobExpirationStatus(dateTime: string | null): JobExpirationStatus {
  if (!dateTime) {
    return {
      isExpired: false,
      daysUntilExpiration: 999,
      showWarning: false
    };
  }

  const jobDate = new Date(dateTime);
  const now = new Date();
  const isExpired = isPast(jobDate);
  const daysUntilExpiration = differenceInDays(jobDate, now);

  return {
    isExpired,
    daysUntilExpiration,
    showWarning: daysUntilExpiration <= 2 && !isExpired
  };
}
