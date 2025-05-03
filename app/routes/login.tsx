import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getDoctorList, type Doctor } from '../api/schedule';

export default function Login() {
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const doctorList = getDoctorList();
    setDoctors(doctorList);
  }, []);

  const handleLogin = () => {
    if (selectedDoctor) {
      // In a real app, we would handle authentication here
      localStorage.setItem('currentDoctor', selectedDoctor.toString());
      navigate('/schedule');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Doctor Login
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="doctor-select" className="block text-sm font-medium text-gray-700">
                Select Your Profile
              </label>
              <select
                id="doctor-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedDoctor || ''}
                onChange={(e) => setSelectedDoctor(Number(e.target.value))}
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              onClick={handleLogin}
              disabled={!selectedDoctor}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 