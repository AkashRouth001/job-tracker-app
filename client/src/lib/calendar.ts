interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
}

export function createGoogleCalendarUrl(event: CalendarEvent): string {
  const { title, startDate, endDate, description } = event;
  
  // Default to 1 hour duration if no end date provided
  const eventEndDate = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(eventEndDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDateFormatted}/${endDateFormatted}`,
    details: description || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
