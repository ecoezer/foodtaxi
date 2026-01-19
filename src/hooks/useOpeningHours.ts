export const useOpeningHours = () => {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60;

  // Tuesday is closed (Ruhetag)
  const isTuesday = day === 2;

  // Monday: 12:00 - 21:00
  const isMonday = day === 1;

  // Wednesday, Thursday: 12:00 - 21:30
  const isWedThurs = day === 3 || day === 4;

  // Friday, Saturday, Sunday and holidays: 12:00 - 21:30
  const isWeekendOrFriday = day === 0 || day === 5 || day === 6;

  let openingTime: number;
  let closingTime: number;
  let isOpen = false;

  if (isTuesday) {
    // Tuesday is closed
    openingTime = 0;
    closingTime = 0;
    isOpen = false;
  } else if (isMonday) {
    // Monday: 16:00 - 21:00
    openingTime = 16;
    closingTime = 21.0; // 21:00
    isOpen = currentTime >= openingTime && currentTime < closingTime;
  } else if (isWedThurs) {
    // Wednesday, Thursday: 16:00 - 21:30
    openingTime = 16;
    closingTime = 21.5; // 21:30
    isOpen = currentTime >= openingTime && currentTime < closingTime;
  } else if (isWeekendOrFriday) {
    // Friday, Saturday, Sunday: 12:00 - 21:30
    openingTime = 12;
    closingTime = 21.5; // 21:30
    isOpen = currentTime >= openingTime && currentTime < closingTime;
  }

  const getNextOpeningTime = () => {
    if (isTuesday) {
      // If it's Tuesday, next opening is Wednesday at 16:00
      return 'Mittwoch ab 16:00 Uhr wieder geöffnet';
    }

    if (currentTime >= closingTime) {
      // If it's after closing time, calculate next day's opening
      const nextDay = new Date(now);
      nextDay.setDate(now.getDate() + 1);
      const nextDayOfWeek = nextDay.getDay();

      if (nextDayOfWeek === 2) {
        // Next day is Tuesday (closed), so opening is Wednesday
        const dayAfterNext = new Date(nextDay);
        dayAfterNext.setDate(nextDay.getDate() + 1);
        return 'Mittwoch ab 16:00 Uhr wieder geöffnet';
      }

      const nextDayName = new Intl.DateTimeFormat('de-DE', {
        weekday: 'long'
      }).format(nextDay);

      // Friday, Saturday, Sunday open at 12:00, others at 16:00
      const openingHour = (nextDayOfWeek === 0 || nextDayOfWeek === 5 || nextDayOfWeek === 6) ? '12:00' : '16:00';
      return `${nextDayName} ab ${openingHour} Uhr wieder geöffnet`;
    }

    if (currentTime < openingTime) {
      // If it's before opening time today
      const openingHour = (day === 0 || day === 5 || day === 6) ? '12:00' : '16:00';
      return `heute ab ${openingHour} Uhr wieder geöffnet`;
    }

    return '';
  };

  const getCurrentHours = () => {
    if (isTuesday) {
      return 'Ruhetag';
    } else if (isMonday) {
      return '16:00–21:00';
    } else if (isWedThurs) {
      return '16:00–21:30';
    } else {
      return '12:00–21:30';
    }
  };

  return {
    isOpen,
    openingTime,
    closingTime,
    nextOpeningTime: getNextOpeningTime(),
    currentHours: getCurrentHours(),
    isTuesday
  };
};