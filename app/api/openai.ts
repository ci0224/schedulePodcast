import OpenAI from 'openai';

// Get API key from window.env or fallback to a default value
const getApiKey = () => {
  // @ts-ignore - window.env is injected by the server
  return window.env?.OPENAI_API_KEY || '';
};

const openai = new OpenAI({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true // Required for browser usage
});

interface PatientVisit {
  time: string;
  patient_id: string;
  doctor: string;
  department: string;
  reason: string;
  patientDetails?: {
    name: string;
    age: number;
    gender: string;
    conditions: string[];
    medications: string[];
    allergies: string[];
    visits: {
      date: string;
      doctor: string;
      department: string;
      reason: string;
      diagnoses: string[];
      visitSummary: string;
    }[];
  };
}

export async function generateDaySummarySpeech(visits: PatientVisit[]): Promise<string> {
  const prompt = `As a medical assistant, generate a concise morning briefing for a doctor about their day's schedule. 
Include relevant patient history and important medical information. Be professional but conversational.

Today's schedule:
${visits.map(visit => `
Time: ${visit.time}
Patient: ${visit.patientDetails?.name || 'New Patient'}
Reason: ${visit.reason}
${visit.patientDetails ? `
Medical History:
- Age: ${visit.patientDetails.age}
- Gender: ${visit.patientDetails.gender}
- Conditions: ${visit.patientDetails.conditions.join(', ') || 'None'}
- Medications: ${visit.patientDetails.medications.join(', ') || 'None'}
- Allergies: ${visit.patientDetails.allergies.join(', ') || 'None'}
- Last Visit: ${visit.patientDetails.visits[visit.patientDetails.visits.length - 1]?.visitSummary || 'No previous visits'}
` : 'New patient, no medical history available'}
`).join('\n')}

Please provide a natural, conversational summary that the doctor can listen to while preparing for their day.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical assistant providing a morning briefing to a doctor about their day's schedule. Be concise, professional, and highlight important medical information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 5000,
    });

    return completion.choices[0].message.content || 'Unable to generate speech text.';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate speech text');
  }
} 