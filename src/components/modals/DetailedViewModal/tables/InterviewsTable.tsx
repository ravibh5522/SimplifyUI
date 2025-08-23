import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from '../constants'; // Assuming constants file is in the parent dir

const getStatusBadge = (status: string) => {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS['default'];
  return <Badge className={colorClass}>{status}</Badge>;
};

export const InterviewsTable = ({ data }: { data: any[] }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Candidate</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Scheduled At</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          // Safely access nested data
          const profile = item.job_applications?.candidates?.profiles;
          const job = item.job_applications?.jobs;
          const company = job?.companies;
          
          return (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">{profile?.first_name} {profile?.last_name}</div>
                <div className="text-sm text-muted-foreground">{profile?.email}</div>
              </TableCell>
              <TableCell>{job?.title}</TableCell>
              <TableCell>{company?.name}</TableCell>
              <TableCell>{new Date(item.scheduled_at).toLocaleString()}</TableCell>
              <TableCell>{item.interview_type}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};