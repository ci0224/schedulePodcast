import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getSchedules, getDoctorById, getPatientNameById, isNewPatient, type ScheduleDay } from '../api/schedule';

export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleDay[]>([]);
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentDoctor');
    navigate('/login');
  };

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

        <div className="space-y-8">
          {schedules.map((day) => (
            <div key={day.date} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {day.visits.map((visit, index) => (
                  <li key={`${day.date}-${index}`}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
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
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {visit.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 