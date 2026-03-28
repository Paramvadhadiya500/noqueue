"use client";

import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth'; 
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure({
  Auth: { Cognito: { userPoolId: 'ap-south-1_p039t5AGU', userPoolClientId: '2c9mnkobjqfj0rk0b2dlc1tqvn' } }
});

const formFields = {
  signUp: { name: { order: 1, label: 'Full Name', placeholder: 'Enter your full name', isRequired: true }, username: { order: 2 }, password: { order: 3 }, confirm_password: { order: 4 } },
};

const allTimeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];

const getTodayDateString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
};

const isSlotInPast = (slotTimeStr: string, selectedDateStr: string) => {
  const todayStr = getTodayDateString();
  if (selectedDateStr < todayStr) return true;
  if (selectedDateStr > todayStr) return false;
  const now = new Date();
  const [time, modifier] = slotTimeStr.split(' ');
  let [hours, minutes] = time.split(':');
  let parsedHours = parseInt(hours, 10);
  if (parsedHours === 12 && modifier === 'AM') parsedHours = 0;
  if (parsedHours < 12 && modifier === 'PM') parsedHours += 12;
  const slotTime = new Date();
  slotTime.setHours(parsedHours, parseInt(minutes, 10), 0, 0);
  return slotTime < now;
};

// ==========================================
// DASHBOARD COMPONENT
// ==========================================
function DashboardApp({ signOut }: { signOut: any }) {

  
const [myTicket, setMyTicket] = useState<{name: string, department: string} | null>(null);
  // NEW: Holds the real-time calculated doctor speed!
  const [realAvgConsultTime, setRealAvgConsultTime] = useState(12);  const [patients, setPatients] = useState<any[]>([]);
  const [appointmentList, setAppointmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  
  const [viewMode, setViewMode] = useState<"Live" | "History" | "Book" | "Appointments">("Live");
  const [selectedDept, setSelectedDept] = useState("General");
  const [searchTerm, setSearchTerm] = useState("");

  const [bookingDate, setBookingDate] = useState("");
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showSlots, setShowSlots] = useState(false);

  const [treatingPatient, setTreatingPatient] = useState<any | null>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: "",
    medicines: [{ name: "", dosage: "", duration: "" }]
  });

  // --- NEW: EMR TIMELINE STATE ---
  const [patientTimeline, setPatientTimeline] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', age: '', address: '', symptoms: '', isEmergency: false });
  const todayDateString = getTodayDateString();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { tokens } = await fetchAuthSession(); 
        const accessGroups = (tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
        const idGroups = (tokens?.idToken?.payload['cognito:groups'] as string[]) || [];
        if ([...accessGroups, ...idGroups].includes('Doctors')) setIsDoctor(true);
      } catch (error) { console.error("Error checking role:", error); }
    };
    checkUserRole();
  }, []);

  const fetchQueue = async (mode: string, dept: string, isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true); 
    try {
      if (mode === "Appointments") {
        const d = bookingDate || todayDateString;
        const response = await fetch(`/api/queue?type=appointments&department=${dept}&date=${d}`);
        const data = await response.json();
        if (Array.isArray(data)) setAppointmentList(data);
      } else {
        const targetDept = mode === "Live" ? dept : "Archive";
        const response = await fetch(`/api/queue?department=${targetDept}`);
        const data = await response.json();
        if (Array.isArray(data)) setPatients(data);
      }
    } catch (error) { console.error("Error fetching data:", error); }
    if (!isAutoRefresh) setLoading(false);
  };

  useEffect(() => {
    fetchQueue(viewMode, selectedDept, false);
    const intervalId = setInterval(() => {
      if ((viewMode === "Live" || viewMode === "Appointments") && !treatingPatient) {
        fetchQueue(viewMode, selectedDept, true);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [viewMode, selectedDept, bookingDate, treatingPatient]);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const checkAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return alert("Please select a date first.");
    setLoading(true);
    try {
      const response = await fetch(`/api/queue?type=appointments&department=${selectedDept}&date=${bookingDate}`);
      const data = await response.json();
      if (!response.ok) {
        alert(`AWS Backend Error: ${data.details || data.error}`);
        setLoading(false); return;
      }
      const takenSlots = Array.isArray(data) ? data.map((app: any) => app.timeSlot) : [];
      setBookedTimeSlots(takenSlots);
      setShowSlots(true);
    } catch (error) { alert("Network error. Could not load available slots."); }
    setLoading(false);
  };

  const confirmBooking = async () => {
    if (!selectedTimeSlot || !formData.name || !formData.symptoms) return alert("Please fill out your name, symptoms, and select a time slot.");
    setLoading(true);
    try {
      const response = await fetch('/api/queue', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "bookAppointment", department: selectedDept, date: bookingDate, timeSlot: selectedTimeSlot, patientName: formData.name, email: formData.email, symptoms: formData.symptoms })
      });
      const responseData = await response.json();
      if (!response.ok) {
        alert(`❌ Booking Failed: ${responseData.details || "Slot taken!"}`);
        checkAvailability({ preventDefault: () => {} } as React.FormEvent); 
      } else {
        alert("✅ Appointment Booked Successfully!");
        setFormData({ name: '', email: '', age: '', address: '', symptoms: '', isEmergency: false });
        setSelectedTimeSlot(""); setShowSlots(false); setBookingDate("");
      }
    } catch (error) { console.error("Error booking:", error); }
    setLoading(false);
  };

 const addPatient = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!formData.name || !formData.symptoms) return;
    setLoading(true); 
    try {
      const response = await fetch('/api/queue', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) 
      });
      const responseData = await response.json();
      if (!response.ok) return alert(`AWS Backend Error: ${responseData.details}`);
      
      const assignedDept = responseData.department || "General";
      
      // 1. Give the patient their ticket
      setMyTicket({ name: formData.name, department: assignedDept });
      
      // 2. NEW: Fire the calculator to check the doctor's real-time speed!
      calculateRealWaitTime(assignedDept);
      
      setFormData({ name: '', email: '', age: '', address: '', symptoms: '', isEmergency: false });
      if (responseData.department) setSelectedDept(responseData.department);
      setViewMode("Live"); 
    } catch (error) { console.error("Error adding patient:", error); }
    setLoading(false);
  };

// ==========================================
  // REAL-TIME ROLLING AVERAGE CALCULATOR
  // ==========================================
  const calculateRealWaitTime = async (dept: string) => {
    try {
      // 1. Fetch the hospital's entire history
      const res = await fetch('/api/queue?department=Archive');
      const data = await res.json();
      
      // 2. Filter for ONLY the department the patient is waiting for
      const deptHistory = data.filter((p: any) => p.department === dept && p.calledAt);
      
      // 3. Sort so the most recently treated patients are at the top
      deptHistory.sort((a: any, b: any) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());
      
      // 4. Grab the last 5 patients the doctor saw
      const last5Patients = deptHistory.slice(0, 5);

      if (last5Patients.length >= 2) {
        let totalTimeDiff = 0;
        let validPairs = 0;

        // 5. Calculate the exact minutes between each patient leaving the room
        for (let i = 0; i < last5Patients.length - 1; i++) {
          const timeFinished = new Date(last5Patients[i].calledAt).getTime();
          const previousFinished = new Date(last5Patients[i+1].calledAt).getTime();
          
          const diffInMinutes = (timeFinished - previousFinished) / (1000 * 60);
          
          // Sanity check: If the doctor took a lunch break (e.g., > 60 mins), ignore that gap
          if (diffInMinutes > 0 && diffInMinutes < 60) {
            totalTimeDiff += diffInMinutes;
            validPairs++;
          }
        }

        // 6. Set the new, highly accurate real-time average!
        if (validPairs > 0) {
          const actualSpeed = Math.round(totalTimeDiff / validPairs);
          // Don't let it drop below a safe minimum of 5 minutes
          setRealAvgConsultTime(Math.max(5, actualSpeed));
        }
      }
    } catch (error) {
      console.error("Failed to calculate real wait time:", error);
    }
  };


const startTreatment = async (patient: any) => {
    setTreatingPatient(patient);
    setPrescriptionData({ diagnosis: "", medicines: [{ name: "", dosage: "", duration: "" }] });
    setPatientTimeline([]);
    setLoadingHistory(true);

    try {
      const res = await fetch('/api/queue?department=Archive');
      const data = await res.json();
      
      const history = data.filter((p: any) => {
        const currentEmail = (patient.email || "").trim().toLowerCase();
        const pastEmail = (p.email || "").trim().toLowerCase();
        const currentName = (patient.patientName || "").trim().toLowerCase();
        const pastName = (p.patientName || "").trim().toLowerCase();

        // STRICT CHECK 1: The names MUST match exactly.
        if (currentName !== pastName) return false;

        // STRICT CHECK 2: If they both have an email, the emails MUST also match.
        if (currentEmail !== "" && pastEmail !== "") {
          if (currentEmail !== pastEmail) return false;
        }

        // If it passes both strict checks, it's the exact same person!
        return true; 
      });

      const sortedHistory = history.sort((a: any, b: any) => 
        new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
      );

      setPatientTimeline(sortedHistory);
    } catch (error) {
      console.error("Failed to load patient history:", error);
    }
    setLoadingHistory(false);
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const newMedicines = [...prescriptionData.medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };
  
  const addMedicineRow = () => {
    setPrescriptionData({ ...prescriptionData, medicines: [...prescriptionData.medicines, { name: "", dosage: "", duration: "" }] });
  };

  const finishTreatment = async () => {
    try {
      window.print();
      const completedPatient = {
        ...treatingPatient,
        diagnosis: prescriptionData.diagnosis,
        medicines: prescriptionData.medicines.filter(m => m.name !== "") 
      };

      const response = await fetch('/api/queue', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(completedPatient) 
      });

      const data = await response.json();
      alert(`Backend Status: ${data.message}\n\nEmail Status: ${data.emailStatus || "Email sent successfully"}`);

      setTreatingPatient(null);
      fetchQueue(viewMode, selectedDept, false); 
    } catch (error) { console.error("Error saving prescription:", error); }
  };

  const getUrgencyColor = (urgency: string) => {
    if (urgency === "High") return "bg-red-100 text-red-800 border-red-200";
    if (urgency === "Medium") return "bg-orange-100 text-orange-800 border-orange-200";
    if (urgency === "Low") return "bg-green-100 text-green-800 border-green-200";
    return "bg-slate-100 text-slate-800 border-slate-200"; 
  };

  const filteredPatients = patients.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (p.patientName || "").toLowerCase().includes(searchLower) || (p.symptoms || "").toLowerCase().includes(searchLower);
  });

// ==========================================
  // REAL-TIME QUEUE MATH
  // ==========================================
  let myQueuePosition = 0;
  let patientsAhead = 0;
  let estimatedWait = 0;
  
  if (!isDoctor && myTicket && viewMode === "Live") {
    const deptQueue = patients.filter(p => p.department === myTicket.department);
    deptQueue.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    const myIndex = deptQueue.findIndex(p => (p.patientName || "").toLowerCase() === myTicket.name.toLowerCase());
    
    if (myIndex !== -1) {
      myQueuePosition = myIndex + 1; 
      patientsAhead = myIndex;       
      
      // NO MORE MAGIC NUMBERS! Multiply by the Doctor's exact real-time speed.
      estimatedWait = patientsAhead * realAvgConsultTime; 
    }
  }


  return (
    <>
      <div className="print:hidden w-full max-w-5xl bg-white p-8 rounded-lg shadow-md border border-slate-200">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-800">
                {isDoctor ? "🩺 Doctor Dashboard" : "Hospital Triage"}
              </h2>
              <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> LIVE SYNC
              </span>
            </div>
            <button onClick={() => { if (signOut) signOut(); }} className="text-sm text-red-500 hover:underline">Sign Out</button>
        </div>

        <div className="flex gap-4 mb-6 border-b pb-2">
          <button onClick={() => setViewMode("Live")} className={`font-semibold pb-2 px-2 ${viewMode === "Live" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
            {isDoctor ? "Live Queue" : "Walk-in Triage"}
          </button>
          {isDoctor ? (
            <>
              <button onClick={() => setViewMode("Appointments")} className={`font-semibold pb-2 px-2 ${viewMode === "Appointments" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>Appointments</button>
              <button onClick={() => setViewMode("History")} className={`font-semibold pb-2 px-2 ${viewMode === "History" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>Patient Archive</button>
            </>
          ) : (
            <button onClick={() => setViewMode("Book")} className={`font-semibold pb-2 px-2 ${viewMode === "Book" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>Schedule Visit</button>
          )}
        </div>

        {viewMode === "Book" && (
          <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Patient Appointment Scheduler</h3>
            <form onSubmit={checkAvailability} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col"><label className="text-xs font-bold text-slate-500 uppercase">Full Name</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="p-2 border border-slate-300 rounded focus:border-blue-500 outline-none" placeholder="John Doe" /></div>
              <div className="flex flex-col"><label className="text-xs font-bold text-slate-500 uppercase">Email Address</label><input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="p-2 border border-slate-300 rounded focus:border-blue-500 outline-none" placeholder="patient@example.com" /></div>
                   <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="p-2 border border-slate-300 rounded focus:border-blue-500 bg-white">
  <option value="General">General</option>
  <option value="Cardiology">Cardiology</option>
  <option value="Pediatrics">Pediatrics</option>
  <option value="Orthopedics">Orthopedics</option>
  <option value="Neurology">Neurology</option>
</select>
              <div className="flex flex-col"><label className="text-xs font-bold text-slate-500 uppercase">Select Date</label><input type="date" required min={todayDateString} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="p-2 border border-slate-300 rounded focus:border-blue-500 outline-none" /></div>
              <textarea name="symptoms" required value={formData.symptoms} onChange={handleInputChange} rows={2} className="md:col-span-2 p-2 border border-slate-300 rounded focus:border-blue-500 outline-none" placeholder="Reason for Visit..." />
              {!showSlots && <button type="submit" disabled={loading} className="md:col-span-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded">Check Availability</button>}
            </form>
            {showSlots && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                  {allTimeSlots.map((slot) => {
                    const isDisabled = bookedTimeSlots.includes(slot) || isSlotInPast(slot, bookingDate);
                    return <button key={slot} type="button" disabled={isDisabled} onClick={() => setSelectedTimeSlot(slot)} className={`py-2 px-1 text-sm font-semibold rounded border ${isDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through' : selectedTimeSlot === slot ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}>{slot}</button>
                  })}
                </div>
                {selectedTimeSlot && <button onClick={confirmBooking} disabled={loading} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded">Confirm {selectedTimeSlot}</button>}
              </div>
            )}
          </div>
        )}

       
       {/* IF PATIENT HAS NO TICKET: SHOW FORM */}
        {!isDoctor && viewMode === "Live" && !myTicket && (
          <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Walk-in Digital Intake</h3>
            <form onSubmit={addPatient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="p-2 border border-slate-300 rounded outline-none" placeholder="Full Name" />
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="p-2 border border-slate-300 rounded outline-none" placeholder="Email Address" />
              <textarea name="symptoms" required value={formData.symptoms} onChange={handleInputChange} rows={2} className="md:col-span-2 p-2 border border-slate-300 rounded outline-none" placeholder="Symptoms..." />
              <button type="submit" disabled={loading} className="md:col-span-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">Submit to AI Triage</button>
            </form>
          </div>
        )}

        {/* IF PATIENT HAS TICKET: SHOW LIVE STATUS */}
        {!isDoctor && viewMode === "Live" && myTicket && (
          <div className="mb-8 p-8 bg-blue-50 border border-blue-200 rounded-lg shadow-inner text-center">
            <h3 className="text-2xl font-black text-blue-900 mb-1">Your Digital Ticket</h3>
            <p className="text-slate-600 font-medium mb-6 uppercase tracking-widest text-sm">Routed to: <strong>{myTicket.department}</strong></p>
            
            {myQueuePosition > 0 ? (
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                 <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Queue Position</p>
                    <p className="text-5xl font-black text-blue-600">#{myQueuePosition}</p>
                 </div>
                 <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Est. Wait Time</p>
                    <p className="text-5xl font-black text-orange-500">{estimatedWait} <span className="text-lg font-bold text-slate-400">min</span></p>
                 </div>
              </div>
            ) : (
              <div className="bg-green-100 p-6 rounded-lg border border-green-300 max-w-md mx-auto">
                <h4 className="text-2xl font-black text-green-800">It is your turn!</h4>
                <p className="text-green-700 font-medium mt-2">The doctor is ready to see you, or your visit is complete.</p>
                <button onClick={() => setMyTicket(null)} className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors shadow-sm">Start New Visit</button>
              </div>
            )}
          </div>
        )}

        {viewMode !== "Book" && (
          <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              {viewMode === "Appointments" ? <input type="date" value={bookingDate || todayDateString} onChange={(e) => setBookingDate(e.target.value)} className="p-2 text-sm border border-slate-300 rounded-md" /> : <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 text-sm border border-slate-300 rounded-md" />}
             
<select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="p-2 text-sm border border-slate-300 rounded-md bg-white">
  <option value="General">General</option>
  <option value="Cardiology">Cardiology</option>
  <option value="Pediatrics">Pediatrics</option>
  <option value="Orthopedics">Orthopedics</option>
  <option value="Neurology">Neurology</option>
</select>

            </div>
          </div>
        )}

        {viewMode !== "Book" && (
          <div className="mb-6">
            {(viewMode === "Appointments" ? appointmentList : filteredPatients).map((patient, index) => (
              <li key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-white rounded-lg border border-slate-200 shadow-sm mb-3">
                <div className="flex flex-col w-full md:w-3/4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-slate-800 text-xl">{patient.patientName}</span>
                    {viewMode === "Appointments" ? <span className="px-3 py-1 text-sm font-bold bg-indigo-100 text-indigo-800 rounded">⏱ {patient.timeSlot}</span> : patient.urgency ? <span className={`px-2 py-0.5 text-xs font-bold border rounded uppercase ${getUrgencyColor(patient.urgency)}`}>{patient.urgency}</span> : null}
                  </div>
                  {patient.symptoms && <span className="text-sm text-slate-600 block">Condition: <span className="text-slate-800">{patient.symptoms}</span></span>}
                  
                  {viewMode === "History" && patient.diagnosis && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-sm">
                      <strong className="block text-slate-800 mb-1">Diagnosis:</strong> <p className="mb-2 text-slate-600">{patient.diagnosis}</p>
                    </div>
                  )}
                </div>
                
                {isDoctor && viewMode === "Live" && (
                  <button onClick={() => startTreatment(patient)} className="px-6 py-2 bg-green-100 hover:bg-green-200 text-green-800 font-bold rounded-md shadow-sm mt-3 md:mt-0">
                    Treat Patient
                  </button>
                )}
              </li>
            ))}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* UI: THE NEW SPLIT-SCREEN TREATMENT MODAL */}
      {/* ========================================== */}
      {treatingPatient && (
        <div className="print:hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-blue-900 flex items-center gap-2">
                  <span className="text-3xl">🧑‍⚕️</span> Treating: {treatingPatient.patientName}
                </h3>
                <p className="text-sm font-semibold text-red-600 mt-1 uppercase tracking-wide">Current Issue: {treatingPatient.symptoms}</p>
              </div>
              <button onClick={() => setTreatingPatient(null)} className="text-slate-400 hover:text-red-500 text-3xl font-bold leading-none">&times;</button>
            </div>
            
            {/* Modal Body (Split Screen) */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* LEFT COLUMN: EMR TIMELINE */}
              <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Patient EMR History</h4>
                
                {loadingHistory ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ) : patientTimeline.length === 0 ? (
                  <div className="text-center p-4 bg-white rounded border border-slate-200 border-dashed">
                    <p className="text-sm text-slate-500 font-medium">No previous visits found.</p>
                  </div>
                ) : (
                  <div className="border-l-2 border-indigo-200 ml-3 pl-6 space-y-6 relative">
                    {patientTimeline.map((visit, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 bg-indigo-500 border-4 border-slate-50 rounded-full shadow-sm"></div>
                        
                        {/* Visit Card */}
                        <div className="bg-white p-3 rounded shadow-sm border border-slate-200">
                           <p className="text-xs font-bold text-indigo-600 mb-1 flex justify-between">
                             {new Date(visit.calledAt).toLocaleDateString()}
                             <span className="bg-slate-100 text-slate-600 px-2 rounded-full">{visit.department}</span>
                           </p>
                           <p className="text-sm font-semibold text-slate-800">{visit.symptoms}</p>
                           
                           {visit.diagnosis && visit.diagnosis !== "None" && (
                             <div className="mt-2 pt-2 border-t border-slate-100">
                               <p className="text-xs text-slate-500 font-bold uppercase">Diagnosis</p>
                               <p className="text-sm text-slate-700">{visit.diagnosis}</p>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: DOCTOR PRESCRIPTION FORM */}
              <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-white">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Doctor's Diagnosis</label>
                    <textarea rows={4} value={prescriptionData.diagnosis} onChange={(e) => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 bg-blue-50/30" placeholder="Enter clinical diagnosis and notes here..." />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex justify-between items-end">
                      Prescribe Medicines
                      <button type="button" onClick={addMedicineRow} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition-colors">+ Add Row</button>
                    </label>
                    <div className="space-y-3">
                      {prescriptionData.medicines.map((med, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input type="text" placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicineChange(index, "name", e.target.value)} className="flex-1 p-2 border border-slate-300 rounded outline-none shadow-sm" />
                          <input type="text" placeholder="Dosage (1-0-1)" value={med.dosage} onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)} className="w-32 p-2 border border-slate-300 rounded outline-none shadow-sm" />
                          <input type="text" placeholder="Days" value={med.duration} onChange={(e) => handleMedicineChange(index, "duration", e.target.value)} className="w-24 p-2 border border-slate-300 rounded outline-none shadow-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button onClick={() => setTreatingPatient(null)} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded transition-colors">Cancel</button>
              <button onClick={finishTreatment} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-md flex items-center gap-2 transition-transform active:scale-95">
                🖨️ Save to EMR & Email PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* UI: THE PDF TEMPLATE (Only visible during Print!) */}
      {/* ========================================== */}
      {treatingPatient && (
        <div className="hidden print:block absolute top-0 left-0 w-full h-full bg-white p-10 text-black">
          <div className="border-b-4 border-blue-900 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-blue-900 tracking-tight">Smart OPD Hospital</h1>
              <p className="text-lg text-slate-600 font-medium">{treatingPatient.department} Department</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">Dr. Attending Physician</p>
              <p className="text-slate-500 text-sm">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8 flex justify-between">
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Patient Name</p>
              <p className="text-2xl font-bold text-slate-800">{treatingPatient.patientName}</p>
            </div>
            <div className="text-right">
               <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Reported Symptoms</p>
               <p className="font-medium text-slate-800">{treatingPatient.symptoms}</p>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-bold text-blue-900 mb-3 uppercase tracking-wider border-b pb-2">Clinical Diagnosis</h3>
            <p className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap">{prescriptionData.diagnosis || "No diagnosis recorded."}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wider border-b pb-2">Rx: Medicines Prescribed</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="p-3 border border-slate-300">Medicine Name</th>
                  <th className="p-3 border border-slate-300 w-32">Dosage</th>
                  <th className="p-3 border border-slate-300 w-32">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionData.medicines.filter(m => m.name !== "").map((med, idx) => (
                  <tr key={idx} className="text-slate-800 font-medium">
                    <td className="p-3 border border-slate-300 text-lg">{med.name}</td>
                    <td className="p-3 border border-slate-300">{med.dosage}</td>
                    <td className="p-3 border border-slate-300">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-100 p-6 print:p-0 print:bg-white">
      <div className="mb-8 mt-6 text-center print:hidden">
        <h1 className="text-5xl font-black text-blue-900 mb-2 tracking-tight">Smart OPD</h1>
        <p className="text-slate-600 font-medium">AI-Powered Hospital Triage & Scheduling</p>
      </div>
      <Authenticator formFields={formFields}>
        {({ signOut }) => <DashboardApp signOut={signOut} />}
      </Authenticator>
    </main>
  );
}