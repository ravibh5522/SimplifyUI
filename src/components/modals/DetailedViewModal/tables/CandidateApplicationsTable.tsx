import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, getStatusColor } from '../utils'; // Assuming these utils are in the right place

// This is a simple prop type for this specific table
interface CandidateApplication {
  id: string;
  status: string;
  applied_at: string;
  jobs: {
    title: string;
    companies?: {
      name: string;
  };
  };
}

interface CandidateApplicationsTableProps {
  data: CandidateApplication[];
}

export const CandidateApplicationsTable = ({ data }: CandidateApplicationsTableProps) => {
  // If there's no data, don't render anything (the LoadingState component handles "No data found")
  if (!data) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Applied On</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((application) => (
          // The key prop is essential for React
          <TableRow key={application.id}>
            {/* We are using the exact data structure from your console logs */}
            <TableCell className="font-medium">{application.jobs?.title}</TableCell>
            <TableCell>{application.jobs?.companies?.name}</TableCell>
            <TableCell>{formatDate(application.applied_at)}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};