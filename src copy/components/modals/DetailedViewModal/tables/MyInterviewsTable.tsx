import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from '../constants';

const getStatusBadge = (status: string) => {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS['default'];
  return <Badge className={colorClass}>{status}</Badge>;
};

export const MyInterviewsTable = ({ data }: { data: any[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Scheduled At</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.interview_id}>
            <TableCell>{item.job_title}</TableCell>
            <TableCell>{item.company_name}</TableCell>
            <TableCell>{new Date(item.scheduled_at).toLocaleString()}</TableCell>
            <TableCell>{item.interview_type}</TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};