export interface SelectedCandidate {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  ai_screening_score: number;
  candidates: {
    first_name: string;
    last_name: string;
    email: string;
    experience_years: number;
    expected_salary: number;
    current_location: string;
    skills: string[];
  };
  jobs: {
    title: string;
    location: string;
    salary_min: number;
    salary_max: number;
    currency: string;
  };
  offer_workflow?: {
    id: string;
    status: string;
    current_step: number;
  }[];
}

export interface CandidateWorkflowStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'rejected' | 'pending';
  label: string;
  color: string;
}