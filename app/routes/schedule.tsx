import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getSchedules, getDoctorById, getPatientNameById, isNewPatient, type ScheduleDay, generateDaySummarySpeech, getStoredSpeechText, storeSpeechText, type SpeechText } from '../api/schedule';
import visitHistoryData from '../dummydata/visitHistory.json';
import SpeakButton from '../components/SpeakButton';
import StyledSpeechText from '../components/StyledSpeechText';

interface PatientInfo {
  patient_id: string;
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
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [selectedSpeech, setSelectedSpeech] = useState<SpeechText | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const currentDoctorId = localStorage.getItem('currentDoctor');
    if (!currentDoctorId) {
      navigate('/login');
      return;
    }

    // Get doctor name from ID
    const doctor = getDoctorById(Number(currentDoctorId));
    if (!doctor) {
      navigate('/login');
      return;
    }

    // Get schedules for the current doctor
    const doctorSchedules = getSchedules(doctor.name);
    setSchedules(doctorSchedules);

    // Set default selected date to today or next available date
    const today = new Date().toISOString().split('T')[0];
    const nextAvailableDate = doctorSchedules.find(schedule => schedule.date >= today)?.date || today;
    setSelectedDate(nextAvailableDate);
  }, [navigate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handlePreviousDay = () => {
    const currentIndex = schedules.findIndex(schedule => schedule.date === selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(schedules[currentIndex - 1].date);
    }
  };

  const handleNextDay = () => {
    const currentIndex = schedules.findIndex(schedule => schedule.date === selectedDate);
    if (currentIndex < schedules.length - 1) {
      setSelectedDate(schedules[currentIndex + 1].date);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentDoctor');
    navigate('/login');
  };

  const handlePatientClick = (patientId: string) => {
    const patient = visitHistoryData.find(p => p.patient_id === patientId);
    if (patient) {
      setSelectedPatient(patient);
    }
  };

  const handleGenerateSpeech = async (date: string) => {
    setIsGeneratingSpeech(true);
    try {
      // Check if we have stored speech text
      const storedSpeech = getStoredSpeechText(date);
      if (storedSpeech) {
        setSelectedSpeech(storedSpeech);
        return;
      }

      // Generate new speech text
      const currentDoctorId = localStorage.getItem('currentDoctor');
      if (!currentDoctorId) {
        throw new Error('No doctor logged in');
      }

      const doctor = getDoctorById(Number(currentDoctorId));
      if (!doctor) {
        throw new Error('Doctor not found');
      }

      const speechText = await generateDaySummarySpeech(date, doctor.name);
      storeSpeechText(speechText);
      setSelectedSpeech(speechText);
    } catch (error) {
      console.error('Error generating speech:', error);
      // TODO: Show error message to user
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleClearSpeechCache = (date: string) => {
    localStorage.removeItem(`speech_${date}`);
    setSelectedSpeech(null);
  };

  const currentDaySchedule = schedules.find(schedule => schedule.date === selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Calendar</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={handlePreviousDay}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Previous Day
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleNextDay}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Next Day
          </button>
        </div>

        <div className="space-y-8">
          {currentDaySchedule && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {new Date(currentDaySchedule.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleGenerateSpeech(currentDaySchedule.date)}
                    disabled={isGeneratingSpeech}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isGeneratingSpeech ? 'Generating...' : 'Generate Speech'}
                  </button>
                  <button
                    onClick={() => handleClearSpeechCache(currentDaySchedule.date)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {currentDaySchedule.visits.map((visit, index) => (
                  <li key={`${currentDaySchedule.date}-${index}`}>
                    <div 
                      className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50"
                      onClick={() => handlePatientClick(visit.patient_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <p className="w-14 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 justify-center">
                            {visit.time}
                          </p>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {getPatientNameById(visit.patient_id)}
                              {isNewPatient(visit.patient_id) && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                            </p>
                            <p className="ml-2 text-sm text-gray-500">
                              {visit.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Patient Info Dialog */}
      {selectedPatient && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Basic Information</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-900">Name: {selectedPatient.name}</p>
                      <p className="text-sm text-gray-900">Age: {selectedPatient.age}</p>
                      <p className="text-sm text-gray-900">Gender: {selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Patient ID: {selectedPatient.patient_id}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Medical Information</h4>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Conditions:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedPatient.conditions.length > 0 ? (
                          selectedPatient.conditions.map((condition, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {condition}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Medications:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedPatient.medications.length > 0 ? (
                          selectedPatient.medications.map((medication, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {medication}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Allergies:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedPatient.allergies.length > 0 ? (
                          selectedPatient.allergies.map((allergy, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {allergy}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Visit History</h4>
                  <div className="mt-2 space-y-4">
                    {selectedPatient.visits.map((visit, index) => (
                      <div key={index} className="border-l-4 border-indigo-400 pl-4">
                        <p className="text-sm font-medium text-gray-900">{new Date(visit.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">{visit.doctor} - {visit.department}</p>
                        <p className="text-sm text-gray-600">Reason: {visit.reason}</p>
                        <div className="mt-1">
                          <p className="text-sm font-medium text-gray-900">Diagnoses:</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {visit.diagnoses.map((diagnosis, idx) => (
                              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {diagnosis}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{visit.visitSummary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speech Text Dialog */}
      {selectedSpeech && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Day Summary Speech</h3>
                <div className="flex items-center space-x-4">
                  <SpeakButton text={selectedSpeech.text} />
                  <button
                    onClick={() => setSelectedSpeech(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <StyledSpeechText 
                text={selectedSpeech.text} 
                visitReasons={currentDaySchedule?.visits.map(visit => visit.reason) || []}
              />
              <p className="text-sm text-gray-500 mt-4">
                Last updated: {new Date(selectedSpeech.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 