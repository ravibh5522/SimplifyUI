import { useState, useMemo, useEffect } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  parseISO,
  addHours,
  isEqual,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

// --- Type Definitions (Unchanged) ---
interface SlotRange { start: string; end: string; }
interface BackendFreeSlot extends SlotRange { date: string; }
interface BackendOccupiedSlot extends SlotRange { id: string; title: string; type: string; }
interface AvailabilityObject { free_slots: BackendFreeSlot[]; occupied_slots: BackendOccupiedSlot[]; }
interface EnhancedAvailabilitySelectorProps {
  initialData: AvailabilityObject[] | null;
  onSave: (updatedData: AvailabilityObject[]) => void;
  onClose: () => void;
}
type SlotStatus = 'Selected' | 'Occupied' | 'Available' | 'Past';

export const EnhancedAvailabilitySelector = ({
  initialData,
  onSave,
  onClose,
}: EnhancedAvailabilitySelectorProps) => {

  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragSelectionMode, setDragSelectionMode] = useState<'select' | 'deselect' | null>(null);

  const parsedInitialData = useMemo(() => {
    if (initialData && initialData.length > 0) {
      return initialData[0];
    }
    return { free_slots: [], occupied_slots: [] };
  }, [initialData]);
  
  const occupiedDataMap = useMemo(() => {
    const map = new Map<string, BackendOccupiedSlot>();
    (parsedInitialData.occupied_slots || []).forEach(slot => {
        let current = parseISO(slot.start);
        const end = parseISO(slot.end);
        while(current.getTime() < end.getTime()) {
            map.set(current.toISOString(), slot);
            current = addHours(current, 1);
        }
    });
    return map;
  }, [parsedInitialData.occupied_slots]);

  useEffect(() => {
    const initialSlots = new Set<string>();
    (parsedInitialData.free_slots || []).forEach(range => {
      let current = parseISO(range.start);
      const end = parseISO(range.end);
      while (current.getTime() < end.getTime()) {
        initialSlots.add(current.toISOString());
        current = addHours(current, 1);
      }
    });
    setSelectedSlots(initialSlots);
  }, [initialData]);


  // =========================================================================
  // --- THE DEFINITIVE FIX: Interpreting User Clicks as Local Time ---
  // This new helper function creates a Date object in the user's LOCAL timezone.
  // =========================================================================
  const getLocalTimeForSlot = (day: Date, time: string): Date => {
    const [hour] = time.split(':').map(Number);
    // Create a new Date object based on the year, month, and day of the loop
    const localDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    // IMPORTANT: .setHours() works in the browser's local timezone.
    localDate.setHours(hour, 0, 0, 0);
    return localDate;
  };
  
  const getSlotStatus = (slotDate: Date): SlotStatus => {
    if (slotDate.getTime() < new Date().getTime()) return 'Past';
    // Convert the local time to a UTC string for checking against our state
    const slotISO = slotDate.toISOString();
    if (occupiedDataMap.has(slotISO)) return 'Occupied';
    if (selectedSlots.has(slotISO)) return 'Selected';
    return 'Available';
  };

  const handleMouseDown = (day: Date, time: string) => {
    // 1. Get the Date object representing the user's LOCAL time.
    const localSlotDate = getLocalTimeForSlot(day, time);
    const status = getSlotStatus(localSlotDate);
    if (status === 'Past' || status === 'Occupied') return;

    setIsDragging(true);
    // 2. Convert it to the CORRECT UTC string for state management.
    const slotISO = localSlotDate.toISOString();
    
    setSelectedSlots(prevSlots => {
      const newSlots = new Set(prevSlots);
      const mode = newSlots.has(slotISO) ? 'deselect' : 'select';
      setDragSelectionMode(mode);
      if (mode === 'deselect') newSlots.delete(slotISO);
      else newSlots.add(slotISO);
      return newSlots;
    });
  };

  const handleMouseEnter = (day: Date, time: string) => {
    if (!isDragging) return;
    // 3. The same logic applies to dragging over slots.
    const localSlotDate = getLocalTimeForSlot(day, time);
    if (getSlotStatus(localSlotDate) === 'Past' || getSlotStatus(localSlotDate) === 'Occupied') return;

    const slotISO = localSlotDate.toISOString();
    setSelectedSlots(prevSlots => {
        const newSlots = new Set(prevSlots);
        if (dragSelectionMode === 'select') newSlots.add(slotISO);
        else if (dragSelectionMode === 'deselect') newSlots.delete(slotISO);
        return newSlots;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragSelectionMode(null);
  };
  
  const handleClearAll = () => setSelectedSlots(new Set());
  
  // --- The `handleSaveClick` function requires NO CHANGES ---
  // It already works with correct UTC ISO strings from the `selectedSlots` state.
  const handleSaveClick = () => {
    const sortedSlots = Array.from(selectedSlots).map(parseISO).sort((a, b) => a.getTime() - b.getTime());
    const mergedRanges: SlotRange[] = [];
    if (sortedSlots.length > 0) {
      let currentRange = { start: sortedSlots[0], end: addHours(sortedSlots[0], 1) };
      for (let i = 1; i < sortedSlots.length; i++) {
        if (isEqual(sortedSlots[i], currentRange.end)) {
          currentRange.end = addHours(sortedSlots[i], 1);
        } else {
          mergedRanges.push({ start: currentRange.start.toISOString(), end: currentRange.end.toISOString() });
          currentRange = { start: sortedSlots[i], end: addHours(sortedSlots[i], 1) };
        }
      }
      mergedRanges.push({ start: currentRange.start.toISOString(), end: currentRange.end.toISOString() });
    }
    const formattedFreeSlots = mergedRanges.map(range => ({ ...range, date: new Date(range.start).toISOString().split('T')[0] }));
    const payloadForBackend: AvailabilityObject[] = [{ free_slots: formattedFreeSlots, occupied_slots: parsedInitialData.occupied_slots }];
    onSave(payloadForBackend);
  };
  
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const daysOfWeek = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);
  const timeSlots = useMemo(() => Array.from({ length: 12 }).map((_, i) => `${8 + i}:00`), []);

  return (
    <TooltipProvider>
      <div 
        className="flex flex-col gap-4 p-4 bg-slate-50 min-h-full rounded-lg"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        { /* --- The rest of the JSX rendering code requires NO CHANGES --- */ }
        { /* It now gets the correct local date objects to render */ }
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}><ChevronLeft className="h-5 w-5" /></Button>
          <div className="text-xl font-bold text-gray-700">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}</div>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}><ChevronRight className="h-5 w-5" /></Button>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 p-2 rounded-lg border bg-white">
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-white border-2 border-slate-300 rounded-sm"></div><span className="text-xs text-slate-600">Available</span></div>
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-blue-600 rounded-sm"></div><span className="text-xs text-slate-600">Selected</span></div>
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-red-500 rounded-sm"></div><span className="text-xs text-slate-600">Booked</span></div>
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-slate-200 rounded-sm"></div><span className="text-xs text-slate-600">Past</span></div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => {
          const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
          return (
              <div key={day.toISOString()} className="text-center bg-white p-2 rounded-lg border">
              <div className={`font-bold text-sm mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{format(day, 'E')}</div>
              <div className={`text-xl mb-2 ${isToday ? 'text-blue-600 font-extrabold' : 'text-gray-800'}`}>{format(day, 'd')}</div>
              <div className="flex flex-col gap-1.5">
                  {timeSlots.map((time) => {
                  // --- 4. Pass the correct local date object to the status function ---
                  const localSlotDate = getLocalTimeForSlot(day, time);
                  const status = getSlotStatus(localSlotDate);
                  const occupiedInfo = occupiedDataMap.get(localSlotDate.toISOString());
                  let className = "text-xs font-semibold py-2 px-1 rounded-md transition-all duration-150 w-full min-h-[36px] border";
                  let disabled = false;
                  switch (status) {
                      case 'Selected': className += ' bg-blue-600 border-blue-700 text-white'; break;
                      case 'Occupied': className += ' bg-red-500 border-red-600 text-white cursor-not-allowed'; disabled = true; break;
                      case 'Available': className += ' bg-white border-slate-300 text-slate-700 hover:bg-blue-50 hover:border-blue-400'; break;
                      case 'Past': className += ' bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'; disabled = true; break;
                  }
                  const button = (<button key={time} disabled={disabled} className={className} onMouseDown={() => handleMouseDown(day, time)} onMouseEnter={() => handleMouseEnter(day, time)}>{status === 'Occupied' ? <Lock className="w-3 h-3 mx-auto"/> : time}</button>);
                  return status === 'Occupied' ? (<Tooltip><TooltipTrigger asChild>{button}</TooltipTrigger><TooltipContent><p>{occupiedInfo?.title || 'Booked'}</p></TooltipContent></Tooltip>) : (button);
                  })}
              </div>
              </div>
          );
          })}
        </div>

        <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2"><Button variant="outline" size="sm" onClick={handleClearAll} disabled={selectedSlots.size === 0}>Clear All</Button></div>
            <div className="flex gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={handleSaveClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Save Availability</Button></div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// import { useState, useMemo, useEffect } from 'react';
// import {
//   format,
//   startOfWeek,
//   addDays,
//   addWeeks,
//   subWeeks,
//   parseISO,
//   addHours,
//   isEqual,
// } from 'date-fns';
// import { Button } from '@/components/ui/button';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

// // --- Type Definitions (Unchanged) ---
// interface SlotRange { start: string; end: string; }
// interface BackendFreeSlot extends SlotRange { date: string; }
// interface BackendOccupiedSlot extends SlotRange { id: string; title: string; type: string; }
// interface AvailabilityObject { free_slots: BackendFreeSlot[]; occupied_slots: BackendOccupiedSlot[]; }
// interface EnhancedAvailabilitySelectorProps {
//   initialData: AvailabilityObject[] | null;
//   onSave: (updatedData: AvailabilityObject[]) => void;
//   onClose: () => void;
// }
// type SlotStatus = 'Selected' | 'Occupied' | 'Available' | 'Past';

// export const EnhancedAvailabilitySelector = ({
//   initialData,
//   onSave,
//   onClose,
// }: EnhancedAvailabilitySelectorProps) => {

//   // --- STATE MANAGEMENT: The Single Source of Truth ---
//   const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

//   // Other UI-related state
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragSelectionMode, setDragSelectionMode] = useState<'select' | 'deselect' | null>(null);

//   // --- PARSED DATA FROM PROPS ---
//   const parsedInitialData = useMemo(() => {
//     if (initialData && initialData.length > 0) {
//       return initialData[0];
//     }
//     return { free_slots: [], occupied_slots: [] };
//   }, [initialData]);
  
//   const occupiedDataMap = useMemo(() => {
//     const map = new Map<string, BackendOccupiedSlot>();
//     (parsedInitialData.occupied_slots || []).forEach(slot => {
//         let current = parseISO(slot.start);
//         const end = parseISO(slot.end);
//         while(current.getTime() < end.getTime()) {
//             map.set(current.toISOString(), slot);
//             current = addHours(current, 1);
//         }
//     });
//     return map;
//   }, [parsedInitialData.occupied_slots]);


//   // =========================================================================
//   // --- THE DEFINITIVE FIX: Syncing Props to State Reliably ---
//   // This hook listens for when `initialData` arrives from the backend.
//   // When it does, it populates our `selectedSlots` state ONCE.
//   // This is the standard, bulletproof React pattern for this problem.
//   // =========================================================================
//   useEffect(() => {
//     console.log("SYNC EFFECT: Data received from props. Processing free_slots:", parsedInitialData.free_slots);
    
//     const initialSlots = new Set<string>();
//     (parsedInitialData.free_slots || []).forEach(range => {
//       let current = parseISO(range.start);
//       const end = parseISO(range.end);
//       while (current.getTime() < end.getTime()) {
//         initialSlots.add(current.toISOString());
//         current = addHours(current, 1);
//       }
//     });
    
//     console.log(`SYNC EFFECT: Populating state with ${initialSlots.size} slots.`);
//     // Set our component's internal state to match the data from the database.
//     setSelectedSlots(initialSlots);

//   }, [initialData]); // Dependency array ensures this runs ONLY when the `initialData` prop changes.


//   // --- All rendering logic below is now simple and reliable ---

//   const startOfUTCToday = useMemo(() => {
//     const now = new Date();
//     return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
//   }, []);

//   const getUTCDateForSlot = (day: Date, time: string): Date => {
//       const [hour] = time.split(':').map(Number);
//       return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hour));
//   };
  
//   // This function is now simple because it only needs to check our reliable `selectedSlots` state.
//   const getSlotStatus = (slotDate: Date): SlotStatus => {
//     if (slotDate.getTime() < startOfUTCToday.getTime()) return 'Past';
//     const slotISO = slotDate.toISOString();
//     if (occupiedDataMap.has(slotISO)) return 'Occupied';
//     if (selectedSlots.has(slotISO)) return 'Selected'; // Direct check against the component's state
//     return 'Available';
//   };

//   const handleMouseDown = (day: Date, time: string) => {
//     const slotDate = getUTCDateForSlot(day, time);
//     const status = getSlotStatus(slotDate);
//     if (status === 'Past' || status === 'Occupied') return;

//     setIsDragging(true);
//     const slotISO = slotDate.toISOString();
    
//     setSelectedSlots(prevSlots => {
//       const newSlots = new Set(prevSlots);
//       const mode = newSlots.has(slotISO) ? 'deselect' : 'select';
//       setDragSelectionMode(mode);
//       if (mode === 'deselect') newSlots.delete(slotISO);
//       else newSlots.add(slotISO);
//       return newSlots;
//     });
//   };

//   const handleMouseEnter = (day: Date, time: string) => {
//     if (!isDragging) return;
//     const slotDate = getUTCDateForSlot(day, time);
//     if (getSlotStatus(slotDate) === 'Past' || getSlotStatus(slotDate) === 'Occupied') return;

//     const slotISO = slotDate.toISOString();
//     setSelectedSlots(prevSlots => {
//         const newSlots = new Set(prevSlots);
//         if (dragSelectionMode === 'select') newSlots.add(slotISO);
//         else if (dragSelectionMode === 'deselect') newSlots.delete(slotISO);
//         return newSlots;
//     });
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//     setDragSelectionMode(null);
//   };
  
//   const handleClearAll = () => setSelectedSlots(new Set());
  
//   const handleSaveClick = () => {
//     const sortedSlots = Array.from(selectedSlots).map(parseISO).sort((a, b) => a.getTime() - b.getTime());
//     const mergedRanges: SlotRange[] = [];
//     if (sortedSlots.length > 0) {
//       let currentRange = { start: sortedSlots[0], end: addHours(sortedSlots[0], 1) };
//       for (let i = 1; i < sortedSlots.length; i++) {
//         if (isEqual(sortedSlots[i], currentRange.end)) {
//           currentRange.end = addHours(sortedSlots[i], 1);
//         } else {
//           mergedRanges.push({ start: currentRange.start.toISOString(), end: currentRange.end.toISOString() });
//           currentRange = { start: sortedSlots[i], end: addHours(sortedSlots[i], 1) };
//         }
//       }
//       mergedRanges.push({ start: currentRange.start.toISOString(), end: currentRange.end.toISOString() });
//     }
//     const formattedFreeSlots = mergedRanges.map(range => ({ ...range, date: new Date(range.start).toISOString().split('T')[0] }));
//     const payloadForBackend: AvailabilityObject[] = [{ free_slots: formattedFreeSlots, occupied_slots: parsedInitialData.occupied_slots }];
//     onSave(payloadForBackend);
//   };
  
//   const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
//   const daysOfWeek = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);
//   const timeSlots = useMemo(() => Array.from({ length: 12 }).map((_, i) => `${8 + i}:00`), []);

//   return (
//     <TooltipProvider>
//       <div 
//         className="flex flex-col gap-4 p-4 bg-slate-50 min-h-full rounded-lg"
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}
//       >
//         <div className="flex items-center justify-between">
//           <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}><ChevronLeft className="h-5 w-5" /></Button>
//           <div className="text-xl font-bold text-gray-700">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}</div>
//           <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}><ChevronRight className="h-5 w-5" /></Button>
//         </div>

//         <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 p-2 rounded-lg border bg-white">
//           <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-white border-2 border-slate-300 rounded-sm"></div><span className="text-xs text-slate-600">Available</span></div>
//           <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-blue-600 rounded-sm"></div><span className="text-xs text-slate-600">Selected</span></div>
//           <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-red-500 rounded-sm"></div><span className="text-xs text-slate-600">Booked</span></div>
//           <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-slate-200 rounded-sm"></div><span className="text-xs text-slate-600">Past</span></div>
//         </div>

//         <div className="grid grid-cols-7 gap-2">
//           {daysOfWeek.map((day) => {
//           const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
//           return (
//               <div key={day.toISOString()} className="text-center bg-white p-2 rounded-lg border">
//               <div className={`font-bold text-sm mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{format(day, 'E')}</div>
//               <div className={`text-xl mb-2 ${isToday ? 'text-blue-600 font-extrabold' : 'text-gray-800'}`}>{format(day, 'd')}</div>
//               <div className="flex flex-col gap-1.5">
//                   {timeSlots.map((time) => {
//                   const slotDate = getUTCDateForSlot(day, time);
//                   const status = getSlotStatus(slotDate);
//                   const occupiedInfo = occupiedDataMap.get(slotDate.toISOString());
//                   let className = "text-xs font-semibold py-2 px-1 rounded-md transition-all duration-150 w-full min-h-[36px] border";
//                   let disabled = false;
//                   switch (status) {
//                       case 'Selected': className += ' bg-blue-600 border-blue-700 text-white'; break;
//                       case 'Occupied': className += ' bg-red-500 border-red-600 text-white cursor-not-allowed'; disabled = true; break;
//                       case 'Available': className += ' bg-white border-slate-300 text-slate-700 hover:bg-blue-50 hover:border-blue-400'; break;
//                       case 'Past': className += ' bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'; disabled = true; break;
//                   }
//                   const button = (<button key={time} disabled={disabled} className={className} onMouseDown={() => handleMouseDown(day, time)} onMouseEnter={() => handleMouseEnter(day, time)}>{status === 'Occupied' ? <Lock className="w-3 h-3 mx-auto"/> : time}</button>);
//                   return status === 'Occupied' ? (<Tooltip><TooltipTrigger asChild>{button}</TooltipTrigger><TooltipContent><p>{occupiedInfo?.title || 'Booked'}</p></TooltipContent></Tooltip>) : (button);
//                   })}
//               </div>
//               </div>
//           );
//           })}
//         </div>

//         <div className="flex justify-between items-center mt-2">
//             <div className="flex gap-2"><Button variant="outline" size="sm" onClick={handleClearAll} disabled={selectedSlots.size === 0}>Clear All</Button></div>
//             <div className="flex gap-3"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={handleSaveClick} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Save Availability</Button></div>
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// };