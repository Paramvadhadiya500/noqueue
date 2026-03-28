"use client";

import { useState, useEffect, useRef } from 'react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth'; 
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { 
  LayoutDashboard, Users, Calendar, FolderClock, LogOut, Search, Bell, Activity, Clock, 
  AlertCircle, PlusCircle, Printer, X, MapPin, Building2, Star, Globe, MapPinCheck, 
  UserX, Coffee, ShieldAlert, ArrowRightLeft, CalendarClock, TrendingUp, IndianRupee, 
  Settings, BarChart3, FileText, UploadCloud, Mic, MicOff, Loader2, Pill, Smartphone, CheckCircle2
} from 'lucide-react';

Amplify.configure({ Auth: { Cognito: { userPoolId: 'ap-south-1_p039t5AGU', userPoolClientId: '2c9mnkobjqfj0rk0b2dlc1tqvn' } } });
const formFields = { signUp: { name: { order: 1, label: 'Full Name', placeholder: 'Enter your full name', isRequired: true }, username: { order: 2 }, password: { order: 3 }, confirm_password: { order: 4 } } };
const allTimeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];

const NETWORK_HOSPITALS = [
  { id: "HOSP-ABC", name: "City Central Hospital", location: "Downtown", color: "blue", lat: 23.0225, lng: 72.5714 },
  { id: "HOSP-XYZ", name: "Westside Clinic", location: "West District", color: "indigo", lat: 23.0338, lng: 72.5850 },
  { id: "HOSP-LMN", name: "Northpoint General", location: "North Hills", color: "emerald", lat: 23.0600, lng: 72.5800 }
];

const TRANSLATIONS = {
  en: { city_wide_network: "City-Wide Network", find_a_hospital: "Find a Hospital", select_location: "Select a location to see wait times.", walk_in: "Walk-in", schedule: "Schedule", live_queue: "Live Queue", waiting: "waiting", est_wait: "Est. Wait", min: "min", walk_in_triage: "Walk-in Triage", checked_into: "Checked into:", change_hospital: "Change Hospital", full_name: "Full Legal Name", email_presc: "Email Address", phone_queue: "Phone (e.g. +919876543210)", symptoms_desc: "Describe your symptoms...", submit_ticket: "Submit & Get Ticket", processing: "Processing AI Triage...", digital_ticket: "Digital Queue Ticket", routed_to: "Routed to:", position: "Position", your_turn: "It's your turn!", proceed_doctor: "Please proceed to the doctor's office.", leave_queue: "Leave Queue", visit_complete: "Visit Complete", feedback_prompt: "How was your experience?", feedback_saved: "Feedback Saved!", return_home: "Return to Home", confirm_arrival: "I Have Arrived", arrival_confirmed: "Arrival Confirmed", almost_up: "You are almost up! Please confirm.", no_show_warning: "Warning: Multiple missed visits recorded. Please arrive on time.", doc_on_break: "Doctor is on a short break until", doc_emergency: "Critical Emergency: Accepting High Priority only.", delayed: "Delayed", my_followups: "My Follow-ups", follow_up_req: "Follow-up Requested", book_followup: "Book Follow-up", no_followup: "No pending follow-ups found for this email.", check_records: "Check Health Records", upload_doc: "Upload Report (PDF/Image)", uploading: "Uploading...", gps_verifying: "Verifying GPS...", gps_error: "GPS Denied or Unavailable.", too_far: "You are too far from the hospital to check in. Please arrive within 500 meters.", my_pillbox: "My Pillbox", whatsapp_alerts: "Enable SMS Alerts", morning: "Morning", afternoon: "Afternoon", night: "Night" },
  hi: { city_wide_network: "शहर-व्यापी नेटवर्क", find_a_hospital: "अस्पताल खोजें", select_location: "अस्पताल चुनें।", walk_in: "वॉक-इन", schedule: "शेड्यूल", live_queue: "लाइव कतार", waiting: "प्रतीक्षा में", est_wait: "अनुमानित समय", min: "मिनट", walk_in_triage: "वॉक-इन ट्राइएज", checked_into: "अस्पताल:", change_hospital: "अस्पताल बदलें", full_name: "पूरा नाम", email_presc: "ईमेल आईडी", phone_queue: "फ़ोन (उदा. +919876543210)", symptoms_desc: "लक्षणों का वर्णन करें...", submit_ticket: "टिकट लें", processing: "AI ट्राइएज चल रहा है...", digital_ticket: "डिजिटल कतार टिकट", routed_to: "विभाग:", position: "स्थान", your_turn: "अब आपकी बारी है!", proceed_doctor: "कृपया डॉक्टर के केबिन में जाएं।", leave_queue: "कतार छोड़ें", visit_complete: "परामर्श पूर्ण", feedback_prompt: "आपका अनुभव कैसा रहा?", feedback_saved: "प्रतिक्रिया सहेजी गई!", return_home: "होम पर लौटें", confirm_arrival: "मैं पहुँच गया हूँ", arrival_confirmed: "आगमन की पुष्टि", almost_up: "आपकी बारी आने वाली সম্ব! पुष्टि करें।", no_show_warning: "चेतावनी: पिछली मुलाकातें मिस की हैं। समय पर पहुँचें।", doc_on_break: "डॉक्टर ब्रेक पर हैं:", doc_emergency: "आपातकाल: केवल उच्च प्राथमिकता वाले मरीज।", delayed: "विलंबित", my_followups: "मेरे फॉलो-अप", follow_up_req: "फॉलो-अप आवश्यक", book_followup: "फॉलो-अप बुक करें", no_followup: "इस ईमेल के लिए कोई लंबित फॉलो-अप नहीं मिला।", check_records: "रिकॉर्ड जांचें", upload_doc: "रिपोर्ट अपलोड करें", uploading: "अपलोड हो रहा है...", gps_verifying: "GPS सत्यापित हो रहा है...", gps_error: "GPS उपलब्ध नहीं है।", too_far: "आप अस्पताल से बहुत दूर हैं। कृपया 500 मीटर के दायरे में आएं।", my_pillbox: "मेरी दवा अनुसूची", whatsapp_alerts: "SMS अलर्ट सक्षम करें", morning: "सुबह", afternoon: "दोपहर", night: "रात" },
  gu: { city_wide_network: "શહેર-વ્યાપી નેટવર્ક", find_a_hospital: "હોસ્પિટલ શોધો", select_location: "હોસ્પિટલ પસંદ કરો.", walk_in: "વૉક-ઇન", schedule: "શેડ્યૂલ", live_queue: "લાઇવ કતાર", waiting: "પ્રતીક્ષામાં", est_wait: "અંદાજિત સમય", min: "મિનિટ", walk_in_triage: "વૉક-ઇન ટ્રાયજ", checked_into: "હોસ્પિટલ:", change_hospital: "હોસ્પિટલ બદલો", full_name: "પૂરું નામ", email_presc: "ઇમેઇલ આઈડી", phone_queue: "ફોન (દા.ત. +919876543210)", symptoms_desc: "લક્ષણોનું વર્ણન કરો...", submit_ticket: "ટિકિટ મેળવો", processing: "AI ટ્રાયજ ચાલી રહ્યું છે...", digital_ticket: "ડિજિટલ કતાર ટિકિટ", routed_to: "વિભાગ:", position: "સ્થાન", your_turn: "હવે તમારો વારો છે!", proceed_doctor: "કૃપા કરીને ડૉક્ટરની કેબિનમાં જાઓ.", leave_queue: "કતાર છોડો", visit_complete: "મુલાકાત પૂર્ણ", feedback_prompt: "તમારો અનુભવ કેવો રહ્યો?", feedback_saved: "પ્રતિસાદ સાચવ્યો!", return_home: "હોમ પર પાછા ફરો", confirm_arrival: "હું પહોંચી ગયો છું", arrival_confirmed: "આગમન કન્ફર્મ થયું", almost_up: "તમારો વારો આવવાનો છે! પુષ્ટિ કરો.", no_show_warning: "ચેતવણી: અગાઉની મુલાકાતો ચૂકી ગયા છો. સમયસર પહોંચો.", doc_on_break: "ડૉક્ટર બ્રેક પર છે:", doc_emergency: "ઇમરજન્સી: ફક્ત ઉચ્ચ પ્રાધાન્યતાવાળા દર્દીઓ.", delayed: "વિલંબિત", my_followups: "મારા ફોલો-અપ", follow_up_req: "ફોલો-અપ જરૂરી", book_followup: "ફોલો-અપ બુક કરો", no_followup: "આ ઇમેઇલ માટે કોઈ બાકી ફોલો-અપ મળ્યું નથી.", check_records: "રેકોર્ડ્સ તપાસો", upload_doc: "રિપોર્ટ અપલોડ કરો", uploading: "અપલોડ થઈ રહ્યું છે...", gps_verifying: "GPS ચકાસી રહ્યું છે...", gps_error: "GPS અક્ષમ છે.", too_far: "તમે ચેક-ઇન કરવા માટે ખૂબ દૂર છો. કૃપા કરીને 500 મીટરની અંદર આવો.", my_pillbox: "મારું દવા બોક્સ", whatsapp_alerts: "SMS ચેતવણીઓ સક્ષમ કરો", morning: "સવાર", afternoon: "બપોર", night: "રાત" }
};

const getTodayDateString = () => { const now = new Date(); const offset = now.getTimezoneOffset(); return new Date(now.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0]; };
const isSlotInPast = (slotTimeStr: string, selectedDateStr: string) => { const todayStr = getTodayDateString(); if (selectedDateStr < todayStr) return true; if (selectedDateStr > todayStr) return false; const now = new Date(); const [time, modifier] = slotTimeStr.split(' '); let [hours, minutes] = time.split(':'); let parsedHours = parseInt(hours, 10); if (parsedHours === 12 && modifier === 'AM') parsedHours = 0; if (parsedHours < 12 && modifier === 'PM') parsedHours += 12; const slotTime = new Date(); slotTime.setHours(parsedHours, parseInt(minutes, 10), 0, 0); return slotTime < now; };
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => { const R = 6371e3; const toRad = (val: number) => val * Math.PI / 180; const dLat = toRad(lat2 - lat1); const dLon = toRad(lon2 - lon1); const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c; };

export default function Home() { 
  return (
    <Authenticator formFields={formFields}>
      {({ signOut }) => <DashboardApp signOut={signOut} />}
    </Authenticator>
  ); 
}

function DashboardApp({ signOut }: { signOut: any }) {
  const todayDateString = getTodayDateString();
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => { setToast({ show: true, msg, type }); setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000); };

  const [patients, setPatients] = useState<any[]>([]);
  const [appointmentList, setAppointmentList] = useState<any[]>([]);
  const [cityWideQueue, setCityWideQueue] = useState<any[]>([]);
  const [archiveData, setArchiveData] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  
  const [userRole, setUserRole] = useState<"Patient" | "Doctor" | "Admin" | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  
  const [systemState, setSystemState] = useState<{docStatus: string, resumeTime?: string}>({ docStatus: "Available" });
  const [lang, setLang] = useState<'en' | 'hi' | 'gu'>('en');
  const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[lang][key] || TRANSLATIONS.en[key];

  const [activeHospitalId, setActiveHospitalId] = useState<string>("HOSP-ABC"); 
  const [activeTab, setActiveTab] = useState("City View");
  const [selectedDept, setSelectedDept] = useState("General");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({ show: false, msg: '', type: 'success' });

  // ==========================================
  // BUG FIX: INITIALIZE WITH TODAY'S DATE
  // ==========================================
  const [bookingDate, setBookingDate] = useState(todayDateString);
  
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showSlots, setShowSlots] = useState(false);

  const [treatingPatient, setTreatingPatient] = useState<any | null>(null);
  const [prescriptionData, setPrescriptionData] = useState({ diagnosis: "", medicines: [{ name: "", dosage: "", duration: "" }], followUpDays: 0 });
  const [patientTimeline, setPatientTimeline] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferDept, setTransferDept] = useState("Cardiology");
  const [transferNotes, setTransferNotes] = useState("");

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', age: '', address: '', symptoms: '', isEmergency: false });
  const [myTicket, setMyTicket] = useState<{name: string, department: string, hospitalId: string, Timestamp: string, arrivalStatus: string} | null>(null);
  const [realAvgConsultTime, setRealAvgConsultTime] = useState(12);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const [hospitalFee, setHospitalFee] = useState(500);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifyingGPS, setVerifyingGPS] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const [checkedPills, setCheckedPills] = useState<string[]>([]);
  const [smsLoading, setSmsLoading] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { tokens } = await fetchAuthSession(); 
        const accessGroups = (tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];
        const idGroups = (tokens?.idToken?.payload['cognito:groups'] as string[]) || [];
        const allGroups = [...accessGroups, ...idGroups];

        if (allGroups.includes('Admins')) { setUserRole("Admin"); setIsDoctor(false); setActiveTab("Super Panel"); } 
        else if (allGroups.includes('Doctors')) { setUserRole("Doctor"); setIsDoctor(true); setActiveTab("Dashboard"); } 
        else { setUserRole("Patient"); setIsDoctor(false); setActiveTab("City View"); }
      } catch (error) { console.error("Auth check failed:", error); }
    };
    checkUserRole();
    fetch('/api/queue?department=Archive').then(res => res.json()).then(data => setArchiveData(data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/queue?department=HOSPITAL_CONFIG').then(res => res.json()).then(data => {
      const config = data.find((c:any) => c.Timestamp === activeHospitalId);
      if(config && config.baseFee) setHospitalFee(config.baseFee);
    }).catch(console.error);
  }, [activeHospitalId]);

  const fetchQueue = async (mode: string, dept: string, isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true); 
    try {
      if (mode === "Appointments") {
        const res = await fetch(`/api/queue?type=appointments&department=${dept}&date=${bookingDate}&hospitalId=${activeHospitalId}`);
        setAppointmentList(await res.json() || []);
      } else if (mode === "City View" || mode === "Super Panel") {
        const res = await fetch(`/api/queue?type=all_active`);
        setCityWideQueue(await res.json() || []);
      } else if (mode === "Live" && activeTab === "My Ticket" && myTicket) {
        const res = await fetch(`/api/queue?type=all_active`);
        const allData = await res.json() || [];
        const myLiveRecord = allData.find((p: any) => p.Timestamp === myTicket.Timestamp);

        if (myLiveRecord) {
          const deptRes = await fetch(`/api/queue?department=${myLiveRecord.department}&hospitalId=${activeHospitalId}`);
          const deptData = await deptRes.json() || [];
          const sysRecord = deptData.find((p: any) => p.Timestamp === "SYSTEM_STATE");
          if (sysRecord) setSystemState(sysRecord); else setSystemState({ docStatus: "Available" });

          const realPatients = deptData.filter((p: any) => p.Timestamp !== "SYSTEM_STATE");
          setPatients(realPatients);

          if (myLiveRecord.department !== myTicket.department || myLiveRecord.arrivalStatus !== myTicket.arrivalStatus) {
            setMyTicket({...myTicket, department: myLiveRecord.department, arrivalStatus: myLiveRecord.arrivalStatus});
            if (myLiveRecord.department !== myTicket.department) { showToast(`Notice: You have been transferred to ${myLiveRecord.department}`); }
          }
        } else { setPatients([]); }
      } else {
        const targetDept = mode === "Archive" ? "Archive" : dept;
        const res = await fetch(`/api/queue?department=${targetDept}&hospitalId=${activeHospitalId}`);
        const data = await res.json() || [];
        const sysRecord = data.find((p: any) => p.Timestamp === "SYSTEM_STATE");
        if (sysRecord) setSystemState(sysRecord); else setSystemState({ docStatus: "Available" });

        const realPatients = data.filter((p: any) => p.Timestamp !== "SYSTEM_STATE");
        setPatients(realPatients);
      }
    } catch (error) { console.error(error); }
    if (!isAutoRefresh) setLoading(false);
  };

  useEffect(() => {
    if(!userRole) return;
    const fetchTarget = activeTab === "Appointments" ? "Appointments" : (activeTab === "Archive" ? "Archive" : (activeTab === "City View" || activeTab === "Follow-ups" || activeTab === "Pillbox" || activeTab === "Super Panel" ? "City View" : "Live"));
    const fetchDept = (activeTab === "My Ticket" && myTicket) ? myTicket.department : selectedDept;
    fetchQueue(fetchTarget, fetchDept, false);
    
    const intervalId = setInterval(() => {
      if ((activeTab === "Dashboard" || activeTab === "Appointments" || activeTab === "City View" || activeTab === "My Ticket" || activeTab === "Super Panel") && !treatingPatient) {
        fetchQueue(fetchTarget, fetchDept, true);
      }
    }, 5000);
    return () => clearInterval(intervalId);
  }, [activeTab, selectedDept, bookingDate, treatingPatient, activeHospitalId, myTicket, userRole]);

  const toggleVoiceScribe = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop(); 
      return; 
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { return showToast("Voice scribe is not supported in this browser. Please use Chrome.", "error"); }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true; 
    recognition.continuous = true;     

    let finalTranscriptStr = "";
    let currentLiveText = "";

    recognition.onstart = () => { setIsRecording(true); setLiveTranscript(""); showToast("Microphone is listening..."); };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = ""; let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
        else interimTranscript += event.results[i][0].transcript;
      }
      finalTranscriptStr += finalTranscript; currentLiveText = finalTranscriptStr + interimTranscript;
      setLiveTranscript(currentLiveText);
    };

    recognition.onerror = (event: any) => { if(event.error !== 'no-speech') showToast(`Microphone error: ${event.error}`, "error"); };

    recognition.onend = async () => {
      setIsRecording(false);
      const textToProcess = currentLiveText.trim();
      if (!textToProcess) { setLiveTranscript(""); return; }

      setIsProcessingVoice(true); showToast("AI is processing your dictation...");
      
      try {
        const res = await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "processVoiceNotes", voiceText: textToProcess }) });
        const data = await res.json();
        
        if (res.ok) {
           setPrescriptionData(prev => {
             const existingMeds = prev.medicines.filter(m => m.name !== "");
             const newMeds = data.medicines && data.medicines.length > 0 ? data.medicines : [];
             const combinedMeds = [...existingMeds, ...newMeds];
             if (combinedMeds.length === 0) combinedMeds.push({ name: "", dosage: "", duration: "" });

             return { diagnosis: prev.diagnosis ? prev.diagnosis + "\n\n[AI Scribe]: " + data.diagnosis : data.diagnosis, medicines: combinedMeds, followUpDays: data.followUpDays || prev.followUpDays };
           });
           showToast("AI Scribe populated the EMR!");
        } else { showToast("AI failed to understand", "error"); }
      } catch (err) { showToast("Network error during AI processing", "error"); }
      
      setIsProcessingVoice(false); setLiveTranscript(""); 
    };
    recognition.start();
  };

  const handleInputChange = (e: any) => { const { name, value, type, checked } = e.target; setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value }); };
  const selectHospitalForVisit = (hospitalId: string, type: "Walk-in" | "Schedule") => { setActiveHospitalId(hospitalId); setActiveTab(type); };

  const handleFileUpload = async (file: File) => {
    try {
      const res = await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "getUploadUrl", fileName: file.name, fileType: file.type }) });
      const { uploadUrl, fileUrl } = await res.json();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      return fileUrl;
    } catch (err) { showToast("File upload failed", "error"); return ""; }
  };

  const checkAvailability = async (e: React.FormEvent) => {
    e.preventDefault(); if (!bookingDate) return showToast("Please select a date first.", "error"); setLoading(true);
    try {
      const res = await fetch(`/api/queue?type=appointments&department=${selectedDept}&date=${bookingDate}&hospitalId=${activeHospitalId}`);
      const data = await res.json();
      if (!res.ok) { showToast(`Error: ${data.details || data.error}`, "error"); setLoading(false); return; }
      setBookedTimeSlots(Array.isArray(data) ? data.map((app: any) => app.timeSlot) : []); setShowSlots(true);
    } catch (error) { showToast("Network error.", "error"); }
    setLoading(false);
  };

  const confirmBooking = async () => {
    if (!selectedTimeSlot || !formData.name || !formData.symptoms) return showToast("Please fill all details.", "error"); setLoading(true);
    try {
      let uploadedDocUrl = ""; if (selectedFile) uploadedDocUrl = await handleFileUpload(selectedFile);
      const res = await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "bookAppointment", department: selectedDept, date: bookingDate, timeSlot: selectedTimeSlot, patientName: formData.name, email: formData.email, phone: formData.phone, symptoms: formData.symptoms, documentUrl: uploadedDocUrl, hospitalId: activeHospitalId }) });
      const responseData = await res.json();
      
      if (!res.ok) { showToast(`Booking Failed: ${responseData.details}`, "error"); checkAvailability({ preventDefault: () => {} } as React.FormEvent); } 
      else { 
        showToast("✅ Appointment Booked!"); 
        setFormData({ name: '', email: '', phone: '', age: '', address: '', symptoms: '', isEmergency: false }); 
        setSelectedFile(null); setSelectedTimeSlot(""); setShowSlots(false); 
        setBookingDate(todayDateString); // FIX: RESET TO TODAY
        setActiveTab("City View"); 
      }
    } catch (error) { showToast("Error booking appointment.", "error"); }
    setLoading(false);
  };

  const calculateRealWaitTime = async (dept: string, hId: string) => {
    try {
      const res = await fetch(`/api/queue?department=Archive&hospitalId=${hId}`); const data = await res.json();
      const deptHistory = data.filter((p: any) => p.department === dept && p.calledAt);
      deptHistory.sort((a: any, b: any) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());
      const last5 = deptHistory.slice(0, 5);
      if (last5.length >= 2) {
        let totalTimeDiff = 0, validPairs = 0;
        for (let i = 0; i < last5.length - 1; i++) {
          const diffInMinutes = (new Date(last5[i].calledAt).getTime() - new Date(last5[i+1].calledAt).getTime()) / 60000;
          if (diffInMinutes > 0 && diffInMinutes < 60) { totalTimeDiff += diffInMinutes; validPairs++; }
        }
        if (validPairs > 0) setRealAvgConsultTime(Math.max(5, Math.round(totalTimeDiff / validPairs)));
      }
    } catch (error) { console.error(error); }
  };

  const addPatient = async (e: React.FormEvent) => {
    e.preventDefault(); if (!formData.name || !formData.symptoms) return; setLoading(true); 
    try {
      let uploadedDocUrl = ""; if (selectedFile) uploadedDocUrl = await handleFileUpload(selectedFile);
      const res = await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...formData, documentUrl: uploadedDocUrl, hospitalId: activeHospitalId }) });
      const responseData = await res.json();
      if (!res.ok) { setLoading(false); return showToast(responseData.details || responseData.error, "error"); }
      
      const assignedDept = responseData.department || "General";
      setMyTicket({ name: formData.name, department: assignedDept, hospitalId: activeHospitalId, Timestamp: responseData.Timestamp, arrivalStatus: "Pending" });
      setRatingSubmitted(false); calculateRealWaitTime(assignedDept, activeHospitalId);
      setFormData({ ...formData, name: '', age: '', address: '', symptoms: '', isEmergency: false }); 
      setSelectedFile(null); if (responseData.department) setSelectedDept(responseData.department);
      setActiveTab("My Ticket"); showToast("Triage complete! You are in the queue.");
    } catch (error) { showToast("Error submitting triage.", "error"); }
    setLoading(false);
  };

  const submitRating = async (stars: number) => {
    if (!myTicket) return; setRatingSubmitted(true);
    try { await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "submitRating", Timestamp: myTicket.Timestamp, rating: stars }) }); showToast(t('feedback_saved')); } 
    catch (error) { console.error("Rating failed", error); }
  };

  const markArrived = async () => {
    if (!myTicket) return;
    setVerifyingGPS(true);

    if (!navigator.geolocation) { setVerifyingGPS(false); return showToast(t('gps_error'), "error"); }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLat = position.coords.latitude; const userLng = position.coords.longitude;
      const targetHospital = NETWORK_HOSPITALS.find(h => h.id === myTicket.hospitalId);
      if (!targetHospital) return setVerifyingGPS(false);
      const distanceInMeters = calculateDistance(userLat, userLng, targetHospital.lat, targetHospital.lng);

      if (distanceInMeters > 500) { setVerifyingGPS(false); return showToast(t('too_far'), "error"); }

      try { 
        await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "markArrived", department: myTicket.department, Timestamp: myTicket.Timestamp }) }); 
        setMyTicket({...myTicket, arrivalStatus: "Arrived"}); showToast(t('arrival_confirmed')); 
      } catch (error) { showToast("Error confirming arrival", "error"); }
      setVerifyingGPS(false);

    }, (error) => { setVerifyingGPS(false); showToast(t('gps_error'), "error"); });
  };

  const markNoShow = async (patient: any) => {
    if (!confirm(`Mark ${patient.patientName} as No-Show and remove from queue?`)) return;
    try {
      await fetch('/api/queue', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...patient, isNoShow: true }) });
      showToast(`${patient.patientName} marked as No-Show.`, "error"); fetchQueue("Live", selectedDept, false);
      fetch('/api/queue?department=Archive').then(res => res.json()).then(data => setArchiveData(data)).catch(console.error);
    } catch (error) { showToast("Error marking No-Show", "error"); }
  };

  const updateDoctorState = async (newStatus: string, breakMinutes: number = 0) => {
    const resumeTime = breakMinutes > 0 ? new Date(Date.now() + breakMinutes * 60000).toISOString() : null;
    try {
      await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "updateDoctorStatus", department: selectedDept, hospitalId: activeHospitalId, docStatus: newStatus, resumeTime: resumeTime }) });
      setSystemState({ docStatus: newStatus, resumeTime: resumeTime || undefined }); showToast(`Status updated to ${newStatus}`);
    } catch (err) { showToast("Failed to update status", "error"); }
  };

  const saveHospitalConfig = async () => {
    try { await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "updateHospitalConfig", hospitalId: activeHospitalId, baseFee: hospitalFee }) }); showToast(`Hospital settings saved!`); } 
    catch (err) { showToast("Failed to save settings", "error"); }
  };

  const startTreatment = async (patient: any) => {
    setTreatingPatient(patient); setPrescriptionData({ diagnosis: "", medicines: [{ name: "", dosage: "", duration: "" }], followUpDays: 0 }); setPatientTimeline([]); setLoadingHistory(true); setShowTransfer(false); setTransferDept(patient.department === "General" ? "Cardiology" : "General"); setTransferNotes("");

    try {
      const res = await fetch(`/api/queue?department=Archive&hospitalId=${activeHospitalId}`); const data = await res.json();
      const history = data.filter((p: any) => {
        const cEmail = (patient.email || "").trim().toLowerCase(); const pEmail = (p.email || "").trim().toLowerCase();
        const cName = (patient.patientName || "").trim().toLowerCase(); const pName = (p.patientName || "").trim().toLowerCase();
        if (cName !== pName) return false; if (cEmail !== "" && pEmail !== "") if (cEmail !== pEmail) return false; return true; 
      });
      setPatientTimeline(history.sort((a: any, b: any) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()));
    } catch (error) { console.error(error); }
    setLoadingHistory(false);
  };

  const handleTransfer = async () => {
    if (!treatingPatient) return;
    try {
      await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "transferPatient", oldDepartment: treatingPatient.department, Timestamp: treatingPatient.Timestamp, newDepartment: transferDept, transferNotes: transferNotes, patientData: treatingPatient }) });
      showToast(`Patient successfully transferred to ${transferDept}!`); setTreatingPatient(null); fetchQueue("Live", selectedDept, false);
    } catch (error) { showToast("Transfer failed", "error"); }
  };

  const handleMedicineChange = (index: number, field: string, value: string) => { const newMedicines = [...prescriptionData.medicines]; newMedicines[index] = { ...newMedicines[index], [field]: value }; setPrescriptionData({ ...prescriptionData, medicines: newMedicines }); };
  const addMedicineRow = () => { setPrescriptionData({ ...prescriptionData, medicines: [...prescriptionData.medicines, { name: "", dosage: "", duration: "" }] }); };

  const finishTreatment = async () => {
    try {
      window.print();
      const completedPatient = { ...treatingPatient, diagnosis: prescriptionData.diagnosis, medicines: prescriptionData.medicines.filter(m => m.name !== ""), followUpDays: prescriptionData.followUpDays, assignedDoctor: "Attending Physician" };
      await fetch('/api/queue', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(completedPatient) });
      showToast("Prescription saved & emailed securely!"); setTreatingPatient(null); fetchQueue("Live", selectedDept, false); 
      fetch('/api/queue?department=Archive').then(res => res.json()).then(data => setArchiveData(data)).catch(console.error); 
    } catch (error) { showToast("Error saving prescription.", "error"); }
  };

  const filteredPatients = patients.filter(p => { const s = searchTerm.toLowerCase(); return (p.patientName || "").toLowerCase().includes(s) || (p.symptoms || "").toLowerCase().includes(s); });
  
  let myQueuePosition = 0, estimatedWait = 0;
  if (userRole === "Patient" && myTicket && activeTab === "My Ticket") {
    const deptQueue = patients.filter(p => p.department === myTicket.department && p.hospitalId === myTicket.hospitalId);
    deptQueue.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    const myIndex = deptQueue.findIndex(p => (p.patientName || "").toLowerCase() === myTicket.name.toLowerCase());
    
    if (myIndex !== -1) { 
      myQueuePosition = myIndex + 1; 
      let breakPenalty = 0;
      if (systemState.docStatus === "Break" && systemState.resumeTime) {
        const diffInMs = new Date(systemState.resumeTime).getTime() - new Date().getTime();
        if (diffInMs > 0) breakPenalty = Math.ceil(diffInMs / 60000);
      }
      estimatedWait = (myIndex * realAvgConsultTime) + breakPenalty; 
    }
  }

  const emergenciesCount = patients.filter(p => p.urgency === 'High').length;
  const activeHospitalName = NETWORK_HOSPITALS.find(h => h.id === activeHospitalId)?.name;
  const hospitalArchive = archiveData.filter(p => p.hospitalId === activeHospitalId);
  const ratedArchivePatients = hospitalArchive.filter(p => p.rating && p.rating > 0);
  const avgHospitalRating = ratedArchivePatients.length > 0 ? (ratedArchivePatients.reduce((sum, p) => sum + p.rating, 0) / ratedArchivePatients.length).toFixed(1) : "N/A";
  const noShowCount = hospitalArchive.filter(p => p.status === "No-Show").length;
  const noShowRate = hospitalArchive.length > 0 ? Math.round((noShowCount / hospitalArchive.length) * 100) : 0;
  const myGhostCount = formData.email ? archiveData.filter(p => p.email === formData.email && p.status === "No-Show").length : 0;
  const hasGhostWarning = myGhostCount >= 3;
  const myFollowUps = archiveData.filter(p => p.email === formData.email && p.followUpDate && p.followUpDate >= todayDateString);

  const todayArchive = hospitalArchive.filter(p => p.calledAt && p.calledAt.startsWith(todayDateString) && p.status !== "No-Show");
  const totalPatientsToday = todayArchive.length;
  const estimatedRevenue = totalPatientsToday * hospitalFee;

  const deptCounts: Record<string, number> = {};
  let maxDeptCount = 1;
  hospitalArchive.forEach(p => { 
    if(p.department !== "Archive") {
       deptCounts[p.department] = (deptCounts[p.department] || 0) + 1; 
       if(deptCounts[p.department] > maxDeptCount) maxDeptCount = deptCounts[p.department];
    }
  });

  const doctorStats: Record<string, {treated: number, totalTime: number, ratingSum: number, ratingCount: number}> = {};
  hospitalArchive.forEach(p => {
     if(p.status === "Treated" && p.assignedDoctor) {
        if(!doctorStats[p.assignedDoctor]) doctorStats[p.assignedDoctor] = { treated: 0, totalTime: 0, ratingSum: 0, ratingCount: 0 };
        doctorStats[p.assignedDoctor].treated += 1;
        if(p.rating > 0) { doctorStats[p.assignedDoctor].ratingSum += p.rating; doctorStats[p.assignedDoctor].ratingCount += 1; }
        const timeSpent = (new Date(p.calledAt).getTime() - new Date(p.Timestamp).getTime()) / 60000;
        if(timeSpent > 0 && timeSpent < 120) doctorStats[p.assignedDoctor].totalTime += timeSpent;
     }
  });

  const doctorLeaderboard = Object.keys(doctorStats).map(doc => ({
      name: doc,
      treated: doctorStats[doc].treated,
      avgTime: doctorStats[doc].treated > 0 ? Math.round(doctorStats[doc].totalTime / doctorStats[doc].treated) : 0,
      avgRating: doctorStats[doc].ratingCount > 0 ? (doctorStats[doc].ratingSum / doctorStats[doc].ratingCount).toFixed(1) : "N/A"
  })).sort((a,b) => b.treated - a.treated);

  const getPillSchedule = () => {
    if (!formData.email) return null;
    const myHistory = archiveData.filter(p => p.email === formData.email && p.medicines && p.medicines.length > 0);
    const latest = myHistory.sort((a,b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())[0];
    if(!latest) return null;

    const schedule = { morning: [] as string[], afternoon: [] as string[], night: [] as string[] };
    latest.medicines.forEach((med: any) => {
      const parts = med.dosage.split('-');
      if(parts[0] && parts[0] !== '0') schedule.morning.push(med.name);
      if(parts[1] && parts[1] !== '0') schedule.afternoon.push(med.name);
      if(parts[2] && parts[2] !== '0') schedule.night.push(med.name);
    });
    return { doctor: latest.assignedDoctor, date: latest.calledAt, phone: latest.phone, schedule };
  };
  const myPillbox = getPillSchedule();

  const enableSMSReminders = async () => {
    if (!myPillbox || !myPillbox.phone) return showToast("No valid phone number on file.", "error");
    setSmsLoading(true);
    try {
      const msg = `SmartOPD Alert: Daily pillbox set! Morning: ${myPillbox.schedule.morning.join(',') || 'None'}. Night: ${myPillbox.schedule.night.join(',') || 'None'}. Get well soon!`;
      const res = await fetch('/api/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: "sendSMSReminder", phone: myPillbox.phone, message: msg }) });
      const data = await res.json();
      if(res.ok) { showToast("SMS Sent! You are now subscribed to alerts.", "success"); } 
      else { showToast(`SMS Blocked: Check AWS SNS Sandbox.`, "error"); console.error("SNS Error:", data); }
    } catch(e) { showToast("Network error trying to send SMS", "error"); }
    setSmsLoading(false);
  };

  if (!userRole) return <div className="h-screen w-full flex items-center justify-center bg-slate-900"><Activity className="text-blue-500 animate-spin" size={48} /></div>;

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      <aside className="print:hidden w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 shrink-0">
        <div className="h-20 flex items-center px-6 bg-slate-950 border-b border-slate-800"><Activity className="text-blue-500 mr-3" size={28} /><h1 className="text-xl font-black text-white tracking-tight">Smart<span className="text-blue-500">OPD</span></h1></div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <p className="px-2 text-xs font-bold tracking-widest text-slate-500 mb-4 uppercase">{userRole} Menu</p>
          
          {userRole === "Admin" && (
            <>
              <button onClick={() => setActiveTab("Super Panel")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "Super Panel" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><BarChart3 size={20} className="mr-3" /> Super Panel</button>
              <button onClick={() => setActiveTab("Settings")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "Settings" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><Settings size={20} className="mr-3" /> Hospital Settings</button>
            </>
          )}

          {userRole === "Doctor" && (
            <>
              <button onClick={() => setActiveTab("Dashboard")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "Dashboard" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><LayoutDashboard size={20} className="mr-3" /> Live Queue</button>
              <button onClick={() => setActiveTab("Appointments")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "Appointments" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><Calendar size={20} className="mr-3" /> Appointments</button>
              <button onClick={() => setActiveTab("Archive")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "Archive" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><FolderClock size={20} className="mr-3" /> Patient EMR Archive</button>
            </>
          )}
          
          {userRole === "Patient" && (
            <>
              <button onClick={() => setActiveTab("City View")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "City View" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><Building2 size={20} className="mr-3" /> Hospital Network</button>
              <button onClick={() => setActiveTab("Pillbox")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "Pillbox" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><Pill size={20} className="mr-3" /> {t('my_pillbox')}</button>
              <button onClick={() => setActiveTab("Follow-ups")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "Follow-ups" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><CalendarClock size={20} className="mr-3" /> {t('my_followups')}</button>
              {myTicket && <button onClick={() => setActiveTab("My Ticket")} className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors ${activeTab === "My Ticket" ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"}`}><Activity size={20} className="mr-3" /> Live Ticket Status</button>}
            </>
          )}
        </nav>
        <div className="p-4 bg-slate-950 border-t border-slate-800"><button onClick={() => { if (signOut) signOut(); }} className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"><LogOut size={20} className="mr-3" /> Sign Out</button></div>
      </aside>

      <div className="print:hidden flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 w-1/2">
            {userRole !== "Patient" ? (
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100"><Building2 size={18} className="text-indigo-600" /><span className="text-sm font-bold text-indigo-900 mr-2">Managing:</span><select value={activeHospitalId} onChange={(e) => setActiveHospitalId(e.target.value)} className="bg-transparent font-black text-indigo-700 outline-none cursor-pointer">{NETWORK_HOSPITALS.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></div>
            ) : (<h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><MapPin className="text-blue-600"/> {t('city_wide_network')}</h2>)}
          </div>
          <div className="flex items-center gap-6">
            {userRole === "Patient" && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full"><Globe size={16} className="text-slate-500" /><select value={lang} onChange={(e: any) => setLang(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"><option value="en">English</option><option value="hi">हिंदी</option><option value="gu">ગુજરાતી</option></select></div>
            )}
            {(activeTab === "Dashboard" || activeTab === "Archive") && (<select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="py-2 px-4 bg-white border border-slate-200 rounded-full text-sm font-semibold shadow-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"><option value="General">General Dept</option><option value="Cardiology">Cardiology</option><option value="Pediatrics">Pediatrics</option><option value="Orthopedics">Orthopedics</option><option value="Neurology">Neurology</option></select>)}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"><Bell size={22} />{userRole === "Doctor" && emergenciesCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>}</button>
            <div className={`h-8 w-8 rounded-full text-white flex items-center justify-center font-bold shadow-md ${userRole==='Admin'?'bg-indigo-600':userRole==='Doctor'?'bg-emerald-600':'bg-blue-600'}`}>{userRole.charAt(0)}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          {toast.show && (
            <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {toast.type === 'error' ? <AlertCircle size={20} /> : <Activity size={20} />}<p className="font-semibold">{toast.msg}</p>
            </div>
          )}

          {userRole === "Admin" && activeTab === "Super Panel" && (
             <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-end mb-4"><div><h2 className="text-3xl font-black text-slate-800">Command Center</h2><p className="text-slate-500 font-medium">Live analytics for {activeHospitalName}</p></div><button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-black flex items-center gap-2"><Printer size={16}/> Export PDF</button></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start"><p className="text-sm font-bold text-slate-400 uppercase">Treated Today</p><Activity className="text-blue-500" size={20}/></div><p className="text-4xl font-black text-slate-800 mt-2">{totalPatientsToday}</p><p className="text-xs font-bold text-emerald-500 mt-2 flex items-center"><TrendingUp size={12} className="mr-1"/> +12% from yesterday</p></div>
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start"><p className="text-sm font-bold text-slate-400 uppercase">Est. Revenue</p><IndianRupee className="text-emerald-500" size={20}/></div><p className="text-4xl font-black text-slate-800 mt-2">₹{estimatedRevenue.toLocaleString()}</p><p className="text-xs font-bold text-slate-400 mt-2">Based on ₹{hospitalFee} Avg Fee</p></div>
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start"><p className="text-sm font-bold text-slate-400 uppercase">Satisfaction</p><Star className="text-yellow-500" size={20}/></div><p className="text-4xl font-black text-slate-800 mt-2">{avgHospitalRating}</p><p className="text-xs font-bold text-slate-400 mt-2">Average across all doctors</p></div>
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="flex justify-between items-start"><p className="text-sm font-bold text-slate-400 uppercase">No-Show Rate</p><UserX className="text-orange-500" size={20}/></div><p className="text-4xl font-black text-orange-600 mt-2">{noShowRate}%</p><p className="text-xs font-bold text-slate-400 mt-2">Total missed appointments</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-6">Historical Department Load</h3>
                      <div className="h-48 flex items-end justify-around gap-2 px-2 border-b border-slate-100 pb-2">
                        {Object.keys(deptCounts).map(dept => {
                           const heightPct = (deptCounts[dept] / maxDeptCount) * 100;
                           return (<div key={dept} className="flex flex-col items-center group w-full"><div className="w-full bg-blue-100 rounded-t-sm relative transition-all duration-500 hover:bg-blue-200" style={{height: `${heightPct}%`}}><div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold bg-slate-800 text-white px-2 py-1 rounded transition-opacity">{deptCounts[dept]}</div></div><p className="text-[10px] font-bold text-slate-400 uppercase mt-2 truncate w-full text-center" title={dept}>{dept.substring(0,4)}</p></div>);
                        })}
                      </div>
                   </div>
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-y-auto max-h-72">
                      <h3 className="font-bold text-slate-800 mb-4">Doctor Performance Matrix</h3>
                      <table className="w-full text-left">
                        <thead><tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"><th className="pb-3">Doctor</th><th className="pb-3">Treated</th><th className="pb-3">Avg Time</th><th className="pb-3">Rating</th></tr></thead>
                        <tbody>{doctorLeaderboard.length === 0 ? (<tr><td colSpan={4} className="py-4 text-center text-slate-400">No data available</td></tr>) : doctorLeaderboard.map((doc, i) => (<tr key={i} className="border-b border-slate-50 last:border-none"><td className="py-3 font-bold text-slate-800">Dr. {doc.name}</td><td className="py-3 font-medium text-slate-600">{doc.treated}</td><td className="py-3 font-medium text-slate-600">{doc.avgTime}m</td><td className="py-3 font-bold text-yellow-600 flex items-center gap-1 mt-3"><Star size={12} fill="currentColor"/> {doc.avgRating}</td></tr>))}</tbody>
                      </table>
                   </div>
                </div>
             </div>
          )}

          {userRole === "Admin" && activeTab === "Settings" && (
             <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-6">
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><Settings className="text-indigo-600"/> Hospital Configuration</h2>
                <div className="space-y-6"><div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Base Consultation Fee (INR)</label><div className="flex items-center"><span className="p-3 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg font-bold text-slate-500">₹</span><input type="number" value={hospitalFee} onChange={(e) => setHospitalFee(parseInt(e.target.value))} className="w-full p-3 border border-slate-200 rounded-r-lg outline-none focus:ring-2 focus:ring-indigo-500 font-bold" /></div><p className="text-xs text-slate-500 mt-2">This is used to calculate the Estimated Revenue on the Super Panel.</p></div><button onClick={saveHospitalConfig} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors">Save Hospital Settings</button></div>
             </div>
          )}

          {userRole === "Doctor" && activeTab === "Dashboard" && (
            <>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                <div><h3 className="font-black text-slate-800">Doctor Queue Status</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">For {selectedDept} Department</p></div>
                <div className="flex gap-3 bg-white p-1.5 rounded-xl border border-slate-200"><button onClick={() => updateDoctorState("Available")} className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${systemState.docStatus === "Available" ? "bg-emerald-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}><Activity size={16}/> Available</button><button onClick={() => updateDoctorState("Break", 15)} className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${systemState.docStatus === "Break" ? "bg-orange-500 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}><Coffee size={16}/> 15m Break</button><button onClick={() => updateDoctorState("EmergencyOnly")} className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all ${systemState.docStatus === "EmergencyOnly" ? "bg-red-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-100"}`}><ShieldAlert size={16}/> Emergency Only</button></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Queue Total</p><p className="text-2xl font-black text-slate-800">{patients.length}</p></div></div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Clock size={20} /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Wait</p><p className="text-2xl font-black text-slate-800">{realAvgConsultTime} <span className="text-sm">min</span></p></div></div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Star size={20} /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</p><p className="text-2xl font-black text-slate-800">{avgHospitalRating}</p></div></div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle size={20} /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergencies</p><p className="text-2xl font-black text-slate-800">{emergenciesCount}</p></div></div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><UserX size={20} /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No-Show Rate</p><p className="text-2xl font-black text-orange-600">{noShowRate}%</p></div></div>
              </div>
            </>
          )}

          {userRole === "Patient" && activeTab === "City View" && (
            <div className="max-w-5xl mx-auto mt-6">
              <div className="mb-10"><h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">{t('find_a_hospital')}</h2><p className="text-lg text-slate-500">{t('select_location')}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {NETWORK_HOSPITALS.map(hospital => {
                  const hospitalQueue = cityWideQueue.filter(p => p.hospitalId === hospital.id && p.Timestamp !== "SYSTEM_STATE").length;
                  const estWait = hospitalQueue * 12; 
                  return (
                    <div key={hospital.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all transform hover:-translate-y-1 group">
                      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-${hospital.color}-100 text-${hospital.color}-600`}><Building2 size={24} /></div>
                      <h3 className="text-xl font-black text-slate-800 mb-1">{hospital.name}</h3><p className="text-sm font-semibold text-slate-400 mb-6 flex items-center gap-1"><MapPin size={14}/> {hospital.location}</p>
                      <div className="flex justify-between items-end mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('live_queue')}</p><p className="text-2xl font-black text-slate-800">{hospitalQueue} <span className="text-sm text-slate-500 font-medium">{t('waiting')}</span></p></div>
                        <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('est_wait')}</p><p className={`text-2xl font-black ${estWait > 45 ? 'text-orange-500' : 'text-emerald-500'}`}>{estWait} <span className="text-sm font-medium">{t('min')}</span></p></div>
                      </div>
                      <div className="flex gap-2"><button onClick={() => selectHospitalForVisit(hospital.id, "Walk-in")} className="flex-1 py-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold rounded-lg transition-colors">{t('walk_in')}</button><button onClick={() => selectHospitalForVisit(hospital.id, "Schedule")} className="flex-1 py-3 bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white font-bold rounded-lg transition-colors border border-slate-200 hover:border-slate-900">{t('schedule')}</button></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {userRole === "Patient" && activeTab === "Pillbox" && (
             <div className="max-w-4xl mx-auto mt-6">
               <div className="mb-10 text-center">
                 <Pill className="mx-auto text-emerald-500 mb-4" size={48} />
                 <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">{t('my_pillbox')}</h2>
                 <p className="text-lg text-slate-500">Track your daily medicines to ensure a quick recovery.</p>
               </div>

               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
                 <div className="flex gap-4">
                   <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder={t('email_presc')} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
                   <button onClick={() => fetchQueue("Archive", "Archive", false)} className="px-8 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md">{t('check_records')}</button>
                 </div>
               </div>

               {formData.email && (
                 <div>
                   {!myPillbox || (myPillbox.schedule.morning.length === 0 && myPillbox.schedule.afternoon.length === 0 && myPillbox.schedule.night.length === 0) ? (
                     <div className="text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                       <CheckCircle2 className="mx-auto text-slate-300 mb-2" size={32}/>
                       <p className="text-slate-500 font-medium">No active prescriptions found.</p>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                           <div>
                             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Prescription</p>
                             <p className="text-xl font-black text-slate-800">Dr. {myPillbox.doctor}</p>
                           </div>
                           <button onClick={enableSMSReminders} disabled={smsLoading} className="px-6 py-3 bg-[#25D366] hover:bg-[#1da851] text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
                             {smsLoading ? <Activity size={18} className="animate-spin"/> : <Smartphone size={18}/>} 
                             {t('whatsapp_alerts')}
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                              <h3 className="font-black text-amber-800 text-xl mb-4 border-b border-amber-200 pb-2">{t('morning')} <span className="text-sm font-bold text-amber-600 ml-2">9:00 AM</span></h3>
                              {myPillbox.schedule.morning.length === 0 ? <p className="text-amber-600/50 italic text-sm">No medicine</p> : (
                                <ul className="space-y-3">
                                  {myPillbox.schedule.morning.map((med, i) => (
                                    <li key={i} onClick={() => setCheckedPills(prev => prev.includes(`m-${med}`) ? prev.filter(p => p !== `m-${med}`) : [...prev, `m-${med}`])} className="flex items-center gap-3 cursor-pointer group">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${checkedPills.includes(`m-${med}`) ? 'bg-amber-500 border-amber-500' : 'border-amber-400 group-hover:bg-amber-100'}`}>
                                        {checkedPills.includes(`m-${med}`) && <CheckCircle2 size={14} className="text-white"/>}
                                      </div>
                                      <span className={`font-bold transition-all ${checkedPills.includes(`m-${med}`) ? 'text-amber-900/50 line-through' : 'text-amber-900'}`}>{med}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                           </div>
                           
                           <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                              <h3 className="font-black text-blue-800 text-xl mb-4 border-b border-blue-200 pb-2">{t('afternoon')} <span className="text-sm font-bold text-blue-600 ml-2">1:00 PM</span></h3>
                              {myPillbox.schedule.afternoon.length === 0 ? <p className="text-blue-600/50 italic text-sm">No medicine</p> : (
                                <ul className="space-y-3">
                                  {myPillbox.schedule.afternoon.map((med, i) => (
                                    <li key={i} onClick={() => setCheckedPills(prev => prev.includes(`a-${med}`) ? prev.filter(p => p !== `a-${med}`) : [...prev, `a-${med}`])} className="flex items-center gap-3 cursor-pointer group">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${checkedPills.includes(`a-${med}`) ? 'bg-blue-500 border-blue-500' : 'border-blue-400 group-hover:bg-blue-100'}`}>
                                        {checkedPills.includes(`a-${med}`) && <CheckCircle2 size={14} className="text-white"/>}
                                      </div>
                                      <span className={`font-bold transition-all ${checkedPills.includes(`a-${med}`) ? 'text-blue-900/50 line-through' : 'text-blue-900'}`}>{med}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                           </div>

                           <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
                              <h3 className="font-black text-indigo-800 text-xl mb-4 border-b border-indigo-200 pb-2">{t('night')} <span className="text-sm font-bold text-indigo-600 ml-2">9:00 PM</span></h3>
                              {myPillbox.schedule.night.length === 0 ? <p className="text-indigo-600/50 italic text-sm">No medicine</p> : (
                                <ul className="space-y-3">
                                  {myPillbox.schedule.night.map((med, i) => (
                                    <li key={i} onClick={() => setCheckedPills(prev => prev.includes(`n-${med}`) ? prev.filter(p => p !== `n-${med}`) : [...prev, `n-${med}`])} className="flex items-center gap-3 cursor-pointer group">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${checkedPills.includes(`n-${med}`) ? 'bg-indigo-500 border-indigo-500' : 'border-indigo-400 group-hover:bg-indigo-100'}`}>
                                        {checkedPills.includes(`n-${med}`) && <CheckCircle2 size={14} className="text-white"/>}
                                      </div>
                                      <span className={`font-bold transition-all ${checkedPills.includes(`n-${med}`) ? 'text-indigo-900/50 line-through' : 'text-indigo-900'}`}>{med}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                           </div>
                        </div>
                     </div>
                   )}
                 </div>
               )}
             </div>
          )}

          {userRole === "Patient" && activeTab === "Follow-ups" && (
            <div className="max-w-3xl mx-auto mt-6">
              <div className="mb-10 text-center"><CalendarClock className="mx-auto text-blue-600 mb-4" size={48} /><h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">{t('my_followups')}</h2><p className="text-lg text-slate-500">Enter your email to view required return visits requested by your doctor.</p></div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8"><div className="flex gap-4"><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder={t('email_presc')} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" /><button onClick={() => fetchQueue("Archive", "Archive", false)} className="px-8 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">{t('check_records')}</button></div></div>
              {formData.email && (<div>{myFollowUps.length === 0 ? (<div className="text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300"><Activity className="mx-auto text-slate-300 mb-2" size={32}/><p className="text-slate-500 font-medium">{t('no_followup')}</p></div>) : (<div className="space-y-4">{myFollowUps.map((record, i) => (<div key={record.Timestamp || i} className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-xl flex justify-between items-center shadow-sm"><div><p className="text-xs font-black uppercase text-amber-600 tracking-widest mb-1">{t('follow_up_req')}</p><h3 className="text-xl font-bold text-slate-800 mb-1">Return to {record.department} by {new Date(record.followUpDate).toLocaleDateString()}</h3><p className="text-slate-600 text-sm">Requested by Dr. {record.assignedDoctor} • Previous Diagnosis: {record.diagnosis}</p></div><button onClick={() => { setActiveHospitalId(record.hospitalId); setSelectedDept(record.department); setActiveTab("Schedule"); setBookingDate(record.followUpDate); }} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-md transition-colors whitespace-nowrap">{t('book_followup')}</button></div>))}</div>)}</div>)}
            </div>
          )}

          {userRole === "Doctor" && (activeTab === "Dashboard" || activeTab === "Archive") && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-0">
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">{activeTab === "Dashboard" ? `${selectedDept} Waiting Room` : "Patient EMR Archive"}</h2>
                    {activeTab === "Dashboard" && <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE SYNC</span>}
                  </div>
                  <div className="p-4">
                    {loading ? (Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-slate-100 h-24 rounded-xl mb-3"></div>)) : filteredPatients.length === 0 ? (<div className="text-center py-20"><Activity size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-lg font-semibold text-slate-500">The waiting room is clear.</p></div>) : (
                      <div className="space-y-3">
                        {filteredPatients.map((patient, index) => (
                          <div key={patient.Timestamp || index} className="group flex flex-col md:flex-row justify-between items-center p-5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-bold text-slate-800 text-lg">{patient.patientName}</span>
                                {activeTab === "Dashboard" && (<span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${patient.arrivalStatus === "Arrived" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>{patient.arrivalStatus === "Arrived" ? "✓ Checked In" : "Pending Arrival"}</span>)}
                                {activeTab === "Archive" && patient.status === "No-Show" && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md">NO-SHOW</span>}
                              </div>
                              <span className="text-sm text-slate-500 font-medium">Issue: <span className="text-slate-700">{patient.symptoms}</span></span>
                              {activeTab === "Dashboard" && patient.transferNotes && <span className="inline-block mt-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-md font-bold flex items-center gap-2 max-w-fit"><ArrowRightLeft size={14}/> Transferred: {patient.transferNotes}</span>}
                            </div>
                            {activeTab === "Dashboard" && (
                              <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => startTreatment(patient)} className="px-6 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold rounded-lg transition-colors">Treat Patient</button>
                                <button onClick={() => markNoShow(patient)} className="p-2.5 bg-white text-orange-500 border border-slate-200 hover:bg-orange-50 hover:border-orange-200 rounded-lg transition-colors tooltip-trigger" title="Mark as No-Show"><UserX size={20} /></button>
                              </div>
                            )}
                            {activeTab === "Archive" && patient.diagnosis && <div className="text-right ml-4 max-w-sm"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Diagnosis</p><p className="text-sm text-slate-700 truncate">{patient.diagnosis}</p></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
            </div>
          )}

          {userRole !== "Admin" && (activeTab === "Appointments" || activeTab === "Schedule") && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-4xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h2 className="text-2xl font-bold text-slate-800">Schedule at {activeHospitalName}</h2>{userRole === "Patient" && <button onClick={() => setActiveTab("City View")} className="text-sm font-bold text-blue-600 hover:underline">← Back</button>}</div>
              <div className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100"><input type="date" value={bookingDate || todayDateString} onChange={(e) => setBookingDate(e.target.value)} className="p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white" />{userRole === "Patient" && !showSlots && <button onClick={checkAvailability} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">Find Slots</button>}</div>
              {userRole === "Doctor" ? (
                <div className="space-y-3">{loading ? (Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-slate-100 h-20 rounded-xl mb-3"></div>)) : appointmentList.length === 0 ? (<p className="text-slate-500 text-center py-10 font-medium">No appointments scheduled for this date.</p>) : appointmentList.map((app, i) => (<div key={app.timeSlot || i} className="flex justify-between items-center p-5 bg-white rounded-xl border border-slate-100 shadow-sm"><div><p className="font-bold text-lg text-slate-800">{app.patientName}</p><p className="text-sm text-slate-500">{app.symptoms}</p></div><span className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 tracking-wide">{app.timeSlot}</span></div>))}</div>
              ) : (
                <div className="max-w-3xl">
                  {hasGhostWarning && <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl flex items-start gap-3"><AlertCircle className="shrink-0 mt-0.5" size={20}/><p className="text-sm font-medium">{t('no_show_warning')}</p></div>}
                  <form className="grid grid-cols-2 gap-6 mb-8">
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('full_name')}</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('email_presc')}</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" /></div>
                    <div className="col-span-2"><label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('phone_queue')}</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" /></div>
                    <div className="col-span-2"><label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('symptoms_desc')}</label><textarea name="symptoms" value={formData.symptoms} onChange={handleInputChange} rows={3} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" /></div>
                    <div className="col-span-2">
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('upload_doc')}</label>
                       <div className="flex items-center gap-4"><label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 font-bold rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"><UploadCloud size={20}/>{selectedFile ? selectedFile.name : t('upload_doc')}<input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" accept=".pdf,image/*" /></label>{selectedFile && <button type="button" onClick={() => setSelectedFile(null)} className="p-4 text-red-500 hover:bg-red-50 rounded-xl"><X size={20}/></button>}</div>
                    </div>
                  </form>
                  {showSlots && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-4">Available Slots</h4>
                      <div className="grid grid-cols-4 gap-3 mb-6">{allTimeSlots.map((slot) => { const isDisabled = bookedTimeSlots.includes(slot) || isSlotInPast(slot, bookingDate); return <button key={slot} type="button" disabled={isDisabled} onClick={() => setSelectedTimeSlot(slot)} className={`py-3 rounded-lg font-bold text-sm transition-all ${isDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through' : selectedTimeSlot === slot ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'bg-white text-blue-600 border border-blue-200 hover:border-blue-400'}`}>{slot}</button>})}</div>
                      {selectedTimeSlot && <button onClick={confirmBooking} disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">{loading ? <Activity size={20} className="animate-spin" /> : "Confirm Booking"}</button>}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {userRole === "Patient" && activeTab === "Walk-in" && (
            <div className="p-10 max-w-2xl mx-auto mt-4 bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-10 border-b border-slate-100 pb-6"><div><h2 className="text-3xl font-black text-slate-800 mb-2">{t('walk_in_triage')}</h2><p className="text-slate-500 font-medium flex items-center gap-2"><Building2 size={16}/> {t('checked_into')} <strong className="text-blue-600">{activeHospitalName}</strong></p></div><button onClick={() => setActiveTab("City View")} className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">{t('change_hospital')}</button></div>
              {hasGhostWarning && <div className="mb-6 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl flex items-start gap-3"><AlertCircle className="shrink-0 mt-0.5" size={20}/><p className="text-sm font-medium">{t('no_show_warning')}</p></div>}
              <form onSubmit={addPatient} className="space-y-5">
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder={t('full_name')} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder={t('email_presc')} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder={t('phone_queue')} />
                </div>
                <textarea name="symptoms" required value={formData.symptoms} onChange={handleInputChange} rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder={t('symptoms_desc')} />
                
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('upload_doc')}</label>
                   <div className="flex items-center gap-4"><label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-200 bg-blue-50 text-blue-600 font-bold rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"><UploadCloud size={20}/>{selectedFile ? selectedFile.name : t('upload_doc')}<input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" accept=".pdf,image/*" /></label>{selectedFile && <button type="button" onClick={() => setSelectedFile(null)} className="p-4 text-red-500 hover:bg-red-50 rounded-xl"><X size={20}/></button>}</div>
                </div>

                <button type="submit" disabled={loading || verifyingGPS} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                  {loading ? <><Activity size={20} className="animate-spin" /> {selectedFile ? t('uploading') : t('processing')}</> : t('submit_ticket')}
                </button>
              </form>
            </div>
          )}

          {userRole === "Patient" && activeTab === "My Ticket" && myTicket && (
            <div className="p-10 md:p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
              {systemState.docStatus === "Break" && systemState.resumeTime && <div className="bg-orange-100 text-orange-800 border border-orange-200 p-4 rounded-xl mb-6 flex items-center justify-center gap-3 animate-in fade-in duration-500"><Clock size={20}/><p className="font-bold">{t('doc_on_break')} {new Date(systemState.resumeTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.</p></div>}
              {systemState.docStatus === "EmergencyOnly" && <div className="bg-red-100 text-red-800 border border-red-200 p-4 rounded-xl mb-6 flex items-center justify-center gap-3 animate-in fade-in duration-500"><ShieldAlert size={20}/><p className="font-bold">{t('doc_emergency')}</p></div>}
              
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 shadow-sm max-w-xl w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <h3 className="text-3xl font-black text-slate-800 mb-2 mt-4">{t('digital_ticket')}</h3>
                <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">{activeHospitalName}</p>
                <p className="text-slate-500 font-medium uppercase tracking-widest text-xs mb-10">{t('routed_to')} {myTicket.department}</p>
                
                {myQueuePosition > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"><p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-3">{t('position')}</p><p className="text-6xl font-black text-slate-800">#{myQueuePosition}</p></div>
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 ${systemState.docStatus === 'EmergencyOnly' ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`}></div>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-3">{t('est_wait')}</p>
                        {systemState.docStatus === "EmergencyOnly" ? <p className="text-4xl font-black text-red-600 mt-4">{t('delayed')}</p> : <p className="text-6xl font-black text-blue-600">{estimatedWait}<span className="text-xl text-slate-400 ml-1">{t('min')}</span></p>}
                      </div>
                    </div>
                    {myTicket.arrivalStatus !== "Arrived" ? (
                      <div className={`p-6 rounded-2xl border ${myQueuePosition <= 5 ? 'bg-orange-50 border-orange-200 animate-pulse' : 'bg-white border-slate-200'}`}>
                        {myQueuePosition <= 5 && <p className="text-orange-700 font-bold mb-4">{t('almost_up')}</p>}
                        <button onClick={markArrived} disabled={verifyingGPS} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                          {verifyingGPS ? <><Activity className="animate-spin" size={24}/> {t('gps_verifying')}</> : <><MapPinCheck size={24}/> {t('confirm_arrival')}</>}
                        </button>
                      </div>
                    ) : (<div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2"><MapPinCheck size={20}/> {t('arrival_confirmed')}</div>)}
                  </>
                ) : (
                  <div className="bg-white p-10 rounded-2xl border border-emerald-200 shadow-sm">
                    {!ratingSubmitted ? (
                      <>
                        <h4 className="text-2xl font-black text-slate-800 mb-2">{t('visit_complete')}</h4>
                        <p className="text-slate-500 font-medium mb-8">{t('feedback_prompt')}</p>
                        <div className="flex justify-center gap-2 mb-8">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => submitRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="transition-transform hover:scale-110 focus:outline-none">
                              <Star size={40} className={`${star <= hoverRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (<div className="mb-8"><div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><Activity size={32}/></div><h4 className="text-2xl font-black text-emerald-700">{t('feedback_saved')}</h4></div>)}
                    <button onClick={() => { setMyTicket(null); setActiveTab("City View"); }} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-black transition-colors">{t('return_home')}</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {treatingPatient && (
         <div className="print:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
                <div><h3 className="text-2xl font-black text-slate-800">Consultation: {treatingPatient.patientName}</h3><p className="text-sm font-bold text-red-500 uppercase tracking-wider mt-1">Issue: {treatingPatient.symptoms}</p></div>
                <button onClick={() => setTreatingPatient(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-slate-50">
                
                <div className="w-full md:w-1/3 border-r border-slate-200 p-8 overflow-y-auto bg-slate-50/50">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FolderClock size={16}/> Medical History</h4>
                  
                  {treatingPatient.documentUrl && (
                     <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Patient Uploaded Document</p>
                        <a href={treatingPatient.documentUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                           <FileText size={18}/> View Attached Report
                        </a>
                     </div>
                  )}

                  {loadingHistory ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 animate-pulse rounded-xl mb-4"></div>)
                  ) : patientTimeline.length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-xl border border-dashed border-slate-300"><p className="text-sm text-slate-500 font-medium">No prior records found.</p></div>
                  ) : (
                    <div className="border-l-2 border-slate-200 ml-4 pl-6 space-y-8 relative">
                      {patientTimeline.map((visit, idx) => (
                        <div key={visit.Timestamp || idx} className="relative">
                          <div className="absolute -left-[33px] top-1 w-4 h-4 bg-white border-4 border-blue-500 rounded-full"></div>
                          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 mb-2 flex justify-between">{new Date(visit.calledAt).toLocaleDateString()}<span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">{visit.department}</span></p>
                            <p className="text-sm font-bold text-slate-800 mb-2">{visit.symptoms}</p>
                            {visit.diagnosis && visit.diagnosis !== "None" && (<div className="mt-3 pt-3 border-t border-slate-50"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diagnosis</p><p className="text-sm text-slate-600">{visit.diagnosis}</p></div>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full md:w-2/3 p-8 overflow-y-auto bg-white">
                  <div className="space-y-8 max-w-2xl">
                    <div>
                      <div className="flex justify-between items-end mb-3">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Diagnosis</label>
                        <button type="button" onClick={toggleVoiceScribe} disabled={isProcessingVoice} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${isRecording ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'}`}>
                          {isProcessingVoice ? <Loader2 size={16} className="animate-spin"/> : isRecording ? <MicOff size={16}/> : <Mic size={16}/>}
                          {isProcessingVoice ? "AI is processing..." : isRecording ? "Stop Recording" : "AI Voice Scribe"}
                        </button>
                      </div>
                      <textarea rows={4} value={isRecording ? (prescriptionData.diagnosis + (prescriptionData.diagnosis ? "\n\n" : "") + liveTranscript) : prescriptionData.diagnosis} onChange={(e) => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})} disabled={isRecording || isProcessingVoice} className={`w-full p-4 border rounded-xl outline-none text-slate-800 transition-all ${isRecording ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500'}`} placeholder="Type manually, or click 'AI Voice Scribe' and just talk to auto-fill..." />
                    </div>

                    <div className="bg-amber-50 p-4 border border-amber-200 rounded-xl flex justify-between items-center">
                       <label className="text-sm font-bold text-amber-800 flex items-center gap-2"><CalendarClock size={16}/> Schedule Follow-up</label>
                       <select value={prescriptionData.followUpDays} onChange={(e) => setPrescriptionData({...prescriptionData, followUpDays: parseInt(e.target.value)})} className="bg-white border border-amber-300 p-2 rounded-lg font-bold text-amber-900 outline-none cursor-pointer"><option value={0}>None</option><option value={3}>In 3 Days</option><option value={7}>In 7 Days</option><option value={14}>In 14 Days</option></select>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-3"><label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Prescriptions</label><button type="button" onClick={addMedicineRow} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"><PlusCircle size={14}/> Add Medicine</button></div>
                      <div className="space-y-3">
                        {prescriptionData.medicines.map((med, index) => (
                          <div key={index} className="flex gap-3"><input type="text" placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicineChange(index, "name", e.target.value)} className="flex-1 p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" /><input type="text" placeholder="Dosage (1-0-1)" value={med.dosage} onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)} className="w-32 p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" /><input type="text" placeholder="Days" value={med.duration} onChange={(e) => handleMedicineChange(index, "duration", e.target.value)} className="w-24 p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500" /></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-white flex justify-between gap-4 shrink-0">
                {showTransfer ? (
                  <div className="flex-1 flex gap-3 items-center animate-in slide-in-from-bottom-2">
                     <select value={transferDept} onChange={(e) => setTransferDept(e.target.value)} className="p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700">
                        <option value="General">General</option><option value="Cardiology">Cardiology</option><option value="Pediatrics">Pediatrics</option><option value="Orthopedics">Orthopedics</option><option value="Neurology">Neurology</option>
                     </select>
                     <input type="text" value={transferNotes} onChange={(e) => setTransferNotes(e.target.value)} placeholder="Reason for transfer (e.g. ECG Required)..." className="flex-1 p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                     <button onClick={handleTransfer} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"><ArrowRightLeft size={18}/> Confirm Transfer</button>
                     <button onClick={() => setShowTransfer(false)} className="px-4 py-3 text-slate-400 hover:text-slate-600 font-bold transition-colors">Cancel</button>
                  </div>
                ) : (
                  <>
                     <button onClick={() => setShowTransfer(true)} className="px-6 py-3 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition-colors flex items-center gap-2"><ArrowRightLeft size={18}/> Transfer Patient</button>
                     <div className="flex gap-4">
                       <button onClick={() => setTreatingPatient(null)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                       <button onClick={finishTreatment} className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"><Printer size={18}/> Save to EMR & Print</button>
                     </div>
                  </>
                )}
              </div>
            </div>
         </div>
      )}
    </div>
  );
}