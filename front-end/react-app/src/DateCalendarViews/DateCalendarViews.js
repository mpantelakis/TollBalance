import * as React from 'react';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import './DateCalendarViews.css';

export default function DateCalendarViews({ onDateChange }) {
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleStartDateChange = (date) => {
    if (!date) return;
    
    // Set to the first day of the selected month
    const formattedStartDate = dayjs(date).startOf('month');

    setStartDate(formattedStartDate);
    
    if (endDate && formattedStartDate.isAfter(endDate)) {
      setError("Starting date must be before or equal to the ending date.");
      return;
    } else {
      setError(null);
    }

    if (onDateChange) {
      onDateChange(formattedStartDate.format('YYYY-MM-DD'), endDate ? endDate.format('YYYY-MM-DD') : null);
    }
  };

  const handleEndDateChange = (date) => {
    if (!date) return;

    // Set to the last day of the selected month
    const formattedEndDate = dayjs(date).endOf('month');

    if (startDate && formattedEndDate.isBefore(startDate)) {
      setError("Starting date must be before or equal to the ending date.");
      return;
    } else {
      setError(null);
    }

    setEndDate(formattedEndDate);

    if (onDateChange) {
      onDateChange(startDate ? startDate.format('YYYY-MM-DD') : null, formattedEndDate.format('YYYY-MM-DD'));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DateCalendar']}>
        <div className="calendar-container">
          <div className="calendar-header">Select starting and ending month</div>
          <div className="calendar-grid">
            <DateCalendar 
              views={['month', 'year']} 
              openTo="month" 
              value={startDate} 
              onChange={handleStartDateChange} 
              className="calendar-month"
            />
            <DateCalendar 
              views={['month', 'year']} 
              openTo="month" 
              value={endDate} 
              onChange={handleEndDateChange}
              disabled={!startDate} 
              className="calendar-month"
            />
          </div>
          {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          <div>
            <strong>Starting Month:</strong> {startDate ? startDate.format('YYYY-MM-DD') : 'None'}
            <br />
            <strong>Ending Month:</strong> {endDate ? endDate.format('YYYY-MM-DD') : 'None'}
          </div>
        </div>
      </DemoContainer>
    </LocalizationProvider>
  );
}
