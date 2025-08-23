import { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  addWeeks,
  subWeeks,
  isBefore,      // --- NEW: Import the 'isBefore' function ---
  startOfToday,  // --- NEW: Import the 'startOfToday' function ---
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Props for the AvailabilitySelector component.
 */
interface AvailabilitySelectorProps {
  /**
   * An array of initially selected slot strings in ISO format.
   * This is used to show previously saved selections.
   * @example ["2025-09-23T09:00:00.000Z"]
   */
  initialSlots?: string[];
  
  /**
   * Callback function that is executed when the user clicks the "Save" button.
   * It receives the final array of selected slots.
   */
  onSave: (selectedSlots: string[]) => void;
  /**
   * Callback function to close the parent modal or dialog.
   */
  onClose: () => void;
}

/**
 * A reusable UI component for selecting 1-hour availability slots in a weekly calendar view.
 */
export const AvailabilitySelector = ({
  initialSlots = [],
  onSave,
  onClose,
}: AvailabilitySelectorProps) => {

  // --- Point 1: LOADS EXISTING SLOTS ---
  // The component's internal state is initialized with the slots passed via props.
  // This ensures that when the modal opens, all previously saved slots are already selected.
  const [selectedSlots, setSelectedSlots] = useState(new Set<string>(initialSlots));

  // State to manage the currently displayed week.
  const [currentDate, setCurrentDate] = useState(new Date());

   const today = useMemo(() => startOfToday(), []);

  // Memoized values to prevent recalculation on every render.
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const daysOfWeek = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);
  const timeSlots = useMemo(() => Array.from({ length: 9 }).map((_, i) => `${9 + i}:00`), []);

  /**
   * --- Point 2: ADDS/REMOVES SLOTS WITHOUT LOSING OTHERS ---
   * This function handles the logic for toggling a slot's selection status.
   * It makes a copy of the current selections, modifies the copy, and then updates the state.
   */
  const handleSlotClick = (day: Date, time: string) => {
    const [hour] = time.split(':').map(Number);
    const slotDate = setSeconds(setMinutes(setHours(day, hour), 0), 0);
    const slotISOString = slotDate.toISOString();

    // Create a copy to avoid directly mutating state.
    const newSelectedSlots = new Set(selectedSlots);
    if (newSelectedSlots.has(slotISOString)) {
      newSelectedSlots.delete(slotISOString); // If already selected, deselect it.
    } else {
      newSelectedSlots.add(slotISOString); // If not selected, select it.
    }
    // Update the state with the modified set. All other selections are preserved.
    setSelectedSlots(newSelectedSlots);
  };

  /**
   * Called when the final save button is clicked.
   */
  const handleSaveClick = () => {
    onSave(Array.from(selectedSlots));
  };
  
  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Header with Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-lg font-semibold text-center">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <div key={day.toISOString()} className="text-center">
            {/* Day Header */}
            <div className="font-semibold">{format(day, 'E')}</div>
            <div className="text-sm text-muted-foreground">{format(day, 'd')}</div>
            
            {/* Time Slot Buttons */}
            <div className="mt-2 flex flex-col gap-1.5">
              {timeSlots.map((time) => {
                const [hour] = time.split(':').map(Number);
                const slotDate = setSeconds(setMinutes(setHours(day, hour), 0), 0);
                const slotISOString = slotDate.toISOString();
                
                // --- Point 3: VISUALLY SHOWS SELECTED SLOTS ---
                // The `isSelected` variable checks if the current slot exists in our state.
                const isSelected = selectedSlots.has(slotISOString);

                const isPast = isBefore(day, today);
                return (
                  <Button
                    key={time}
                    // The button's style changes based on whether it's selected.
                    variant={isSelected ? 'default' : 'outline'}
                    disabled={isPast}
                    className={`h-9 transition-colors duration-150 ${isSelected ? 'bg-green-600 hover:bg-green-700 text-white' : ''} ${isPast ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
                    onClick={() => handleSlotClick(day, time)}
                  >
                    {time}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer with Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveClick}>Save Availability</Button>
      </div>
    </div>
  );
};
