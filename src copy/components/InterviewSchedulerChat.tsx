// import { useState, useEffect, useRef } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/hooks/useAuth';
// import { 
//   Bot, 
//   Send, 
//   Calendar, 
//   Clock, 
//   User, 
//   MessageSquare,
//   Loader2,
//   CalendarCheck,
//   Briefcase
// } from 'lucide-react';

// interface InterviewSchedulerChatProps {
//   jobId: string;
//   applicationId: string;
//   trigger?: React.ReactNode;
// }

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
//   functionCall?: {
//     name: string;
//     arguments: any;
//     result: string;
//   };
// }

// const InterviewSchedulerChat = ({ jobId, applicationId, trigger }: InterviewSchedulerChatProps) => {
//   const { toast } = useToast();
//   const { profile } = useAuth();
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [jobData, setJobData] = useState<any>(null);
//   const [applicationData, setApplicationData] = useState<any>(null);

//   useEffect(() => {
//     if (open) {
//       fetchInitialData();
//     }
//   }, [open]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const fetchInitialData = async () => {
//     try {
//       // Get job details
//       const { data: job } = await supabase
//         .from('jobs')
//         .select(`
//           *,
//           companies (name, industry),
//           interview_rounds (*)
//         `)
//         .eq('id', jobId)
//         .single();

//       // Get application details
//       const { data: application } = await supabase
//         .from('job_applications')
//         .select(`
//           *,
//           candidates (first_name, last_name, email, phone)
//         `)
//         .eq('id', applicationId)
//         .single();

//       setJobData(job);
//       setApplicationData(application);

//       // Add initial greeting message
//       if (messages.length === 0) {
//         const greetingMessage: Message = {
//           id: 'greeting',
//           role: 'assistant',
//           content: `Hello! I'm your AI interview scheduling assistant. I can help you schedule interviews for ${application?.candidates?.first_name} ${application?.candidates?.last_name} for the ${job?.title} position at ${job?.companies?.name}.

// What would you like to do today?
// • Schedule an interview
// • Check availability
// • Send calendar invites
// • View interview rounds
// • Get interview preparation info`,
//           timestamp: new Date()
//         };
//         setMessages([greetingMessage]);
//       }
//     } catch (error) {
//       console.error('Error fetching initial data:', error);
//       toast({
//         title: "Error",
//         description: "Failed to load interview data",
//         variant: "destructive",
//       });
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const sendMessage = async () => {
//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: 'user',
//       content: inputMessage,
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     const messageToSend = inputMessage;
//     setInputMessage('');
//     setIsLoading(true);

//     let retryCount = 0;
//     const maxRetries = 3;

//     while (retryCount < maxRetries) {
//       try {
//         console.log(`Sending interview scheduler message (attempt ${retryCount + 1}/${maxRetries}):`, messageToSend);

//         const { data, error } = await supabase.functions.invoke('interview-scheduler-chat', {
//           body: {
//             message: messageToSend,
//             jobId,
//             applicationId,
//             context: messages.map(m => `${m.role}: ${m.content}`).join('\n')
//           }
//         });

//         if (error) {
//           console.error('Supabase function error:', error);
//           throw error;
//         }

//         console.log('Interview scheduler response received:', data);

//         const assistantMessage: Message = {
//           id: (Date.now() + 1).toString(),
//           role: 'assistant',
//           content: data.reply,
//           timestamp: new Date(),
//           functionCall: data.functionCall
//         };

//         setMessages(prev => [...prev, assistantMessage]);

//         // Show success toast for function calls
//         if (data.functionCall) {
//           toast({
//             title: "Action Completed",
//             description: data.functionCall.result,
//           });
//         }

//         // Success - break out of retry loop
//         break;

//       } catch (error: any) {
//         console.error(`Error sending interview scheduler message (attempt ${retryCount + 1}):`, error);
//         retryCount++;

//         if (retryCount < maxRetries) {
//           console.log(`Retrying in ${retryCount * 1000}ms...`);
//           await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
//         } else {
//           // Final attempt failed
//           const errorMessage: Message = {
//             id: (Date.now() + 1).toString(),
//             role: 'assistant',
//             content: 'I apologize, but I\'m experiencing technical difficulties with the interview scheduling system. Please try your request again.',
//             timestamp: new Date()
//           };
//           setMessages(prev => [...prev, errorMessage]);
          
//           toast({
//             title: "Connection Issue",
//             description: "Unable to connect to interview scheduler. Please try again.",
//             variant: "destructive",
//           });
//         }
//       }
//     }

//     setIsLoading(false);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const defaultTrigger = (
//     <Button variant="outline" size="sm">
//       <Calendar className="w-4 h-4 mr-2" />
//       Schedule Interview
//     </Button>
//   );

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         {trigger || defaultTrigger}
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Bot className="w-5 h-5 text-primary" />
//             Interview Scheduler AI
//           </DialogTitle>
//           <DialogDescription>
//             Schedule and manage interviews with AI assistance
//           </DialogDescription>
//         </DialogHeader>

//         {/* Job & Candidate Info */}
//         {jobData && applicationData && (
//           <Card className="mb-4">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-sm font-medium">Interview Details</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <div className="flex items-center gap-2 text-sm">
//                 <User className="w-4 h-4" />
//                 <span className="font-medium">
//                   {applicationData.candidates?.first_name} {applicationData.candidates?.last_name}
//                 </span>
//                 <span className="text-muted-foreground">
//                   ({applicationData.candidates?.email})
//                 </span>
//               </div>
//               <div className="flex items-center gap-2 text-sm">
//                 <Briefcase className="w-4 h-4" />
//                 <span>{jobData.title} at {jobData.companies?.name}</span>
//               </div>
//               <div className="flex gap-2">
//                 {jobData.interview_rounds?.map((round: any) => (
//                   <Badge key={round.id} variant="outline" className="text-xs">
//                     Round {round.round_number}: {round.round_type}
//                   </Badge>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Messages */}
//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-4">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[80%] rounded-lg px-4 py-2 ${
//                     message.role === 'user'
//                       ? 'bg-primary text-primary-foreground'
//                       : 'bg-muted text-muted-foreground'
//                   }`}
//                 >
//                   <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  
//                   {message.functionCall && (
//                     <div className="mt-2 pt-2 border-t border-border/20">
//                       <div className="flex items-center gap-2 text-xs">
//                         <CalendarCheck className="w-3 h-3" />
//                         <span className="font-medium">Action: {message.functionCall.name}</span>
//                       </div>
//                       <div className="text-xs mt-1 opacity-80">
//                         {message.functionCall.result}
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="text-xs mt-1 opacity-60">
//                     {message.timestamp.toLocaleTimeString()}
//                   </div>
//                 </div>
//               </div>
//             ))}
            
//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
//                   <div className="flex items-center gap-2">
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     <span className="text-sm">Thinking...</span>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             <div ref={messagesEndRef} />
//           </div>
//         </ScrollArea>

//         {/* Input */}
//         <div className="border-t pt-4">
//           <div className="flex gap-2">
//             <Input
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Type your message... (e.g., 'Schedule interview for next Tuesday at 2 PM')"
//               disabled={isLoading}
//               className="flex-1"
//             />
//             <Button
//               onClick={sendMessage}
//               disabled={isLoading || !inputMessage.trim()}
//               size="sm"
//             >
//               <Send className="w-4 h-4" />
//             </Button>
//           </div>
//           <div className="text-xs text-muted-foreground mt-2">
//             I can help you schedule interviews, check availability, send calendar invites, and more.
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default InterviewSchedulerChat;
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Bot, Send, Calendar, User, Briefcase, Loader2, CalendarCheck
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// --- MODIFIED: Props changed to be job-centric ---
interface InterviewSchedulerChatProps {
  jobId: string;
  trigger?: React.ReactNode;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCall?: { name: string; arguments: any; result: string; };
}

const InterviewSchedulerChat = ({ jobId, trigger }: InterviewSchedulerChatProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for the new, improved flow
  const [jobData, setJobData] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    // Reset component state every time the modal is opened for a new job
    if (open) {
      setMessages([]);
      setSelectedApplicationId(null);
      setApplicants([]);
      fetchInitialData();
    }
  }, [open, jobId]);

  useEffect(() => {
    // Automatically scroll to the bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // This effect generates the initial greeting message once a candidate is selected
  useEffect(() => {
    if (selectedApplicationId && jobData && applicants.length > 0) {
      const selectedApplicant = applicants.find(app => app.id === selectedApplicationId);
      if (selectedApplicant && messages.length === 0) { // Only show the greeting once
        const greetingMessage: Message = {
          id: 'greeting',
          role: 'assistant',
          timestamp: new Date(),
          content: `Hello! I'm ready to schedule an interview for **${selectedApplicant.candidates.profiles.first_name} ${selectedApplicant.candidates.profiles.last_name}** for the **${jobData.title}** position.

What would you like to do?
*   Schedule an interview
*   Check availability
*   Send calendar invites`,
        };
        setMessages([greetingMessage]);
      }
    }
  }, [selectedApplicationId, jobData, applicants]);


  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch job title and company name
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select(`title, companies (name)`)
        .eq('id', jobId)
        .single();
      if (jobError) throw jobError;
      setJobData(job);

      // Fetch all applicants for this specific job
      const { data: applications, error: appsError } = await supabase
        .from('job_applications')
        .select(`id, candidates ( profiles ( first_name, last_name, email ) )`)
        .eq('job_id', jobId)
        .in('status', ['applied', 'screening', 'interview']); // Filter for relevant candidates
        
      if (appsError) throw appsError;
      setApplicants(applications || []);

    } catch (error: any) {
      console.error('Error fetching initial scheduler data:', error);
      toast({ title: "Error", description: "Failed to load job data and applicants.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    // This initial check is correct and includes our new selectedApplicationId
    if (!inputMessage.trim() || isLoading || !selectedApplicationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    const messageToSend = inputMessage; // We can remove this variable, but keeping for clarity
    setInputMessage('');
    setIsLoading(true);

    try {
      // --- THIS IS THE CORRECTED BLOCK, USING `fetch` FROM YOUR OLD UI ---
      
      // 1. Define the API endpoint
      const apiUrl = import.meta.env.VITE_SCHEDULER_API_URL || 'http://ai-schedular.sslip.io/interview-scheduler-chat';
      
      // 2. Get the user's authentication token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

      // 3. Prepare the data to send (the payload)
      const payload = {
        history: newMessages.map(msg => ({ role: msg.role, content: msg.content })),
        jobId: jobId,
        applicationId: selectedApplicationId, // Use the ID from the dropdown state
      };

       // --- THIS IS THE NEW LINE TO LOG THE PAYLOAD ---
      console.log("SENDING PAYLOAD TO AI BACKEND:", payload);
      // ------------------------------------------------

      
      // 4. Execute the API call using `fetch`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'An unknown API error occurred');
      }
      
      // 5. Process the response from the AI
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        functionCall: data.functionCall
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.functionCall) {
        toast({
          title: "Action Completed",
          description: `AI Action: ${data.functionCall.name}`,
        });
      }
      // --- END OF CORRECTED BLOCK ---

    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to communicate with the AI assistant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Calendar className="w-4 h-4 mr-2" />
      Schedule Interview
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> AI Interview Scheduler
          </DialogTitle>
          <DialogDescription>
            Select a candidate to begin scheduling with AI assistance.
          </DialogDescription>
        </DialogHeader>

        {/* --- UI BLOCK FOR CANDIDATE SELECTION --- */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-md">Scheduling for: <span className="text-primary">{jobData?.title || 'Loading...'}</span></CardTitle>
            </CardHeader>
            <CardContent>
                <Label htmlFor="candidate-select">Step 1: Choose a Candidate</Label>
                <Select
                    value={selectedApplicationId || ""}
                    onValueChange={(value) => {
                        setMessages([]); // Clear chat when switching candidates
                        setSelectedApplicationId(value);
                    }}
                    disabled={applicants.length === 0 || isLoading}
                >
                    <SelectTrigger id="candidate-select">
                        <SelectValue placeholder={isLoading ? "Loading applicants..." : (applicants.length === 0 ? "No eligible applicants found" : "Select an applicant to begin")} />
                    </SelectTrigger>
                    <SelectContent>
                        {applicants.map((app) => (
                            <SelectItem key={app.id} value={app.id}>
                                {app.candidates.profiles.first_name} {app.candidates.profiles.last_name} ({app.candidates.profiles.email})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

        {/* --- MESSAGES AREA --- */}
        <ScrollArea className="flex-1 px-4 border rounded-md my-2">
            <div className="space-y-4 py-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                            {message.functionCall && (
                                <div className="mt-2 pt-2 border-t border-border/20">
                                    <div className="flex items-center gap-2 text-xs font-semibold"><CalendarCheck className="w-3 h-3" /> Action: {message.functionCall.name}</div>
                                    <div className="text-xs mt-1 opacity-80">{message.functionCall.result}</div>
                                </div>
                            )}
                            <div className="text-xs mt-1 opacity-60 text-right">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    </div>
                ))}
                {isLoading && messages.length > 0 && ( // Show "Thinking..." only after the first message
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2"><Loader2 className="w-4 h-4 animate-spin" /></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>

        {/* --- INPUT AREA --- */}
        <div className="border-t pt-4">
            <div className="flex gap-2">
                <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedApplicationId ? "Type your command..." : "Please select a candidate above to enable chat"}
                    disabled={isLoading || !selectedApplicationId}
                    className="flex-1"
                />
                <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim() || !selectedApplicationId}
                    size="sm"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSchedulerChat;