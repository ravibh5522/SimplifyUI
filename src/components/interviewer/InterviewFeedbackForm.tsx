// src/components/interviewer/InterviewFeedbackForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface InterviewFeedbackFormProps {
  interviewId: string;
  onFeedbackSubmitted: () => void; // A function to close the modal and refresh the list
}

export const InterviewFeedbackForm = ({ interviewId, onFeedbackSubmitted }: InterviewFeedbackFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    interviewer_score: 50, // Default score
    feedback: 'Hire', // Default recommendation
    strengths: '',
    weaknesses: '',
    notes: ''
  });

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const { error } = await supabase
  //       .from('interview_participants')
  //       .update({
  //         interviewer_score: formData.interviewer_score,
  //         feedback: formData.feedback,
  //         // We store strengths and weaknesses in the JSONB column
  //         strengths: { notes: formData.strengths }, 
  //         weaknesses: { notes: formData.weaknesses },
  //         notes: formData.notes,
  //         status: 'completed' // Critically, we update the status
  //       })
  //       .eq('id', interviewId);

  //     if (error) throw error;

  //     toast({
  //       title: "Feedback Submitted",
  //       description: "Your evaluation has been successfully recorded.",
  //     });

  //     onFeedbackSubmitted(); // Trigger the parent component to close/refresh

  //   } catch (error: any) {
  //     toast({
  //       title: "Submission Error",
  //       description: `Failed to submit feedback: ${error.message}`,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // In src/components/interviewer/InterviewFeedbackForm.tsx

  // In src/components/interviewer/InterviewFeedbackForm.tsx

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- START: CORRECTED RPC LOGIC ---
      // 1. Call our new, secure database function with the required parameters.
      const { error } = await supabase.rpc('submit_interviewer_feedback', {
        schedule_id: interviewId,
        scores: {
          overall_score: formData.interviewer_score,
          recommendation: formData.feedback,
          strengths: formData.strengths,
          weaknesses: formData.weaknesses
        },
        notes: {
          private_notes: formData.notes
        },
        new_status: 'completed'
      });
      // --- END: CORRECTED RPC LOGIC ---

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Your evaluation has been successfully recorded.",
      });

      onFeedbackSubmitted();

    } catch (error: any) {
      toast({
        title: "Submission Error",
        description: `Failed to submit feedback: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
};


// const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // --- START: CORRECTED SUBMISSION LOGIC ---
//       // 1. We structure the data to match the JSONB columns in the new table.
//       const feedbackPayload = {
//         // 'interviewer_scores' is a JSONB column that can hold structured data.
//         interviewer_scores: {
//           overall_score: formData.interviewer_score,
//           recommendation: formData.feedback,
//           strengths: formData.strengths,
//           weaknesses: formData.weaknesses
//         },
//         // 'interviewer_notes' is another JSONB column for private notes.
//         interviewer_notes: {
//           private_notes: formData.notes
//         },
//         // 2. We also update the status of the interview schedule itself.
//         status: 'completed'
//       };

//       // 3. We update the correct 'interview_schedules' table.
//       const { error } = await supabase
//         .from('interview_schedules')
//         .update(feedbackPayload)
//         .eq('id', interviewId);

//       // --- END: CORRECTED SUBMISSION LOGIC ---

//       if (error) throw error;

//       toast({
//         title: "Feedback Submitted",
//         description: "Your evaluation has been successfully recorded.",
//       });

//       onFeedbackSubmitted(); // This correctly closes the modal

//     } catch (error: any) {
//       toast({
//         title: "Submission Error",
//         description: `Failed to submit feedback: ${error.message}`,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
// };
  
return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
      <h3 className="font-semibold text-lg text-center">Submit Your Feedback</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interviewer_score">Overall Score (0-100)</Label>
          <Input 
            id="interviewer_score"
            type="number"
            min="0"
            max="100"
            value={formData.interviewer_score}
            onChange={(e) => setFormData({ ...formData, interviewer_score: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback">Recommendation</Label>
          <Select value={formData.feedback} onValueChange={(value) => setFormData({ ...formData, feedback: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a recommendation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Strong Hire">Strong Hire</SelectItem>
              <SelectItem value="Hire">Hire</SelectItem>
              <SelectItem value="Hire with Reservations">Hire with Reservations</SelectItem>
              <SelectItem value="No Hire">No Hire</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="strengths">Key Strengths</Label>
        <Textarea 
          id="strengths"
          placeholder="What were the candidate's main strengths?"
          value={formData.strengths}
          onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weaknesses">Areas for Improvement</Label>
        <Textarea 
          id="weaknesses"
          placeholder="Were there any areas of concern or weakness?"
          value={formData.weaknesses}
          onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Private Notes (Optional)</Label>
        <Textarea 
          id="notes"
          placeholder="Internal notes, visible only to the hiring team."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
          {!loading && <CheckCircle className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </form>
  );
};