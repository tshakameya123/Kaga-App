import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { sanitizeInput } from '../utils/security';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext);

  const [docInfo, setDocInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [activeTimePeriod, setActiveTimePeriod] = useState('morning');

  const navigate = useNavigate();

  const fetchDocInfo = () => {
    const doc = doctors.find((doc) => doc._id === docId);
    setDocInfo(doc);
  };

  const fetchAvailableSlots = async (date) => {
    if (!docInfo) return;

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const slotDate = `${day}_${month}_${year}`;

    try {
      const { data } = await axios.post(`${backendUrl}/api/schedule/available-slots`, {
        doctorId: docId,
        date: slotDate
      });

      if (data.success) {
        // Use allSlots for the flat list and slots for grouped periods
        setAvailableSlots(data.allSlots || []);
        setSlotsByPeriodFromAPI(data.slots || { morning: [], afternoon: [], evening: [] });
      } else {
        // Fallback to local generation if API fails
        generateLocalSlots(date);
      }
    } catch (error) {
      console.error('Error fetching slots from API:', error);
      // Fallback to local generation
      generateLocalSlots(date);
    }

    setSelectedTime(null); // Reset time selection
  };

  // Fallback local slot generation (used when API fails or doctor has no schedule set)
  const generateLocalSlots = (date) => {
    const slots = [];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const slotDate = `${day}_${month}_${year}`;
    const bookedSlots = docInfo.slots_booked?.[slotDate] || [];

    // Generate slots from 8 AM to 9 PM in 12-hour format
    for (let h = 8; h < 21; h++) {
      for (let m = 0; m < 60; m += 30) {
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        const slotTime = `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
        
        if (!bookedSlots.includes(slotTime)) {
          slots.push(slotTime);
        }
      }
    }

    setAvailableSlots(slots);
    
    // Group by period for display
    const grouped = { morning: [], afternoon: [], evening: [] };
    slots.forEach(slot => {
      if (slot.includes('AM') && !slot.startsWith('12:')) {
        grouped.morning.push(slot);
      } else if (slot.includes('PM') && (slot.startsWith('12:') || parseInt(slot) < 5)) {
        grouped.afternoon.push(slot);
      } else {
        grouped.evening.push(slot);
      }
    });
    setSlotsByPeriodFromAPI(grouped);
  };

  // State for API-fetched slots grouped by period
  const [slotsByPeriodFromAPI, setSlotsByPeriodFromAPI] = useState({
    morning: [],
    afternoon: [],
    evening: []
  });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchAvailableSlots(date);
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Login to book an appointment');
      return navigate('/login');
    }

    if (!selectedTime) {
      toast.warning('Please select a time slot');
      return;
    }

    const day = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    const slotDate = `${day}_${month}_${year}`;

    try {
      // Sanitize inputs before sending
      const sanitizedDocId = sanitizeInput(docId);
      const sanitizedSlotDate = sanitizeInput(slotDate);
      const sanitizedSlotTime = sanitizeInput(selectedTime);

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId: sanitizedDocId, slotDate: sanitizedSlotDate, slotTime: sanitizedSlotTime },
        { 
          headers: { token },
          timeout: 15000,
        }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctosData();
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('[Appointment] Booking error:', error);
      const status = error.response?.status;
      if (status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to book appointment');
      }
    }
  };

  useEffect(() => {
    if (doctors.length > 0) fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) fetchAvailableSlots(selectedDate);
  }, [docInfo]);

  const slotsByPeriod = useMemo(() => {
    // If we have API-fetched slots, use them
    if (slotsByPeriodFromAPI.morning.length > 0 || 
        slotsByPeriodFromAPI.afternoon.length > 0 || 
        slotsByPeriodFromAPI.evening.length > 0) {
      return slotsByPeriodFromAPI;
    }
    
    // Otherwise, group available slots locally as fallback
    const buckets = { morning: [], afternoon: [], evening: [] };
    availableSlots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0]);
      if (hour >= 8 && hour < 12) {
        buckets.morning.push(slot);
      } else if (hour >= 12 && hour < 17) {
        buckets.afternoon.push(slot);
      } else if (hour >= 17 && hour < 21) {
        buckets.evening.push(slot);
      }
    });
    return buckets;
  }, [availableSlots, slotsByPeriodFromAPI]);

  const periodCounts = {
    morning: slotsByPeriod.morning.length,
    afternoon: slotsByPeriod.afternoon.length,
    evening: slotsByPeriod.evening.length,
  };

  const formattedDate = useMemo(() => ({
    dayName: selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
    date: selectedDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  }), [selectedDate]);

  const timePeriodConfigs = useMemo(() => ([
    {
      key: 'morning',
      label: 'Morning',
      range: '8:00 AM - 12:00 PM',
      iconBg: 'bg-amber-50 text-amber-500',
      indicator: 'from-amber-50 to-yellow-50'
    },
    {
      key: 'afternoon',
      label: 'Afternoon',
      range: '12:00 PM - 5:00 PM',
      iconBg: 'bg-orange-50 text-orange-500',
      indicator: 'from-orange-50 to-rose-50'
    },
    {
      key: 'evening',
      label: 'Evening',
      range: '5:00 PM - 9:00 PM',
      iconBg: 'bg-purple-50 text-purple-500',
      indicator: 'from-indigo-50 to-purple-50'
    }
  ]), []);

  // Helper to format experience (handles "8 Year", "8 Years", or just "8")
  const formatExperience = (exp) => {
    if (!exp) return '5+ yrs';
    const numMatch = String(exp).match(/\d+/);
    return numMatch ? `${numMatch[0]}+ yrs` : exp;
  };

  const doctorStats = useMemo(() => ([
    {
      label: 'Experience',
      value: formatExperience(docInfo?.experience),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Consultation',
      value: `${currencySymbol}${docInfo?.fees || 0}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      label: 'Patients served',
      value: `${docInfo?.patients || 1200}+`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]), [currencySymbol, docInfo]);

  return docInfo ? (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Doctor Details Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 shadow-2xl">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_55%)]" />
        <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 flex-1">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-white/30 blur" />
              <div className="relative">
                <img
                  className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-[28px] border-4 border-white/80 shadow-2xl object-cover"
                  src={docInfo.image}
                  alt={`${docInfo.name}'s profile`}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = assets.profile_pic; }}
                />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white text-blue-700 text-xs font-semibold rounded-full shadow-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Available today
                </span>
              </div>
            </div>
            <div className="text-center sm:text-left text-white">
              <p className="text-sm uppercase tracking-[0.35em] text-white/70 mb-2">Primary consultant</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">{docInfo.name}</h1>
              <p className="text-lg sm:text-xl text-white/90">{docInfo.speciality}</p>
              <p className="text-sm sm:text-base text-white/70 mt-1">{docInfo.degree || 'Board Certified Specialist'}</p>
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                {(docInfo?.languages || ['English']).map((language, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 sm:p-5 lg:p-6 text-white lg:w-80 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-white/70 mb-3">Quick facts</p>
            <div className="space-y-3">
              {doctorStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="p-2 rounded-full bg-white/10">
                      {stat.icon}
                    </span>
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <span className="text-base font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">About</p>
              <h3 className="text-base font-semibold text-gray-900">Professional Summary</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{docInfo.about}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-green-50 text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Special focus</p>
              <h3 className="text-base font-semibold text-gray-900">Clinical Expertise</h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[docInfo.speciality, docInfo.degree].filter(Boolean).map((item, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 text-xs font-medium border border-gray-100">
                {item}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 text-xs font-medium border border-gray-100">
              Preventive care
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Clinic insights</p>
              <h3 className="text-base font-semibold text-gray-900">Patient Experience</h3>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Personalized consultation with holistic plans
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Responsive follow-up and digital prescriptions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Tele-consult options available on request
            </li>
          </ul>
        </div>
      </section>

      {/* Appointment Booking Section */}
      <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8 border border-gray-100">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg mr-2 sm:mr-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          Book Your Appointment
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Date Selection */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-gray-900">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Schedule</p>
                <h3 className="text-lg font-semibold">Select Date</h3>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-7 rounded-3xl border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50 shadow-lg">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                maxDate={new Date(new Date().setDate(new Date().getDate() + 6))}
                inline
                calendarStartDay={1}
                renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                  <div className="flex items-center justify-between mb-2 px-1">
                    <button
                      type="button"
                      onClick={decreaseMonth}
                      className="p-1.5 rounded-full bg-white shadow hover:bg-blue-50 transition"
                    >
                      <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-sm font-semibold text-gray-700">
                      {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={increaseMonth}
                      className="p-1.5 rounded-full bg-white shadow hover:bg-blue-50 transition"
                    >
                      <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Morning', value: periodCounts.morning, icon: '☀️', accent: 'text-amber-500', hours: '8am - 12pm' },
                { label: 'Afternoon', value: periodCounts.afternoon, icon: '🌤️', accent: 'text-orange-500', hours: '12pm - 5pm' },
                { label: 'Evening', value: periodCounts.evening, icon: '🌙', accent: 'text-purple-500', hours: '5pm - 9pm' },
              ].map((stat, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span className={`text-lg ${stat.accent}`}>{stat.icon}</span>
                    <span>{stat.label}</span>
                  </div>
                  <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">slots available</p>
                  <span className="inline-flex mt-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                    {stat.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <p className="text-base sm:text-lg font-semibold text-gray-700">Available Time Slots:</p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                <span>{availableSlots.length} slots available</span>
              </div>
            </div>
            
            {availableSlots.length > 0 ? (
              <div className="space-y-3">
                {timePeriodConfigs.map((period) => {
                  const slots = slotsByPeriod[period.key];
                  const isOpen = activeTimePeriod === period.key;
                  const toggleAccordion = () => {
                    setActiveTimePeriod(prev => (prev === period.key ? '' : period.key));
                  };
                  return (
                    <div key={period.key} className="border border-gray-100 rounded-2xl bg-white shadow-sm">
                      <button
                        onClick={toggleAccordion}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-2 rounded-xl ${period.iconBg}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{period.label}</p>
                            <p className="text-xs text-gray-500">{period.range}</p>
                          </div>
                        </div>
                        <span className={`p-1 rounded-full text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          {slots.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {slots.map((slot, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedTime(slot)}
                                  className={`group relative px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                                    selectedTime === slot
                                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 shadow-xl'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg'
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                    <span className={`p-1 rounded-full ${
                                      selectedTime === slot ? 'bg-white/30 text-white' : 'bg-blue-50 text-blue-500'
                                    }`}>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </span>
                                    <span>{slot}</span>
                                  </div>
                                  {selectedTime === slot && (
                                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                                      <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 sm:py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm text-gray-500">No {period.label.toLowerCase()} slots available</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-12 bg-gray-50 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No Available Slots</h3>
                <p className="text-gray-500 text-sm">Please select a different date to see available time slots.</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        {selectedTime && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Appointment Summary:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-blue-700 font-medium">Doctor:</span>
                <p className="text-blue-900">{docInfo.name}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Date:</span>
                <p className="text-blue-900">{selectedDate.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Time:</span>
                <p className="text-blue-900">{selectedTime}</p>
              </div>
            </div>
          </div>
        )}

        {/* Book Appointment Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={bookAppointment}
            disabled={!selectedTime}
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 mx-auto ${
              selectedTime
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">{selectedTime ? 'Book Appointment' : 'Select a Time Slot'}</span>
            <span className="sm:hidden">{selectedTime ? 'Book Now' : 'Select Time'}</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Appointment;

