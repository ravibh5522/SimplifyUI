import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCandidateViewData } from '../DetailedViewModal/hooks/useCandidateViewData';
import { TableRenderer } from '../DetailedViewModal/components/TableRenderer';
import { LoadingState } from '../DetailedViewModal/components/LoadingState';
import { CandidateFilterControls } from './components/CandidateFilterControls';
import { DataType } from '../DetailedViewModal/types';
import { useMemo } from 'react';
import { PaginationControls } from "@/components/ui/PaginationControls";
// import { useCandidateViewData } from '../DetailedViewModal/hooks/useCandidateViewData'; 
// import { useCandidateViewData } from "@/components/modals/DetailedViewModal/hooks/useCandidateViewData";
// --- DEFINE YOUR FILTER LISTS HERE ---
const allApplicationStatuses = [
    { value: 'applied', label: 'Applied' },
    { value: 'screening', label: 'Screening' },
    { value: 'interview', label: 'Interview' },
    { value: 'selected', label: 'Selected' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'offer', label: 'Offer' },
];

const inReviewStatusesOnly = [
    { value: 'selected', label: 'Selected' },
    { value: 'screening', label: 'Screening' },
    { value: 'interview', label: 'Interview' },
];

const interviewFilterOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'no_show', label: 'No Show' },
];

export const CandidateDetailModal = ({ type, open, onOpenChange, title }: any) => {
  const {
     paginatedData,
    loading,
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    currentPage,
    totalPages,
    onPageChange,
    totalRecords
  } = useCandidateViewData(type, open);

  // --- THIS LOGIC CHOOSES THE CORRECT LIST ---
  const modalFilterOptions = useMemo(() => {
    if (type === 'my-applications') {
      return allApplicationStatuses;
    }
    if (type === 'in-review') {
      // Use the new, limited list for this specific modal
      return inReviewStatusesOnly;
    }
    if (type === 'my-interviews') {
      return interviewFilterOptions;
    }
    return undefined;
  }, [type]);

  // --- THIS LOGIC FIXES THE BLANK DROPDOWN ---
  // If the filter is in its default state, tell the UI to show 'All Statuses'
  const displayFilterValue = filterValue === 'in-review-default' ? 'all' : filterValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Total records: {totalRecords}
          </DialogDescription>
        </DialogHeader>
        
        <CandidateFilterControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          // Use the display value here
          filterValue={displayFilterValue}
          onFilterChange={setFilterValue}
          filterOptions={modalFilterOptions}
        />

        <div className="border rounded-lg overflow-auto max-h-[60vh]">
          <LoadingState loading={loading} hasData={paginatedData.length > 0}>
            <TableRenderer 
              type={type} 
              data={paginatedData}
            />
          </LoadingState>
        </div>
         {/* --- 3. RENDER THE PAGINATION CONTROLS AT THE BOTTOM --- */}
        <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
        />

      </DialogContent>
    </Dialog>
  );
};

// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { useCandidateViewData } from '../DetailedViewModal/hooks/useCandidateViewData';
// import { TableRenderer } from '../DetailedViewModal/components/TableRenderer';
// import { LoadingState } from '../DetailedViewModal/components/LoadingState';
// // import { FilterControls } from '../DetailedViewModal/components/FilterControls';
// import { CandidateFilterControls } from "./components/CandidateFilterControls";
// import { DataType } from '../DetailedViewModal/types';
// import { useMemo } from 'react'; // <-- Ensure useMemo is imported

// // --- 1. DEFINE ALL YOUR FILTER OPTIONS HERE ---
// const applicationFilterOptions = [
//     { value: 'applied', label: 'Applied' },
//     { value: 'screening', label: 'Screening' },
//     { value: 'interview', label: 'Interview' },
//     { value: 'selected', label: 'Selected' },
//     { value: 'rejected', label: 'Rejected' },
// ];

// // Add the options for the interviews modal
// const interviewFilterOptions = [
//     { value: 'scheduled', label: 'Scheduled' },
//     { value: 'in_progress', label: 'In Progress' },
//     { value: 'completed', label: 'Completed' },
//     { value: 'cancelled', label: 'Cancelled' },
//     { value: 'no_show', label: 'No Show' },
// ];

// export interface CandidateDetailModalProps {
//   type: DataType;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   title: string;
// }

// export const CandidateDetailModal = ({ type, open, onOpenChange, title }: CandidateDetailModalProps) => {
//   const {
//     filteredData,
//     loading,
//     searchTerm,
//     setSearchTerm,
//     filterValue,
//     setFilterValue
//   } = useCandidateViewData(type, open);

//   // --- 2. USE `useMemo` TO CHOOSE THE CORRECT OPTIONS ---
//   // This is a clean and efficient way to select the right filters for the current modal type.
//   const modalFilterOptions = useMemo(() => {
//     if (type === 'my-applications' || type === 'in-review') {
//       return applicationFilterOptions;
//     }
//     if (type === 'my-interviews') {
//       return interviewFilterOptions;
//     }
//     return undefined; // No filter dropdown for other types
//   }, [type]);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//           <DialogDescription>
//             Total records: {filteredData.length}
//           </DialogDescription>
//         </DialogHeader>
        
//         {/* --- 3. PASS THE CORRECT PROPS TO FILTERCONTROLS --- */}
//          <CandidateFilterControls
//           searchTerm={searchTerm}
//           onSearchChange={setSearchTerm}
//           filterValue={filterValue}
//           onFilterChange={setFilterValue}
//           filterOptions={modalFilterOptions}
//         />


//         <div className="border rounded-lg overflow-auto max-h-[60vh]">
//           <LoadingState loading={loading} hasData={filteredData.length > 0}>
//             <TableRenderer 
//               type={type} 
//               data={filteredData}
//             />
//           </LoadingState>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };


// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// // IMPORTANT: Use the correct hook path from Step 1
// import { useCandidateViewData } from '../DetailedViewModal/hooks/useCandidateViewData'; 
// // We can re-use the components from the other modal if they are generic enough.
// import { TableRenderer } from '../DetailedViewModal/components/TableRenderer';
// import { LoadingState } from '../DetailedViewModal/components/LoadingState';
// import { FilterControls } from '../DetailedViewModal/components/FilterControls';
// import { DataType } from '../DetailedViewModal/types';


// const applicationFilterOptions = [
//     { value: 'applied', label: 'Applied' },
//     { value: 'screening', label: 'Screening' },
//     { value: 'interview', label: 'Interview' },
//     { value: 'selected', label: 'Selected' },
//     { value: 'rejected', label: 'Rejected' },
// ];

// export interface CandidateDetailModalProps {
//   type: DataType;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   title: string;
// }

// export const CandidateDetailModal = ({ type, open, onOpenChange, title }: CandidateDetailModalProps) => {
//   // This modal ONLY uses the safe, dedicated candidate hook.
//   const {
//     filteredData,
//     loading,
//     searchTerm,
//     setSearchTerm,
//      filterValue,
//     setFilterValue
//   } = useCandidateViewData(type, open);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//           <DialogDescription>
//             Total records: {filteredData.length}
//           </DialogDescription>
//         </DialogHeader>
        
//         <FilterControls
//           searchTerm={searchTerm}
//           onSearchChange={setSearchTerm}
//            filterValue={filterValue}
//           onFilterChange={setFilterValue}
//           // Only show the dropdown for application modals
//           filterOptions={type.includes('application') ? applicationFilterOptions : undefined}
//           // Note: Add any other props your FilterControls component needs
//         />

//         <div className="border rounded-lg overflow-auto max-h-[60vh]">
//           <LoadingState loading={loading} hasData={filteredData.length > 0}>
//             <TableRenderer 
//               type={type} 
//               data={filteredData}
//             />
//           </LoadingState>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };