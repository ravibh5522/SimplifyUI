// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Trash2, Plus, Clock, Globe, CalendarOff, Settings2 } from 'lucide-react';
// import { Separator } from './separator';
// import { deepMerge } from '@/lib/utils';
// // Define the shape of the data we expect, based on your JSON
// interface AvailabilityData {
//   availability: {
//     timezone: string;
//     last_updated?: string;
//     default_working_hours: {
//       [key: string]: { start: string; end: string }[];
//     };
//     preferences: {
//       preferred_interview_duration: number;
//       max_interviews_per_day: number;
//       min_break_between_interviews: number;
//       blackout_dates: { start_date: string; end_date: string; reason: string }[];
//     };
//     // We will preserve the other fields but not make them editable in this UI
//     [key: string]: any;
//   };
// }

// // Define the props for our component
// interface AvailabilityManagerProps {
//   initialData: AvailabilityData | null | undefined;
//   onSave: (updatedData: AvailabilityData) => void;
//   onClose: () => void;
// }

// // A default empty state for when no data is available
// const defaultAvailability: AvailabilityData = {
//   availability: {
//     timezone: 'Asia/Kolkata',
//     default_working_hours: {
//       monday: [{ start: '09:00', end: '17:00' }],
//       tuesday: [{ start: '09:00', end: '17:00' }],
//       wednesday: [{ start: '09:00', end: '17:00' }],
//       thursday: [{ start: '09:00', end: '17:00' }],
//       friday: [{ start: '09:00', end: '17:00' }],
//       saturday: [],
//       sunday: [],
//     },
//     preferences: {
//       preferred_interview_duration: 60,
//       max_interviews_per_day: 4,
//       min_break_between_interviews: 15,
//       blackout_dates: [],
//     },
//     free_slots: [],
//     occupied_slots: [],
//     blocked_slots: [],
//     scheduling_rules: {},
//   },
// };


// export const AvailabilityManager = ({ initialData, onSave, onClose }: AvailabilityManagerProps) => {
//   // Use the initial data from the DB, or our default if none exists
// //   const [data, setData] = useState<AvailabilityData>(() => deepMerge(defaultAvailability, initialData || {}));
// const [data, setData] = useState<AvailabilityData>(() => {
//     // We now expect the raw availability object. We wrap it for our component's internal state.
//     const initial = initialData ? { availability: initialData } : {};
//     return deepMerge(defaultAvailability, initial);
// });

//   // Helper to update nested state immutably
//   const updateNestedState = (path: string, value: any) => {
//     setData(prevData => {
//       const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy
//       const keys = path.split('.');
//       let current = newData;
//       for (let i = 0; i < keys.length - 1; i++) {
//         current = current[keys[i]];
//       }
//       current[keys[keys.length - 1]] = value;
//       return newData;
//     });
//   };

//   const handleSave = () => {
//     // Add the current timestamp before saving
//     const dataToSave = {
//       ...data,
//       availability: {
//         ...data.availability,
//         last_updated: new Date().toISOString(),
//       }
//     };
//     onSave(dataToSave);
//   };

//   const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

//   // --- SAFEGUARD: If data is not ready, show a loading state ---
//   if (!data?.availability?.preferences) {
//       return <div>Loading availability settings...</div>;
//   }

//   return (
//     <div className="space-y-6">
//       {/* Section 1: General Preferences */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> General</CardTitle>
//           <CardDescription>Set your main timezone and preferred interview settings.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label>Timezone</Label>
//             <Input 
//               value={data.availability.timezone}
//               onChange={(e) => updateNestedState('availability.timezone', e.target.value)}
//               placeholder="e.g., Asia/Kolkata"
//             />
//           </div>
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <Label>Preferred Duration (mins)</Label>
//               <Input 
//                 type="number"
//                 value={data.availability.preferences.preferred_interview_duration}
//                 onChange={(e) => updateNestedState('availability.preferences.preferred_interview_duration', parseInt(e.target.value))}
//               />
//             </div>
//             <div>
//               <Label>Max Interviews / Day</Label>
//               <Input 
//                 type="number"
//                 value={data.availability.preferences.max_interviews_per_day}
//                 onChange={(e) => updateNestedState('availability.preferences.max_interviews_per_day', parseInt(e.target.value))}
//               />
//             </div>
//             <div>
//               <Label>Min Break (mins)</Label>
//               <Input 
//                 type="number"
//                 value={data.availability.preferences.min_break_between_interviews}
//                 onChange={(e) => updateNestedState('availability.preferences.min_break_between_interviews', parseInt(e.target.value))}
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Section 2: Weekly Hours */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Weekly Hours</CardTitle>
//           <CardDescription>Define your default working hours for each day of the week.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {days.map(day => {
//             const isEnabled = data.availability.default_working_hours[day]?.length > 0;
//             const hours = isEnabled ? data.availability.default_working_hours[day][0] : { start: '09:00', end: '17:00' };

//             return (
//               <div key={day} className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <Switch
//                     checked={isEnabled}
//                     onCheckedChange={(checked) => {
//                       const newHours = checked ? [{ start: '09:00', end: '17:00' }] : [];
//                       updateNestedState(`availability.default_working_hours.${day}`, newHours);
//                     }}
//                   />
//                   <Label className="capitalize w-24">{day}</Label>
//                 </div>
//                 {isEnabled ? (
//                   <div className="flex items-center gap-2">
//                     <Input
//                       type="time"
//                       value={hours.start}
//                       onChange={(e) => updateNestedState(`availability.default_working_hours.${day}`, [{ ...hours, start: e.target.value }])}
//                       className="w-32"
//                     />
//                     <span>-</span>
//                     <Input
//                       type="time"
//                       value={hours.end}
//                       onChange={(e) => updateNestedState(`availability.default_working_hours.${day}`, [{ ...hours, end: e.target.value }])}
//                       className="w-32"
//                     />
//                   </div>
//                 ) : (
//                   <p className="text-sm text-muted-foreground">Unavailable</p>
//                 )}
//               </div>
//             );
//           })}
//         </CardContent>
//       </Card>
      
//       {/* Action Buttons */}
//       <div className="flex justify-end gap-2 pt-4">
//         <Button variant="ghost" onClick={onClose}>Cancel</Button>
//         <Button onClick={handleSave}>Save Changes</Button>
//       </div>
//     </div>
//   );
// };



// claude v2 tester
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Clock, Globe, Settings2, Calendar, Users, Shield, Ban, CheckCircle2 } from 'lucide-react';
import { deepMerge } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Enhanced interface matching the payload structure
// --- START: PASTE THE HELPER FUNCTIONS HERE ---
// This function takes a UTC ISO string from the DB and converts it to a string for the datetime-local input
const toLocalISOString = (isoString: string): string => {
  if (!isoString) return ''; // Safety check for null or undefined strings
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
};

// This function takes the local time string from the input and converts it back to a full UTC ISO string for saving
const toUTCISOString = (localString: string): string => {
  if (!localString) return ''; // Safety check
  const date = new Date(localString);
  return date.toISOString();
};
// --- END: PASTE THE HELPER FUNCTIONS HERE ---

interface AvailabilityData {
  availability: {
    timezone: string;
    last_updated?: string;
    default_working_hours: {
      [key: string]: { start: string; end: string }[];
    };
    free_slots: Array<{
      id: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      slot_type: string;
      priority: string;
      preferences?: {
        interview_types: string[];
        max_duration: number;
        buffer_before: number;
        buffer_after: number;
      };
      constraints?: {
        min_notice_hours: number;
        can_be_split: boolean;
        requires_confirmation: boolean;
      };
    }>;
    occupied_slots: Array<{
      id: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      slot_type: string;
      event_type: string;
      event_title: string;
      event_id?: string;
      can_be_moved: boolean;
      priority: string;
      buffer_before?: number;
      buffer_after?: number;
      confirmation_deadline?: string;
      description?: string;
    }>;
    blocked_slots: Array<{
      id: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
      slot_type: string;
      reason: string;
      is_recurring?: boolean;
      recurrence_pattern?: string;
      description?: string;
    }>;
    preferences: {
      preferred_interview_duration: number;
      max_interviews_per_day: number;
      min_break_between_interviews: number;
      preferred_times: {
        morning: { start: string; end: string; weight: number };
        afternoon: { start: string; end: string; weight: number };
        evening: { start: string; end: string; weight: number };
      };
      blackout_dates: Array<{
        start_date: string;
        end_date: string;
        reason: string;
      }>;
      interview_type_preferences: {
        [key: string]: {
          min_duration: number;
          max_duration: number;
          preferred_duration: number;
        };
      };
    };
    scheduling_rules: {
      auto_accept_within_hours: number;
      requires_confirmation_if_less_than_hours: number;
      max_concurrent_tentative_slots: number;
      allow_back_to_back_interviews: boolean;
      weekend_availability: boolean;
    };
    [key: string]: any;
  };
}

interface AvailabilityManagerProps {
  initialData: any | null | undefined;
  onSave: (updatedData: any) => void;
  onClose: () => void;
}

const defaultAvailability: AvailabilityData = {
  availability: {
    timezone: 'Asia/Kolkata',
    default_working_hours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: [],
    },
    free_slots: [],
    occupied_slots: [],
    blocked_slots: [],
    preferences: {
      preferred_interview_duration: 60,
      max_interviews_per_day: 3,
      min_break_between_interviews: 30,
      preferred_times: {
        morning: { start: '09:00', end: '12:00', weight: 0.9 },
        afternoon: { start: '14:00', end: '17:00', weight: 0.7 },
        evening: { start: '17:00', end: '19:00', weight: 0.3 }
      },
      blackout_dates: [],
      interview_type_preferences: {
        technical: { min_duration: 45, max_duration: 90, preferred_duration: 60 },
        behavioral: { min_duration: 30, max_duration: 60, preferred_duration: 45 },
        cultural_fit: { min_duration: 30, max_duration: 45, preferred_duration: 30 }
      }
    },
    scheduling_rules: {
      auto_accept_within_hours: 48,
      requires_confirmation_if_less_than_hours: 24,
      max_concurrent_tentative_slots: 2,
      allow_back_to_back_interviews: false,
      weekend_availability: false
    }
  },
};

export const AvailabilityManager = ({ initialData, onSave, onClose }: AvailabilityManagerProps) => {
  const [data, setData] = useState<AvailabilityData>(() => {
    if (initialData) {
      if (initialData.availability) {
        return deepMerge(defaultAvailability, initialData);
      } else {
        return deepMerge(defaultAvailability, { availability: initialData });
      }
    }
    return defaultAvailability;
  });

  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return startOfWeek.toISOString().split('T')[0];
  });

  // Helper to update nested state
  const updateNestedState = (path: string, value: any) => {
    setData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = () => {
    const dataToSave = {
      ...data.availability,
      last_updated: new Date().toISOString(),
    };
    onSave(dataToSave);
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Working hours helpers
  const handleAddSlot = (day: string) => {
    const currentSlots = data.availability.default_working_hours[day] || [];
    const newSlots = [...currentSlots, { start: '10:00', end: '11:00' }];
    updateNestedState(`availability.default_working_hours.${day}`, newSlots);
  };

  const handleRemoveSlot = (day: string, indexToRemove: number) => {
    const currentSlots = data.availability.default_working_hours[day] || [];
    const newSlots = currentSlots.filter((_, index) => index !== indexToRemove);
    updateNestedState(`availability.default_working_hours.${day}`, newSlots);
  };
  
  const handleUpdateSlot = (day: string, indexToUpdate: number, field: 'start' | 'end', value: string) => {
    const currentSlots = data.availability.default_working_hours[day] || [];
    const newSlots = currentSlots.map((slot, index) => {
      if (index === indexToUpdate) {
        return { ...slot, [field]: value };
      }
      return slot;
    });
    updateNestedState(`availability.default_working_hours.${day}`, newSlots);
  };

  // Blackout dates helpers
  const addBlackoutDate = () => {
    const currentBlackouts = data.availability.preferences.blackout_dates || [];
    const newBlackout = {
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: ''
    };
    updateNestedState('availability.preferences.blackout_dates', [...currentBlackouts, newBlackout]);
  };

  const removeBlackoutDate = (index: number) => {
    const currentBlackouts = data.availability.preferences.blackout_dates || [];
    updateNestedState('availability.preferences.blackout_dates', currentBlackouts.filter((_, i) => i !== index));
  };

  // Interview type preferences helpers
  const addInterviewType = () => {
    const currentTypes = data.availability.preferences.interview_type_preferences || {};
    const newTypeName = `new_type_${Object.keys(currentTypes).length + 1}`;
    updateNestedState(`availability.preferences.interview_type_preferences.${newTypeName}`, {
      min_duration: 30,
      max_duration: 60,
      preferred_duration: 45
    });
  };

  const removeInterviewType = (typeName: string) => {
    const currentTypes = { ...data.availability.preferences.interview_type_preferences };
    delete currentTypes[typeName];
    updateNestedState('availability.preferences.interview_type_preferences', currentTypes);
  };

  // Free slots helpers
  const addFreeSlot = () => {
    const currentSlots = data.availability.free_slots || [];
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    
    const newSlot = {
      id: `fs_${Date.now()}`,
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: 60,
      slot_type: 'available',
      priority: 'medium',
      preferences: {
        interview_types: ['technical'],
        max_duration: 90,
        buffer_before: 15,
        buffer_after: 15
      },
      constraints: {
        min_notice_hours: 24,
        can_be_split: false,
        requires_confirmation: false
      }
    };
    updateNestedState('availability.free_slots', [...currentSlots, newSlot]);
  };

  const removeFreeSlot = (index: number) => {
    const currentSlots = data.availability.free_slots || [];
    updateNestedState('availability.free_slots', currentSlots.filter((_, i) => i !== index));
  };

  // Get week date range for display
  const getWeekDateRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  if (!data?.availability?.preferences) {
    return <div className="p-8 text-center">Loading availability settings...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-6 -mr-6" style={{ maxHeight: 'calc(85vh - 100px)' }}>
        <div className="space-y-6 pb-6">
          {/* Week Selection Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> 
                Week Selection
              </CardTitle>
              <CardDescription>Choose which week you want to configure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label>Select Week Starting:</Label>
                <Input
                  type="date"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-48"
                />
                <Badge variant="outline">{getWeekDateRange(selectedWeek)}</Badge>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="schedule">Weekly Hours</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="slots">Time Slots</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" /> General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Timezone</Label>
                    <Input 
                      value={data.availability.timezone}
                      onChange={(e) => updateNestedState('availability.timezone', e.target.value)}
                      placeholder="e.g., Asia/Kolkata"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Preferred Duration (mins)</Label>
                      <Input 
                        type="number"
                        value={data.availability.preferences.preferred_interview_duration}
                        onChange={(e) => updateNestedState('availability.preferences.preferred_interview_duration', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Max Interviews / Day</Label>
                      <Input 
                        type="number"
                        value={data.availability.preferences.max_interviews_per_day}
                        onChange={(e) => updateNestedState('availability.preferences.max_interviews_per_day', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Min Break (mins)</Label>
                      <Input 
                        type="number"
                        value={data.availability.preferences.min_break_between_interviews}
                        onChange={(e) => updateNestedState('availability.preferences.min_break_between_interviews', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Weekly Hours Tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Weekly Working Hours
                  </CardTitle>
                  <CardDescription>Define your working hours for the selected week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {days.map(day => {
                    const daySlots = data.availability.default_working_hours[day] || [];
                    const isEnabled = daySlots.length > 0;

                    return (
                      <div key={day} className="p-4 border rounded-lg bg-background/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(checked) => {
                                const newHours = checked ? [{ start: '09:00', end: '17:00' }] : [];
                                updateNestedState(`availability.default_working_hours.${day}`, newHours);
                              }}
                            />
                            <Label className="capitalize text-md font-medium">{day}</Label>
                          </div>
                        </div>

                        {isEnabled ? (
                          <div className="space-y-3 pl-8">
                            {daySlots.map((slot, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => handleUpdateSlot(day, index, 'start', e.target.value)}
                                  className="w-32"
                                />
                                <span>-</span>
                                <Input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => handleUpdateSlot(day, index, 'end', e.target.value)}
                                  className="w-32"
                                />
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveSlot(day, index)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => handleAddSlot(day)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Time Block
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground pl-8">Unavailable</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <div className="space-y-6">
                {/* Preferred Times */}
                <Card>
                  <CardHeader>
                    <CardTitle>Preferred Time Slots</CardTitle>
                    <CardDescription>Set your preferred time periods with priority weights (0.1 - 1.0)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(data.availability.preferences.preferred_times).map(([period, times]) => (
                      <div key={period} className="grid grid-cols-4 gap-4 items-center">
                        <Label className="capitalize">{period}</Label>
                        <Input
                          type="time"
                          value={times.start}
                          onChange={(e) => updateNestedState(`availability.preferences.preferred_times.${period}.start`, e.target.value)}
                        />
                        <Input
                          type="time"
                          value={times.end}
                          onChange={(e) => updateNestedState(`availability.preferences.preferred_times.${period}.end`, e.target.value)}
                        />
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="1.0"
                          value={times.weight}
                          onChange={(e) => updateNestedState(`availability.preferences.preferred_times.${period}.weight`, parseFloat(e.target.value))}
                          placeholder="Weight (0.1-1.0)"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Interview Type Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Type Preferences</CardTitle>
                    <CardDescription>Configure duration preferences for different interview types</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(data.availability.preferences.interview_type_preferences).map(([type, prefs]) => (
                      <div key={type} className="grid grid-cols-5 gap-4 items-center p-3 border rounded-lg">
                        <Input
                          value={type}
                          onChange={(e) => {
                            const oldType = type;
                            const newType = e.target.value;
                            if (newType !== oldType) {
                              const currentTypes = { ...data.availability.preferences.interview_type_preferences };
                              currentTypes[newType] = currentTypes[oldType];
                              delete currentTypes[oldType];
                              updateNestedState('availability.preferences.interview_type_preferences', currentTypes);
                            }
                          }}
                          placeholder="Type name"
                        />
                        <Input
                          type="number"
                          value={prefs.min_duration}
                          onChange={(e) => updateNestedState(`availability.preferences.interview_type_preferences.${type}.min_duration`, parseInt(e.target.value))}
                          placeholder="Min mins"
                        />
                        <Input
                          type="number"
                          value={prefs.preferred_duration}
                          onChange={(e) => updateNestedState(`availability.preferences.interview_type_preferences.${type}.preferred_duration`, parseInt(e.target.value))}
                          placeholder="Preferred mins"
                        />
                        <Input
                          type="number"
                          value={prefs.max_duration}
                          onChange={(e) => updateNestedState(`availability.preferences.interview_type_preferences.${type}.max_duration`, parseInt(e.target.value))}
                          placeholder="Max mins"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeInterviewType(type)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addInterviewType}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Interview Type
                    </Button>
                  </CardContent>
                </Card>

                {/* Blackout Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ban className="w-5 h-5" />
                      Blackout Dates
                    </CardTitle>
                    <CardDescription>Periods when you're completely unavailable</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.availability.preferences.blackout_dates.map((blackout, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-center p-3 border rounded-lg">
                        <Input
                          type="date"
                          value={blackout.start_date}
                          onChange={(e) => updateNestedState(`availability.preferences.blackout_dates.${index}.start_date`, e.target.value)}
                        />
                        <Input
                          type="date"
                          value={blackout.end_date}
                          onChange={(e) => updateNestedState(`availability.preferences.blackout_dates.${index}.end_date`, e.target.value)}
                        />
                        <Input
                          value={blackout.reason}
                          onChange={(e) => updateNestedState(`availability.preferences.blackout_dates.${index}.reason`, e.target.value)}
                          placeholder="Reason"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeBlackoutDate(index)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addBlackoutDate}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blackout Period
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Time Slots Tab */}
            <TabsContent value="slots">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Available Time Slots
                  </CardTitle>
                  <CardDescription>Manage your specific available time slots with preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.availability.free_slots.map((slot, index) => (
                    <div key={slot.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={slot.priority === 'high' ? 'default' : slot.priority === 'medium' ? 'secondary' : 'outline'}>
                          {slot.priority} priority
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => removeFreeSlot(index)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Start Time</Label>
                          {/* <Input
                            type="datetime-local"
                            value={slot.start_time.slice(0, 16)}
                            onChange={(e) => updateNestedState(`availability.free_slots.${index}.start_time`, new Date(e.target.value).toISOString())}
                          /> */}
                          <Input
  type="datetime-local"
  value={toLocalISOString(slot.start_time)}
  onChange={(e) => updateNestedState(`availability.free_slots.${index}.start_time`, toUTCISOString(e.target.value))}
/>
                        </div>
                        <div>
                          <Label>End Time</Label>
                          {/* <Input
                            type="datetime-local"
                            value={slot.end_time.slice(0, 16)}
                            onChange={(e) => updateNestedState(`availability.free_slots.${index}.end_time`, new Date(e.target.value).toISOString())}
                          /> */}
                   <Input
  type="datetime-local"
  value={toLocalISOString(slot.end_time)}
  onChange={(e) => updateNestedState(`availability.free_slots.${index}.end_time`, toUTCISOString(e.target.value))}
/>       
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <Select
                            value={slot.priority}
                            onValueChange={(value) => updateNestedState(`availability.free_slots.${index}.priority`, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Buffer Before (mins)</Label>
                          <Input
                            type="number"
                            value={slot.preferences?.buffer_before || 0}
                            onChange={(e) => updateNestedState(`availability.free_slots.${index}.preferences.buffer_before`, parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Buffer After (mins)</Label>
                          <Input
                            type="number"
                            value={slot.preferences?.buffer_after || 0}
                            onChange={(e) => updateNestedState(`availability.free_slots.${index}.preferences.buffer_after`, parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addFreeSlot}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Available Slot
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5" />
                    Scheduling Rules
                  </CardTitle>
                  <CardDescription>Configure automatic scheduling behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Auto Accept Within (hours)</Label>
                      <Input
                        type="number"
                        value={data.availability.scheduling_rules.auto_accept_within_hours}
                        onChange={(e) => updateNestedState('availability.scheduling_rules.auto_accept_within_hours', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Requires Confirmation if Less Than (hours)</Label>
                      <Input
                        type="number"
                        value={data.availability.scheduling_rules.requires_confirmation_if_less_than_hours}
                        onChange={(e) => updateNestedState('availability.scheduling_rules.requires_confirmation_if_less_than_hours', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Max Concurrent Tentative Slots</Label>
                    <Input
                      type="number"
                      value={data.availability.scheduling_rules.max_concurrent_tentative_slots}
                      onChange={(e) => updateNestedState('availability.scheduling_rules.max_concurrent_tentative_slots', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={data.availability.scheduling_rules.allow_back_to_back_interviews}
                        onCheckedChange={(checked) => updateNestedState('availability.scheduling_rules.allow_back_to_back_interviews', checked)}
                      />
                      <Label>Allow Back-to-Back Interviews</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={data.availability.scheduling_rules.weekend_availability}
                        onCheckedChange={(checked) => updateNestedState('availability.scheduling_rules.weekend_availability', checked)}
                      />
                      <Label>Available on Weekends</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t bg-background">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

// claude 

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { Trash2, Plus, Clock, Globe, Settings2 } from 'lucide-react';
// import { deepMerge } from '@/lib/utils'; // Assumes deepMerge is in your utils file
// import { ScrollArea } from '@/components/ui/scroll-area';

// // Define the shape of the data we expect, based on your JSON
// interface AvailabilityData {
//   availability: {
//     timezone: string;
//     last_updated?: string;
//     default_working_hours: {
//       [key: string]: { start: string; end: string }[];
//     };
//     preferences: {
//       preferred_interview_duration: number;
//       max_interviews_per_day: number;
//       min_break_between_interviews: number;
//       blackout_dates: { start_date: string; end_date: string; reason: string }[];
//     };
//     // Preserve other fields but not make them editable in this UI
//     [key: string]: any;
//   };
// }

// // Define the props for our component
// interface AvailabilityManagerProps {
//   initialData: any | null | undefined;
//   onSave: (updatedData: any) => void;
//   onClose: () => void;
// }

// // A default empty state for when no data is available from the database
// const defaultAvailability: AvailabilityData = {
//   availability: {
//     timezone: 'Asia/Kolkata',
//     default_working_hours: {
//       monday: [{ start: '09:00', end: '17:00' }],
//       tuesday: [{ start: '09:00', end: '17:00' }],
//       wednesday: [{ start: '09:00', end: '17:00' }],
//       thursday: [{ start: '09:00', end: '17:00' }],
//       friday: [{ start: '09:00', end: '17:00' }],
//       saturday: [],
//       sunday: [],
//     },
//     preferences: {
//       preferred_interview_duration: 60,
//       max_interviews_per_day: 4,
//       min_break_between_interviews: 15,
//       blackout_dates: [],
//     },
//     free_slots: [],
//     occupied_slots: [],
//     blocked_slots: [],
//     scheduling_rules: {},
//   },
// };

// export const AvailabilityManager = ({ initialData, onSave, onClose }: AvailabilityManagerProps) => {
//   // FIXED: Properly initialize state based on the structure of initialData
//   const [data, setData] = useState<AvailabilityData>(() => {
//     // If initialData exists, check if it already has the 'availability' wrapper
//     if (initialData) {
//       // If initialData already has 'availability' property, use it as is
//       if (initialData.availability) {
//         return deepMerge(defaultAvailability, initialData);
//       } else {
//         // If initialData is the raw availability data (without wrapper), wrap it
//         return deepMerge(defaultAvailability, { availability: initialData });
//       }
//     }
//     // If no initialData, use default
//     return defaultAvailability;
//   });

//   // Add debugging to help identify the issue
//   console.log('Initial data received:', initialData);
//   console.log('Processed data state:', data);

//   // Helper to update the complex nested state immutably
//   const updateNestedState = (path: string, value: any) => {
//     setData(prevData => {
//       const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy
//       const keys = path.split('.');
//       let current = newData;
//       for (let i = 0; i < keys.length - 1; i++) {
//         current = current[keys[i]];
//       }
//       current[keys[keys.length - 1]] = value;
//       return newData;
//     });
//   };

//   const handleSave = () => {
//     const dataToSave = {
//         ...data.availability,
//         last_updated: new Date().toISOString(),
//     };
//     console.log('Saving data:', dataToSave);
//     onSave(dataToSave);
//   };

//   const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

//   // Helper functions for managing the array of time slots for each day
//   const handleAddSlot = (day: string) => {
//     const currentSlots = data.availability.default_working_hours[day] || [];
//     const newSlots = [...currentSlots, { start: '10:00', end: '11:00' }];
//     updateNestedState(`availability.default_working_hours.${day}`, newSlots);
//   };

//   const handleRemoveSlot = (day: string, indexToRemove: number) => {
//     const currentSlots = data.availability.default_working_hours[day] || [];
//     const newSlots = currentSlots.filter((_, index) => index !== indexToRemove);
//     updateNestedState(`availability.default_working_hours.${day}`, newSlots);
//   };
  
//   const handleUpdateSlot = (day: string, indexToUpdate: number, field: 'start' | 'end', value: string) => {
//     const currentSlots = data.availability.default_working_hours[day] || [];
//     const newSlots = currentSlots.map((slot, index) => {
//       if (index === indexToUpdate) {
//         return { ...slot, [field]: value };
//       }
//       return slot;
//     });
//     updateNestedState(`availability.default_working_hours.${day}`, newSlots);
//   };

//   // Safety check to prevent crashing if data is malformed
//   if (!data?.availability?.preferences) {
//     return <div className="p-8 text-center">Loading availability settings...</div>;
//   }

//   return (
//     <div className="flex flex-col h-full">
//         <ScrollArea className="flex-1 pr-6 -mr-6" style={{ maxHeight: 'calc(80vh - 150px)' }}>
//             <div className="space-y-6 pb-6">
//                 {/* Section 1: General Preferences */}
//                 <Card>
//                     <CardHeader>
//                     <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> General</CardTitle>
//                     <CardDescription>Set your main timezone and preferred interview settings.</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                     <div>
//                         <Label>Timezone</Label>
//                         <Input 
//                         value={data.availability.timezone}
//                         onChange={(e) => updateNestedState('availability.timezone', e.target.value)}
//                         placeholder="e.g., Asia/Kolkata"
//                         />
//                     </div>
//                     <div className="grid grid-cols-3 gap-4">
//                         <div>
//                         <Label>Preferred Duration (mins)</Label>
//                         <Input 
//                             type="number"
//                             value={data.availability.preferences.preferred_interview_duration}
//                             onChange={(e) => updateNestedState('availability.preferences.preferred_interview_duration', parseInt(e.target.value))}
//                         />
//                         </div>
//                         <div>
//                         <Label>Max Interviews / Day</Label>
//                         <Input 
//                             type="number"
//                             value={data.availability.preferences.max_interviews_per_day}
//                             onChange={(e) => updateNestedState('availability.preferences.max_interviews_per_day', parseInt(e.target.value))}
//                         />
//                         </div>
//                         <div>
//                         <Label>Min Break (mins)</Label>
//                         <Input 
//                             type="number"
//                             value={data.availability.preferences.min_break_between_interviews}
//                             onChange={(e) => updateNestedState('availability.preferences.min_break_between_interviews', parseInt(e.target.value))}
//                         />
//                         </div>
//                     </div>
//                     </CardContent>
//                 </Card>

//                 {/* Section 2: Weekly Hours with Multiple Slots */}
//                 <Card>
//                     <CardHeader>
//                     <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Weekly Hours</CardTitle>
//                     <CardDescription>Define your working hours. You can add multiple time blocks for any day.</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                     {days.map(day => {
//                         const daySlots = data.availability.default_working_hours[day] || [];
//                         const isEnabled = daySlots.length > 0;

//                         return (
//                         <div key={day} className="p-4 border rounded-lg bg-background/50">
//                             <div className="flex items-center justify-between mb-4">
//                             <div className="flex items-center space-x-3">
//                                 <Switch
//                                 checked={isEnabled}
//                                 onCheckedChange={(checked) => {
//                                     const newHours = checked ? [{ start: '09:00', end: '17:00' }] : [];
//                                     updateNestedState(`availability.default_working_hours.${day}`, newHours);
//                                 }}
//                                 />
//                                 <Label className="capitalize text-md font-medium">{day}</Label>
//                             </div>
//                             </div>

//                             {isEnabled ? (
//                             <div className="space-y-3 pl-8">
//                                 {daySlots.map((slot, index) => (
//                                 <div key={index} className="flex items-center gap-2">
//                                     <Input
//                                     type="time"
//                                     value={slot.start}
//                                     onChange={(e) => handleUpdateSlot(day, index, 'start', e.target.value)}
//                                     className="w-32"
//                                     />
//                                     <span>-</span>
//                                     <Input
//                                     type="time"
//                                     value={slot.end}
//                                     onChange={(e) => handleUpdateSlot(day, index, 'end', e.target.value)}
//                                     className="w-32"
//                                     />
//                                     <Button variant="ghost" size="icon" onClick={() => handleRemoveSlot(day, index)}>
//                                     <Trash2 className="w-4 h-4 text-destructive" />
//                                     </Button>
//                                 </div>
//                                 ))}
//                                 <Button variant="outline" size="sm" onClick={() => handleAddSlot(day)}>
//                                 <Plus className="w-4 h-4 mr-2" />
//                                 Add Time Block
//                                 </Button>
//                             </div>
//                             ) : (
//                             <p className="text-sm text-muted-foreground pl-8">Unavailable</p>
//                             )}
//                         </div>
//                         );
//                     })}
//                     </CardContent>
//                 </Card>
//             </div>
//         </ScrollArea>
        
//         {/* Action Buttons (now outside the scroll area) */}
//         <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button variant="ghost" onClick={onClose}>Cancel</Button>
//             <Button onClick={handleSave}>Save Changes</Button>
//         </div>
//     </div>
//   );
// };



// best 
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { Trash2, Plus, Clock, Globe, Settings2 } from 'lucide-react';
// import { deepMerge } from '@/lib/utils'; // Assumes deepMerge is in your utils file
// import { ScrollArea } from '@/components/ui/scroll-area';

// // Define the shape of the data we expect, based on your JSON
// interface AvailabilityData {
//   availability: {
//     timezone: string;
//     last_updated?: string;
//     default_working_hours: {
//       [key: string]: { start: string; end: string }[];
//     };
//     preferences: {
//       preferred_interview_duration: number;
//       max_interviews_per_day: number;
//       min_break_between_interviews: number;
//       blackout_dates: { start_date: string; end_date: string; reason: string }[];
//     };
//     // Preserve other fields but not make them editable in this UI
//     [key: string]: any;
//   };
// }

// // Define the props for our component
// interface AvailabilityManagerProps {
//   initialData: any | null | undefined;
//   onSave: (updatedData: any) => void;
//   onClose: () => void;
// }

// // A default empty state for when no data is available from the database
// const defaultAvailability: AvailabilityData = {
//   availability: {
//     timezone: 'Asia/Kolkata',
//     default_working_hours: {
//       monday: [{ start: '09:00', end: '17:00' }],
//       tuesday: [{ start: '09:00', end: '17:00' }],
//       wednesday: [{ start: '09:00', end: '17:00' }],
//       thursday: [{ start: '09:00', end: '17:00' }],
//       friday: [{ start: '09:00', end: '17:00' }],
//       saturday: [],
//       sunday: [],
//     },
//     preferences: {
//       preferred_interview_duration: 60,
//       max_interviews_per_day: 4,
//       min_break_between_interviews: 15,
//       blackout_dates: [],
//     },
//     free_slots: [],
//     occupied_slots: [],
//     blocked_slots: [],
//     scheduling_rules: {},
//   },
// };

// export const AvailabilityManager = ({ initialData, onSave, onClose }: AvailabilityManagerProps) => {
//   // Safely initialize state by merging database data with our default structure
//   const [data, setData] = useState<AvailabilityData>(() => {
//     const initial = initialData ? { availability: initialData } : {};
//     return deepMerge(defaultAvailability, initial);
//   });

//   // Helper to update the complex nested state immutably
//   const updateNestedState = (path: string, value: any) => {
//     setData(prevData => {
//       const newData = JSON.parse(JSON.stringify(prevData)); // Deep copy
//       const keys = path.split('.');
//       let current = newData;
//       for (let i = 0; i < keys.length - 1; i++) {
//         current = current[keys[i]];
//       }
//       current[keys[keys.length - 1]] = value;
//       return newData;
//     });
//   };

//   const handleSave = () => {
//     const dataToSave = {
//         ...data.availability,
//         last_updated: new Date().toISOString(),
//     };
//     onSave(dataToSave);
//   };

//   const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

//   // Helper functions for managing the array of time slots for each day
//   const handleAddSlot = (day: string) => {
//     const currentSlots = data.availability.default_working_hours[day] || [];
//     const newSlots = [...currentSlots, { start: '10:00', end: '11:00' }];
//     updateNestedState(`availability.default_working_hours.${day}`, newSlots);
//   };

//   const handleRemoveSlot = (day: string, indexToRemove: number) => {
//     const currentSlots = data.availability.default_working_hours[day] || [];
//     const newSlots = currentSlots.filter((_, index) => index !== indexToRemove);
//     updateNestedState(`availability.default_working_hours.${day}`, newSlots);
//   };
  
//   const handleUpdateSlot = (day: string, indexToUpdate: number, field: 'start' | 'end', value: string) => {
//     const currentSlots = data.availability.default_working_hours[day] || [];
//     const newSlots = currentSlots.map((slot, index) => {
//       if (index === indexToUpdate) {
//         return { ...slot, [field]: value };
//       }
//       return slot;
//     });
//     updateNestedState(`availability.default_working_hours.${day}`, newSlots);
//   };

//   // Safety check to prevent crashing if data is malformed
//   if (!data?.availability?.preferences) {
//     return <div className="p-8 text-center">Loading availability settings...</div>;
//   }

//   return (
//     // --- MODIFIED: The main return is now a flex container ---
//     <div className="flex flex-col h-full">
//         {/* --- NEW: The ScrollArea wraps all the form content --- */}
//         {/* We give it a max height relative to the viewport (vh) and some padding */}
//         <ScrollArea className="flex-1 pr-6 -mr-6" style={{ maxHeight: 'calc(80vh - 150px)' }}>
//             <div className="space-y-6 pb-6">
//                 {/* Section 1: General Preferences */}
//                 <Card>
//                     <CardHeader>
//                     <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> General</CardTitle>
//                     <CardDescription>Set your main timezone and preferred interview settings.</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                     <div>
//                         <Label>Timezone</Label>
//                         <Input 
//                         value={data.availability.timezone}
//                         onChange={(e) => updateNestedState('availability.timezone', e.target.value)}
//                         placeholder="e.g., Asia/Kolkata"
//                         />
//                     </div>
//                     <div className="grid grid-cols-3 gap-4">
//                         <div>
//                         <Label>Preferred Duration (mins)</Label>
//                         <Input 
//                             type="number"
//                             value={data.availability.preferences.preferred_interview_duration}
//                             onChange={(e) => updateNestedState('availability.preferences.preferred_interview_duration', parseInt(e.target.value))}
//                         />
//                         </div>
//                         <div>
//                         <Label>Max Interviews / Day</Label>
//                         <Input 
//                             type="number"
//                             value={data.availability.preferences.max_interviews_per_day}
//                             onChange={(e) => updateNestedState('availability.preferences.max_interviews_per_day', parseInt(e.target.value))}
//                         />
//                         </div>
//                         <div>
//                         <Label>Min Break (mins)</Label>
//                         <Input 
//                             type="number"
//                             value={data.availability.preferences.min_break_between_interviews}
//                             onChange={(e) => updateNestedState('availability.preferences.min_break_between_interviews', parseInt(e.target.value))}
//                         />
//                         </div>
//                     </div>
//                     </CardContent>
//                 </Card>

//                 {/* Section 2: Weekly Hours with Multiple Slots */}
//                 <Card>
//                     <CardHeader>
//                     <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Weekly Hours</CardTitle>
//                     <CardDescription>Define your working hours. You can add multiple time blocks for any day.</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                     {days.map(day => {
//                         const daySlots = data.availability.default_working_hours[day] || [];
//                         const isEnabled = daySlots.length > 0;

//                         return (
//                         <div key={day} className="p-4 border rounded-lg bg-background/50">
//                             <div className="flex items-center justify-between mb-4">
//                             <div className="flex items-center space-x-3">
//                                 <Switch
//                                 checked={isEnabled}
//                                 onCheckedChange={(checked) => {
//                                     const newHours = checked ? [{ start: '09:00', end: '17:00' }] : [];
//                                     updateNestedState(`availability.default_working_hours.${day}`, newHours);
//                                 }}
//                                 />
//                                 <Label className="capitalize text-md font-medium">{day}</Label>
//                             </div>
//                             </div>

//                             {isEnabled ? (
//                             <div className="space-y-3 pl-8">
//                                 {daySlots.map((slot, index) => (
//                                 <div key={index} className="flex items-center gap-2">
//                                     <Input
//                                     type="time"
//                                     value={slot.start}
//                                     onChange={(e) => handleUpdateSlot(day, index, 'start', e.target.value)}
//                                     className="w-32"
//                                     />
//                                     <span>-</span>
//                                     <Input
//                                     type="time"
//                                     value={slot.end}
//                                     onChange={(e) => handleUpdateSlot(day, index, 'end', e.target.value)}
//                                     className="w-32"
//                                     />
//                                     <Button variant="ghost" size="icon" onClick={() => handleRemoveSlot(day, index)}>
//                                     <Trash2 className="w-4 h-4 text-destructive" />
//                                     </Button>
//                                 </div>
//                                 ))}
//                                 <Button variant="outline" size="sm" onClick={() => handleAddSlot(day)}>
//                                 <Plus className="w-4 h-4 mr-2" />
//                                 Add Time Block
//                                 </Button>
//                             </div>
//                             ) : (
//                             <p className="text-sm text-muted-foreground pl-8">Unavailable</p>
//                             )}
//                         </div>
//                         );
//                     })}
//                     </CardContent>
//                 </Card>
//             </div>
//         </ScrollArea>
        
//         {/* Action Buttons (now outside the scroll area) */}
//         <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button variant="ghost" onClick={onClose}>Cancel</Button>
//             <Button onClick={handleSave}>Save Changes</Button>
//         </div>
//     </div>
//   );
// };