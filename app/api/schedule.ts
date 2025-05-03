import scheduleData from '../dummydata/schedule.json';
import doctorsData from '../dummydata/doctors.json';
import visitHistoryData from '../dummydata/visitHistory.json';
import { generateDaySummarySpeech as generateOpenAISpeech } from './openai';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

export interface Visit {
  time: string;
  patient_id: string;
  doctor: string;
  department: string;
  reason: string;
}

export interface ScheduleDay {
  date: string;
  visits: Visit[];
}

export interface SpeechText {
  date: string;
  text: string;
  lastUpdated: string;
}

export function getDoctorList(): Doctor[] {
  return doctorsData.doctors;
}

export function getSchedules(doctorName?: string): ScheduleDay[] {
  if (doctorName) {
    return scheduleData.map(day => ({
      ...day,
      visits: day.visits.filter(visit => visit.doctor === doctorName)
    })).filter(day => day.visits.length > 0);
  }
  return scheduleData;
}

export function getDoctorById(id: number): Doctor | undefined {
  return doctorsData.doctors.find(doctor => doctor.id === id);
}

export function getPatientNameById(patientId: string): string {
  const patient = visitHistoryData.find(p => p.patient_id === patientId);
  return patient ? patient.name : `Patient ${patientId}`;
}

export function isNewPatient(patientId: string): boolean {
  const patient = visitHistoryData.find(p => p.patient_id === patientId);
  return patient ? patient.visits.length === 0 : false;
}

export async function generateDaySummarySpeech(date: string, doctorName: string): Promise<SpeechText> {
  // Get today's schedule
  const daySchedule = getSchedules(doctorName).find(day => day.date === date);
  if (!daySchedule) {
    throw new Error('No schedule found for this date');
  }

  // Get patient details for each visit
  const patientDetails = daySchedule.visits.map(visit => {
    const patient = visitHistoryData.find(p => p.patient_id === visit.patient_id);
    return {
      ...visit,
      patientDetails: patient
    };
  });

  // Generate speech text using OpenAI
  const speechText = await generateOpenAISpeech(patientDetails);

  return {
    date,
    text: speechText,
    lastUpdated: new Date().toISOString()
  };
}

export function getStoredSpeechText(date: string): SpeechText | null {
  try {
    const storedText = localStorage.getItem(`speech_${date}`);
    return storedText ? JSON.parse(storedText) : null;
  } catch {
    return null;
  }
}

export function storeSpeechText(speechText: SpeechText): void {
  localStorage.setItem(`speech_${speechText.date}`, JSON.stringify(speechText));
} 