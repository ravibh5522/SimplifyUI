

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DataType } from '../types';
import { getSearchFields } from '../utils';

const ITEMS_PER_PAGE = 10;

export const useCandidateViewData = (
  type: DataType,
  open: boolean
) => {
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setRawData([]);
      return;
    }
    setLoading(true);
    setSearchTerm('');
    setCurrentPage(1);
    setFilterValue(type === 'in-review' ? 'in-review-default' : 'all');

    let promise;
    switch (type) {
      case 'my-applications':
      case 'in-review':
        promise = supabase.rpc('get_my_applications');
        break;
      case 'my-interviews':
        promise = supabase.rpc('get_my_scheduled_interviews');
        break;
      default:
        promise = Promise.resolve({ data: [], error: null });
    }

    promise.then(({ data, error }) => {
      if (error) {
        toast({ title: "Error loading details", description: error.message, variant: "destructive" });
      } else {
        setRawData(data || []);
      }
    }).finally(() => {
      setLoading(false);
    });

  }, [open, type, toast]);

  const filteredData = useMemo(() => {
    let processedData = [...rawData];
    if (filterValue === 'in-review-default') {
      const inReviewStatuses = ['selected', 'screening', 'interview'];
      processedData = processedData.filter(app => inReviewStatuses.includes(app.status));
    } else if (filterValue !== 'all') {
      processedData = processedData.filter(app => app.status === filterValue);
    }
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      processedData = processedData.filter(item => {
        const searchFields = getSearchFields(item, type);
        return searchFields.some(field => field?.toString().toLowerCase().includes(lowercasedSearchTerm));
      });
    }
    return processedData;
  }, [rawData, searchTerm, filterValue]);
  
  useEffect(() => {
    if (!loading) {
      setCurrentPage(1);
    }
  }, [filterValue, searchTerm]);

  const totalItemCount = filteredData.length;
  const totalPages = Math.ceil(totalItemCount / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  return { 
    paginatedData, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    filterValue, 
    setFilterValue,
    currentPage,
    onPageChange: setCurrentPage,
    totalPages,
    totalRecords: totalItemCount
  };
};

// import { useState, useEffect, useMemo } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import { DataType } from '../types';
// import { getSearchFields } from '../utils';

// export const useCandidateViewData = (
//   type: DataType,
//   open: boolean
// ) => {
//   const [rawData, setRawData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterValue, setFilterValue] = useState('all');
//   const { toast } = useToast();

//   useEffect(() => {
//     if (!open) {
//       setRawData([]);
//       return;
//     }
//     setLoading(true);
//     setSearchTerm('');

//     // --- THIS IS THE KEY CHANGE ---
//     // We set the default filter value ONLY when the modal opens for 'in-review'.
//     // The user's subsequent selections will then correctly override this.
//     if (type === 'in-review') {
//       setFilterValue('in-review-default');
//     } else {
//       setFilterValue('all');
//     }

//     let promise;
//     switch (type) {
//       case 'my-applications':
//       case 'in-review':
//         promise = supabase.rpc('get_my_applications');
//         break;
//       case 'my-interviews':
//         promise = supabase.rpc('get_my_scheduled_interviews');
//         break;
//       default:
//         promise = Promise.resolve({ data: [], error: null });
//     }

//     promise.then(({ data, error }) => {
//       if (error) {
//         toast({ title: "Error loading details", description: error.message, variant: "destructive" });
//         setRawData([]);
//       } else {
//         setRawData(data || []);
//       }
//     }).finally(() => {
//       setLoading(false);
//     });

//   }, [open, type, toast]);


//   const filteredData = useMemo(() => {
//     let processedData = [...rawData];

//     // --- THIS IS THE CORRECTED LOGIC PIPELINE ---

//     // Step 1: Apply the main status filter
//     if (filterValue === 'in-review-default') {
//       // This is the default state for the "In Review" modal
//       const inReviewStatuses = ['applied', 'screening', 'interview'];
//       processedData = processedData.filter(app => inReviewStatuses.includes(app.status));
//     } else if (filterValue !== 'all') {
//       // This handles any user selection from the dropdown (e.g., 'applied', 'rejected')
//       processedData = processedData.filter(app => app.status === filterValue);
//     }
//     // If filterValue is 'all', we do nothing and show all rawData.

//     // Step 2: Apply the search term on the already-filtered data
//     if (searchTerm) {
//       const lowercasedSearchTerm = searchTerm.toLowerCase();
//       processedData = processedData.filter(item => {
//         const searchFields = getSearchFields(item, type);
//         return searchFields.some(field => field?.toString().toLowerCase().includes(lowercasedSearchTerm));
//       });
//     }

//     return processedData;
//   }, [rawData, searchTerm, filterValue]); // The `type` dependency was removed as it's not needed here

//   return { filteredData, loading, searchTerm, setSearchTerm, filterValue, setFilterValue };
// };



