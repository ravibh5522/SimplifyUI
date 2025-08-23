import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from 'lucide-react';

// Define a simple, local type for the options.
interface FilterOption {
  value: string;
  label: string;
}

interface CandidateFilterControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  // This is the key: it receives the options directly. It is optional.
  filterOptions?: FilterOption[];
}

export const CandidateFilterControls = ({
  searchTerm,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions
}: CandidateFilterControlsProps) => {
  return (
    <div className="flex items-center space-x-4 p-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* If and only if filterOptions are provided, render the dropdown. */}
      {filterOptions && (
        <Select value={filterValue} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {filterOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};