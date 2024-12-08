// plugins/calendar/index.ts

import { Plugin, PluginContext } from '../../core/types/plugin.types';
import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { CalendarEvent, EventStore } from './types';

export class CalendarPlugin implements Plugin {
  private context: PluginContext;
  private eventStore: EventStore;

  constructor(context: PluginContext) {
    this.context = context;
    this.eventStore = new EventStore(context.storage);
  }

  async initialize(): Promise<void> {
    // Register UI components
    this.context.ui.registerComponent('CalendarView', CalendarView);
    this.context.ui.registerComponent('EventForm', EventForm);

    // Register event handlers
    this.context.events.on('calendar:event:create', this.handleEventCreate);
    this.context.events.on('calendar:event:update', this.handleEventUpdate);
    this.context.events.on('calendar:event:delete', this.handleEventDelete);

    // Register API endpoints
    this.context.api.registerEndpoint('GET', '/calendar/events', this.getEvents);
    this.context.api.registerEndpoint('POST', '/calendar/events', this.createEvent);
    this.context.api.registerEndpoint('PUT', '/calendar/events/:id', this.updateEvent);
    this.context.api.registerEndpoint('DELETE', '/calendar/events/:id', this.deleteEvent);
  }

  private handleEventCreate = async (event: CalendarEvent): Promise<void> => {
    try {
      await this.eventStore.createEvent(event);
      this.context.events.emit('calendar:event:created', event);
    } catch (error) {
      this.context.logger.error('Failed to create event:', error);
      throw error;
    }
  };

  private handleEventUpdate = async (event: CalendarEvent): Promise<void> => {
    try {
      await this.eventStore.updateEvent(event);
      this.context.events.emit('calendar:event:updated', event);
    } catch (error) {
      this.context.logger.error('Failed to update event:', error);
      throw error;
    }
  };

  private handleEventDelete = async (eventId: string): Promise<void> => {
    try {
      await this.eventStore.deleteEvent(eventId);
      this.context.events.emit('calendar:event:deleted', eventId);
    } catch (error) {
      this.context.logger.error('Failed to delete event:', error);
      throw error;
    }
  };

  private getEvents = async (req: any): Promise<CalendarEvent[]> => {
    const { startDate, endDate } = req.query;
    return this.eventStore.getEvents(new Date(startDate), new Date(endDate));
  };

  private createEvent = async (req: any): Promise<CalendarEvent> => {
    return this.eventStore.createEvent(req.body);
  };

  private updateEvent = async (req: any): Promise<CalendarEvent> => {
    return this.eventStore.updateEvent({ ...req.body, id: req.params.id });
  };

  private deleteEvent = async (req: any): Promise<void> => {
    await this.eventStore.deleteEvent(req.params.id);
  };

  async start(): Promise<void> {
    this.context.logger.info('Calendar plugin starting...');
    await this.eventStore.initialize();
  }

  async stop(): Promise<void> {
    this.context.logger.info('Calendar plugin stopping...');
    await this.eventStore.cleanup();
  }
}

// plugins/calendar/components/CalendarView.tsx

import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Box, Button, useTheme } from '@mui/material';
import { CalendarEvent } from '../types';
import { EventForm } from './EventForm';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export const CalendarView: React.FC = () => {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [showEventForm, setShowEventForm] = React.useState(false);
  const theme = useTheme();

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({ start, end } as CalendarEvent);
    setShowEventForm(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (event: CalendarEvent) => {
    try {
      if (event.id) {
        // Update existing event
        await updateEvent(event);
      } else {
        // Create new event
        await createEvent(event);
      }
      setShowEventForm(false);
      refreshEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        style={{ 
          height: '100%',
          backgroundColor: theme.palette.background.paper 
        }}
      />
      {showEventForm && (
        <EventForm
          event={selectedEvent}
          onSave={handleSaveEvent}
          onClose={() => setShowEventForm(false)}
        />
      )}
    </Box>
  );
};

// plugins/calendar/components/EventForm.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { CalendarEvent } from '../types';

interface EventFormProps {
  event?: CalendarEvent | null;
  onSave: (event: CalendarEvent) => void;
  onClose: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = React.useState<Partial<CalendarEvent>>(
    event || {
      title: '',
      description: '',
      start: new Date(),
      end: new Date(),
      allDay: false
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as CalendarEvent);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {event?.id ? 'Edit Event' : 'Create Event'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
            <DateTimePicker
              label="Start Date"
              value={formData.start}
              onChange={(date) => setFormData({ ...formData, start: date })}
            />
            <DateTimePicker
              label="End Date"
              value={formData.end}
              onChange={(date) => setFormData({ ...formData, end: date })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                />
              }
              label="All Day"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// plugins/calendar/types/index.ts

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  location?: string;
  attendees?: string[];
}

export interface EventStore {
  initialize(): Promise<void>;
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  createEvent(event: CalendarEvent): Promise<CalendarEvent>;
  updateEvent(event: CalendarEvent): Promise<CalendarEvent>;
  deleteEvent(eventId: string): Promise<void>;
  cleanup(): Promise<void>;
}
