export const useOpeningHours = () => {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60;

  // Tuesday is closed (Ruhetag)
  const isTuesday = day === 2;
  
  // Friday, Saturday, Sunday and holidays: 12:00 - 23:00
  const isWeekendOrFriday = day === 0 || day === 5 || day === 6;
  
  // Monday, Wednesday, Thursday: 11:00 - 22:00
  const isRegularDay = day === 1 || day === 3 || day === 4;

  let openingTime: number;
  let closingTime: number;
  let isOpen = false;

  if (isTuesday) {
    // Tuesday is closed
    openingTime = 0;
    closingTime = 0;
    isOpen = false;
  } else if (isWeekendOrFriday) {
    // Friday, Saturday, Sunday: 12:00 - 22:00
    openingTime = 12;
    closingTime = 22;
    isOpen = currentTime >= openingTime && currentTime < closingTime;
  } else if (isRegularDay) {
    // Monday, Wednesday, Thursday: 11:00 - 22:00
    openingTime = 11;
    closingTime = 22;
    isOpen = currentTime >= openingTime && currentTime < closingTime;
  }

  const getNextOpeningTime = () => {
    if (isTuesday) {
      // If it's Tuesday, next opening is Wednesday at 11:00
      return 'Mittwoch ab 11:00 Uhr wieder geöffnet';
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
        return 'Mittwoch ab 11:00 Uhr wieder geöffnet';
      }
      
      const nextDayName = new Intl.DateTimeFormat('de-DE', {
        weekday: 'long'
      }).format(nextDay);
      
      const nextDayIsWeekendOrFriday = nextDayOfWeek === 0 || nextDayOfWeek === 5 || nextDayOfWeek === 6;
      const nextOpeningHour = nextDayIsWeekendOrFriday ? '12' : '11';
      
      return `${nextDayName} ab ${nextOpeningHour}:00 Uhr wieder geöffnet`;
    }
    
    if (currentTime < openingTime) {
      // If it's before opening time today
      const todayOpeningHour = isWeekendOrFriday ? '12' : '11';
      return `heute ab ${todayOpeningHour}:00 Uhr wieder geöffnet`;
    }
    
    return '';
  };

  const getCurrentHours = () => {
    if (isTuesday) {
      return 'Ruhetag';
    } else if (isWeekendOrFriday) {
      return '12:00–22:00';
    } else {
      return '11:00–22:00';
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