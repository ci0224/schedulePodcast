import scheduleData from '../dummydata/schedule.json';
import doctorsData from '../dummydata/doctors.json';
import visitHistoryData from '../dummydata/visitHistory.json';

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