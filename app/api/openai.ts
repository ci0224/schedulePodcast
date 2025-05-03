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
  try {
    console.log('Sending request to backend with visits:', visits);
    
    const response = await fetch('http://localhost:8000/api/generate-day-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visits),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Backend error response:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorData?.detail || 'No details available'}`);
    }

    const data = await response.json();
    console.log('Received response from backend:', data);
    return data.summary;
  } catch (error: any) {
    console.error('Error calling backend API:', error);
    throw new Error(`Failed to generate speech text: ${error?.message || 'Unknown error'}`);
  }
} 