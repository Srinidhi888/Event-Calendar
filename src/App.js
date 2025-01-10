import { useState, useEffect } from 'react';
import { MdDelete ,MdModeEdit} from "react-icons/md";
import "./App.css"
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push({ date: null });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({ date });
  }

  return days;
}

const formatDate = (date) => {
  return date ? date.toISOString().split('T')[0] : '';
};

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    return savedEvents ? JSON.parse(savedEvents) : {};
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  useEffect(() => {
    if (Object.keys(events).length > 0) {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
  }, [events]);

  const days = getMonthDays(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(formatDate(date));
    setEditingEvent(null);
    setEventForm({
      title: '',
      startTime: '09:00',
      endTime: '10:00'
    });
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime
    });
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!selectedDate || !eventForm.title.trim()) return;

    const newEvent = {
      id: editingEvent ? editingEvent.id : crypto.randomUUID(),
      ...eventForm
    };

    setEvents((prev) => {
      const newEvents = { ...prev };
      if (editingEvent) {
        newEvents[selectedDate] = newEvents[selectedDate].map(event =>
          event.id === editingEvent.id ? newEvent : event
        );
      } else {
        newEvents[selectedDate] = [...(newEvents[selectedDate] || []), newEvent];
      }
      return newEvents;
    });

    const updatedEvents = editingEvent
      ? {
          ...events,
          [selectedDate]: events[selectedDate].map(event =>
            event.id === editingEvent.id ? newEvent : event
          ),
        }
      : {
          ...events,
          [selectedDate]: [...(events[selectedDate] || []), newEvent],
        };
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));

    setEventForm({
      title: '',
      startTime: '09:00',
      endTime: '10:00'
    });
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents((prev) => {
      const newEvents = { ...prev };
      newEvents[selectedDate] = newEvents[selectedDate].filter(event => event.id !== eventId);
      if (newEvents[selectedDate].length === 0) {
        delete newEvents[selectedDate];
      }
      localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
      return newEvents;
    });
    setEditingEvent(null);
  };

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return (
    <div className="app-bg">
      <div className='combine-bg'>
      <div className='cal-bg'>
        <h1 className='date-head'>{MONTHS[currentMonth]} {currentYear}</h1>
        <div>
          <button onClick={handlePreviousMonth} className='btn-previous'>Previous</button>
          <button onClick={handleNextMonth}>Next</button>
        </div>
      </div>

      <div className='days-grid'>
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="date-names">
            {day}
          </div>
        ))}
      </div>

      <div className='dates-grid' >
        {days.map(({ date }, index) => {
          const dateStr = formatDate(date);
          const isToday = date && dateStr === formatDate(today);
          const isSelected = dateStr === selectedDate;
          const dayEvents = events[dateStr] || [];

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className='col-change'
              style={{
                backgroundColor: isSelected ? '#e3f2fd' : isToday ? '#f5f5f5' : 'white',
                cursor: date ? 'pointer' : 'default'
              }}
            >
              <div style={{ marginBottom: '5px' }}>{date ? date.getDate() : ''}</div>
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className='day-events'
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      </div>
      {selectedDate && (
        <div className="event-bg">
          <h2>Events</h2>
          <form onSubmit={handleSaveEvent}>
            <div>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Event title"
                className='input-style'
              />
              <div>
              <input
                type="time"
                value={eventForm.startTime}
                onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                className='start-time'
              />
              <input
                type="time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                className='end-time'
              />
              </div>
              <button className="btn-events" type="submit">{editingEvent ? 'Update' : 'Add'} Event</button>
            </div>
          </form>

          <div>
            {events[selectedDate]?.map(event => (
              <div
                key={event.id}
                className='event-data'
              >
                <div>
                  <strong>{event.title}</strong>
                  <span className='time-style'>
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
                <div>
                  <button
                    className='icon-edit'
                    onClick={() => handleEditEvent(event)}
                  >
                    <MdModeEdit className='icon-delete'/>
                  </button>
                  <button
                    className='delete-btn'
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <MdDelete className='icon-delete'/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;