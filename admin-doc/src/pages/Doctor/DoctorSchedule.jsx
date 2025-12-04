import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorSchedule = () => {
  const { dToken, backendUrl } = useContext(DoctorContext)
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState(null)
  const [activeTab, setActiveTab] = useState('weekly')
  const [selectedDay, setSelectedDay] = useState('monday')
  const [daySchedule, setDaySchedule] = useState({
    isAvailable: true,
    morning: { isAvailable: true, startTime: '08:00', endTime: '12:00' },
    afternoon: { isAvailable: true, startTime: '12:00', endTime: '17:00' },
    evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' }
  })
  const [blockForm, setBlockForm] = useState({
    date: '',
    startTime: '',  // Stored in 12-hour format like "3:00 PM"
    endTime: '',     // Stored in 12-hour format like "5:00 PM"
    reason: ''
  })

  // Available time slots in 12-hour format (8 AM to 9 PM)
  const availableTimeSlots = [
    { label: '8:00 AM', value: '08:00' },
    { label: '8:30 AM', value: '08:30' },
    { label: '9:00 AM', value: '09:00' },
    { label: '9:30 AM', value: '09:30' },
    { label: '10:00 AM', value: '10:00' },
    { label: '10:30 AM', value: '10:30' },
    { label: '11:00 AM', value: '11:00' },
    { label: '11:30 AM', value: '11:30' },
    { label: '12:00 PM', value: '12:00' },
    { label: '12:30 PM', value: '12:30' },
    { label: '1:00 PM', value: '13:00' },
    { label: '1:30 PM', value: '13:30' },
    { label: '2:00 PM', value: '14:00' },
    { label: '2:30 PM', value: '14:30' },
    { label: '3:00 PM', value: '15:00' },
    { label: '3:30 PM', value: '15:30' },
    { label: '4:00 PM', value: '16:00' },
    { label: '4:30 PM', value: '16:30' },
    { label: '5:00 PM', value: '17:00' },
    { label: '5:30 PM', value: '17:30' },
    { label: '6:00 PM', value: '18:00' },
    { label: '6:30 PM', value: '18:30' },
    { label: '7:00 PM', value: '19:00' },
    { label: '7:30 PM', value: '19:30' },
    { label: '8:00 PM', value: '20:00' },
    { label: '8:30 PM', value: '20:30' },
    { label: '9:00 PM', value: '21:00' },
  ]

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const periods = ['morning', 'afternoon', 'evening']
  const periodLabels = {
    morning: { label: '🌅 Morning', time: '8:00 AM - 12:00 PM' },
    afternoon: { label: '☀️ Afternoon', time: '12:00 PM - 5:00 PM' },
    evening: { label: '🌙 Evening', time: '5:00 PM - 9:00 PM' }
  }

  // Format time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  }

  // Convert 12-hour format (e.g., "3:00 PM") to 24-hour format (e.g., "15:00")
  const convert12To24Hour = (time12) => {
    if (!time12) return '';
    const match = time12.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (!match) return '';
    
    let hour = parseInt(match[1]);
    const minute = match[2];
    const period = match[3];
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  // Validate if time is in valid 12-hour format
  const isValidTime12 = (time12) => {
    if (!time12) return false;
    const match = time12.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (!match) return false;
    const hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    return hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59;
  }

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/api/schedule/get`, {}, {
        headers: { dToken }
      })
      if (data.success) {
        setSchedule(data.schedule)
        // Load the selected day's schedule
        if (data.schedule?.weeklySchedule?.[selectedDay]) {
          setDaySchedule(data.schedule.weeklySchedule[selectedDay])
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      toast.error('Failed to fetch schedule')
    } finally {
      setLoading(false)
    }
  }

  // Load day schedule when selected day changes
  useEffect(() => {
    if (schedule?.weeklySchedule?.[selectedDay]) {
      setDaySchedule(schedule.weeklySchedule[selectedDay])
    } else {
      // Default schedule for a day
      setDaySchedule({
        isAvailable: true,
        morning: { isAvailable: true, startTime: '08:00', endTime: '12:00' },
        afternoon: { isAvailable: true, startTime: '12:00', endTime: '17:00' },
        evening: { isAvailable: false, startTime: '17:00', endTime: '21:00' }
      })
    }
  }, [selectedDay, schedule])

  const updateDaySchedule = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/schedule/update-day`, {
        day: selectedDay,
        daySchedule: daySchedule
      }, {
        headers: { dToken }
      })

      if (data.success) {
        toast.success(`${selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} schedule updated`)
        fetchSchedule()
      }
    } catch (error) {
      toast.error('Failed to update schedule')
    }
  }

  const updatePeriod = (period, field, value) => {
    setDaySchedule(prev => ({
      ...prev,
      [period]: {
        ...prev[period],
        [field]: value
      }
    }))
  }

  const updateSlotDuration = async (duration) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/schedule/slot-duration`, {
        slotDuration: parseInt(duration)
      }, {
        headers: { dToken }
      })

      if (data.success) {
        toast.success('Slot duration updated')
        fetchSchedule()
      }
    } catch (error) {
      toast.error('Failed to update slot duration')
    }
  }

  const blockTimeSlot = async (e) => {
    e.preventDefault()
    if (!blockForm.date || !blockForm.startTime || !blockForm.endTime) {
      toast.error('Please fill all required fields')
      return
    }

    // Validate time format (must be like "3:00 PM")
    if (!isValidTime12(blockForm.startTime) || !isValidTime12(blockForm.endTime)) {
      toast.error('Please enter time in format: 3:00 PM or 10:30 AM')
      return
    }

    // Convert 12-hour to 24-hour format
    const startTime24 = convert12To24Hour(blockForm.startTime)
    const endTime24 = convert12To24Hour(blockForm.endTime)

    // Validate time is within appointment hours (08:00 - 21:00)
    const startHour = parseInt(startTime24.split(':')[0])
    const endHour = parseInt(endTime24.split(':')[0])
    
    if (startHour < 8 || endHour > 21 || startHour >= 21) {
      toast.error('Please enter times between 8:00 AM and 9:00 PM')
      return
    }

    if (startTime24 >= endTime24) {
      toast.error('End time must be after start time')
      return
    }

    // Convert date to DD_MM_YYYY format
    const dateObj = new Date(blockForm.date)
    const formattedDate = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

    try {
      const { data } = await axios.post(`${backendUrl}/api/schedule/block-time`, {
        date: formattedDate,
        startTime: startTime24,
        endTime: endTime24,
        reason: blockForm.reason
      }, {
        headers: { dToken }
      })

      if (data.success) {
        toast.success('Time slot blocked')
        setBlockForm({ date: '', startTime: '', endTime: '', reason: '' })
        fetchSchedule()
      }
    } catch (error) {
      toast.error('Failed to block time slot')
    }
  }

  const unblockTimeSlot = async (blockedTimeId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/schedule/unblock-time`, {
        blockedTimeId
      }, {
        headers: { dToken }
      })

      if (data.success) {
        toast.success('Time slot unblocked')
        fetchSchedule()
      }
    } catch (error) {
      toast.error('Failed to unblock time slot')
    }
  }

  useEffect(() => {
    if (dToken) {
      fetchSchedule()
    }
  }, [dToken])

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  // Helper to get period availability status for overview
  const getPeriodStatus = (day, period) => {
    const dayData = schedule?.weeklySchedule?.[day]
    if (!dayData?.isAvailable) return 'off'
    if (!dayData?.[period]?.isAvailable) return 'off'
    return 'on'
  }

  return (
    <div className='m-3 sm:m-5 w-full max-w-5xl'>
      {/* Header */}
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-xl sm:text-2xl font-semibold text-gray-800'>📅 Schedule Management</h1>
        <p className='text-gray-500 text-xs sm:text-sm mt-1'>Manage your availability and block time slots</p>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className='flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b overflow-x-auto pb-px scrollbar-hide'>
        {[
          { id: 'weekly', label: '📅 Weekly', fullLabel: '📅 Weekly Schedule' },
          { id: 'blocked', label: '🚫 Blocked', fullLabel: '🚫 Blocked Times' },
          { id: 'settings', label: '⚙️ Settings', fullLabel: '⚙️ Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className='sm:hidden'>{tab.label}</span>
            <span className='hidden sm:inline'>{tab.fullLabel}</span>
          </button>
        ))}
      </div>

      {/* Weekly Schedule Tab */}
      {activeTab === 'weekly' && (
        <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100'>
          <h3 className='font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base'>Set Your Weekly Availability</h3>
          
          {/* Week Overview - Responsive grid */}
          <div className='mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl'>
            <p className='text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 font-medium'>Weekly Overview (tap a day to edit)</p>
            
            {/* Mobile: 4 + 3 layout, Desktop: 7 columns */}
            <div className='grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2'>
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`p-2 sm:p-3 rounded-lg text-center transition-all ${
                    selectedDay === day 
                      ? 'bg-primary text-white ring-2 ring-primary ring-offset-1 sm:ring-offset-2' 
                      : 'bg-white hover:bg-gray-100 border'
                  }`}
                >
                  <p className='text-[10px] sm:text-xs font-medium capitalize'>{day.slice(0, 3)}</p>
                  <div className='flex justify-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2'>
                    {periods.map(period => (
                      <div
                        key={period}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                          getPeriodStatus(day, period) === 'on' 
                            ? 'bg-green-400' 
                            : 'bg-gray-300'
                        }`}
                        title={`${period}: ${getPeriodStatus(day, period)}`}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <div className='flex justify-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-500'>
              <span className='flex items-center gap-1'>
                <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400'></div> Available
              </span>
              <span className='flex items-center gap-1'>
                <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300'></div> Not Available
              </span>
            </div>
          </div>

          {/* Selected Day Editor */}
          <div className='border rounded-xl p-3 sm:p-5'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4'>
              <h4 className='text-base sm:text-lg font-semibold capitalize text-gray-800'>
                📅 {selectedDay}
              </h4>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={daySchedule.isAvailable}
                  onChange={(e) => setDaySchedule(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className='w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-primary focus:ring-primary'
                />
                <span className='text-xs sm:text-sm font-medium text-gray-700'>Available this day</span>
              </label>
            </div>

            {daySchedule.isAvailable && (
              <div className='space-y-3 sm:space-y-4'>
                {periods.map(period => (
                  <div 
                    key={period} 
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                      daySchedule[period]?.isAvailable 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* Period header with checkbox */}
                    <div className='flex items-center justify-between mb-2 sm:mb-0'>
                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={daySchedule[period]?.isAvailable || false}
                          onChange={(e) => updatePeriod(period, 'isAvailable', e.target.checked)}
                          className='w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-primary focus:ring-primary'
                        />
                        <span className='font-medium text-gray-800 text-sm sm:text-base'>{periodLabels[period].label}</span>
                      </label>
                      <span className='text-[10px] sm:text-xs text-gray-500 hidden sm:inline'>({periodLabels[period].time})</span>
                    </div>
                    
                    {/* Time inputs - Stack on mobile */}
                    {daySchedule[period]?.isAvailable && (
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 sm:mt-3 sm:ml-7'>
                        <div className='flex items-center gap-2'>
                          <label className='text-xs text-gray-500 w-10 sm:w-auto'>From:</label>
                          <select
                            value={daySchedule[period]?.startTime || ''}
                            onChange={(e) => updatePeriod(period, 'startTime', e.target.value)}
                            className='flex-1 sm:flex-none px-2 sm:px-3 py-1.5 border rounded-lg text-sm focus:ring-primary focus:border-primary bg-white'
                          >
                            <option value=''>Select</option>
                            {availableTimeSlots.map((slot) => (
                              <option key={slot.value} value={slot.value}>{slot.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className='flex items-center gap-2'>
                          <label className='text-xs text-gray-500 w-10 sm:w-auto'>To:</label>
                          <select
                            value={daySchedule[period]?.endTime || ''}
                            onChange={(e) => updatePeriod(period, 'endTime', e.target.value)}
                            className='flex-1 sm:flex-none px-2 sm:px-3 py-1.5 border rounded-lg text-sm focus:ring-primary focus:border-primary bg-white'
                          >
                            <option value=''>Select</option>
                            {availableTimeSlots.map((slot) => (
                              <option key={slot.value} value={slot.value}>{slot.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!daySchedule.isAvailable && (
              <div className='text-center py-6 sm:py-8 text-gray-500'>
                <p className='text-3xl sm:text-4xl mb-2'>🏖️</p>
                <p className='text-sm sm:text-base'>You are not available on this day</p>
              </div>
            )}

            <div className='mt-4 sm:mt-6 flex justify-end'>
              <button
                onClick={updateDaySchedule}
                className='w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-medium text-sm sm:text-base'
              >
                💾 Save {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Times Tab */}
      {activeTab === 'blocked' && (
        <div className='space-y-4 sm:space-y-6'>
          {/* Quick Block Presets */}
          <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100'>
            <h3 className='font-semibold text-gray-800 mb-2 sm:mb-4 text-sm sm:text-base'>⚡ Quick Block</h3>
            <p className='text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4'>Common time blocks you can apply quickly:</p>
            <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3'>
              {[
                { label: 'Lunch Break', shortLabel: 'Lunch', start: '12:00 PM', end: '1:00 PM', reason: 'Lunch Break' },
                { label: 'Short Break', shortLabel: 'Short', start: '10:30 AM', end: '11:00 AM', reason: 'Short Break' },
                { label: 'Afternoon Break', shortLabel: 'Afternoon', start: '3:00 PM', end: '3:30 PM', reason: 'Afternoon Break' },
                { label: 'Full Morning', shortLabel: 'Morning', start: '8:00 AM', end: '12:00 PM', reason: 'Morning Unavailable' },
                { label: 'Full Afternoon', shortLabel: 'Afternoon', start: '12:00 PM', end: '5:00 PM', reason: 'Afternoon Unavailable' },
                { label: 'Full Evening', shortLabel: 'Evening', start: '5:00 PM', end: '9:00 PM', reason: 'Evening Unavailable' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setBlockForm(prev => ({ 
                    ...prev, 
                    startTime: preset.start, 
                    endTime: preset.end, 
                    reason: preset.reason 
                  }))}
                  className='px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-all text-center'
                >
                  <span className='sm:hidden'>{preset.shortLabel}</span>
                  <span className='hidden sm:inline'>{preset.label}</span>
                  <span className='block text-[10px] sm:text-xs text-gray-500'>({preset.start} - {preset.end})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Block Time Form */}
          <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100'>
            <h3 className='font-semibold text-gray-800 mb-2 sm:mb-4 text-sm sm:text-base'>🚫 Block Time Slot</h3>
            <p className='text-xs sm:text-sm text-gray-500 mb-2'>Block a specific time range when you won't be available.</p>
            <p className='text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-3 sm:mb-4'>
              ⏰ Appointment hours: 8:00 AM - 9:00 PM. Select times within this range.
            </p>
            <form onSubmit={blockTimeSlot} className='space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0'>
              <div>
                <label className='block text-xs sm:text-sm text-gray-600 mb-1'>Date *</label>
                <input
                  type='date'
                  value={blockForm.date}
                  onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                  className='w-full px-3 sm:px-4 py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary'
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className='block text-xs sm:text-sm text-gray-600 mb-1'>Reason</label>
                <input
                  type='text'
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder='e.g., Lunch, Meeting'
                  className='w-full px-3 sm:px-4 py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary'
                />
              </div>
              <div>
                <label className='block text-xs sm:text-sm text-gray-600 mb-1'>Start Time *</label>
                <input
                  type='text'
                  value={blockForm.startTime}
                  onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })}
                  placeholder='e.g., 3:00 PM'
                  className='w-full px-3 sm:px-4 py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary'
                />
                <p className='text-[10px] text-gray-400 mt-1'>Format: 8:00 AM, 12:30 PM, 5:00 PM</p>
              </div>
              <div>
                <label className='block text-xs sm:text-sm text-gray-600 mb-1'>End Time *</label>
                <input
                  type='text'
                  value={blockForm.endTime}
                  onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                  placeholder='e.g., 5:00 PM'
                  className='w-full px-3 sm:px-4 py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary'
                />
                <p className='text-[10px] text-gray-400 mt-1'>Format: 8:00 AM, 12:30 PM, 5:00 PM</p>
              </div>
              <div className='sm:col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-0'>
                <button
                  type='submit'
                  className='w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium text-sm'
                >
                  🚫 Block Time Slot
                </button>
                <button
                  type='button'
                  onClick={() => setBlockForm({ date: '', startTime: '', endTime: '', reason: '' })}
                  className='w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm'
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Blocked Times List */}
          <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100'>
            <h3 className='font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base'>📋 Currently Blocked Times</h3>
            {schedule?.blockedTimes?.length > 0 ? (
              <div className='space-y-2 sm:space-y-3'>
                {schedule.blockedTimes.map((blocked) => {
                  // Format date from DD_MM_YYYY to readable format
                  const dateParts = blocked.date.split('_');
                  const formattedDate = dateParts.length === 3 
                    ? new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })
                    : blocked.date;
                  
                  // Short date for mobile
                  const shortDate = dateParts.length === 3 
                    ? new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short'
                      })
                    : blocked.date;
                  
                  // Format times to 12-hour format
                  const formatTime = (time) => {
                    const [h, m] = time.split(':');
                    const hour = parseInt(h);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const hour12 = hour % 12 || 12;
                    return `${hour12}:${m} ${ampm}`;
                  };

                  return (
                    <div key={blocked._id} className='flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-red-50 rounded-xl border border-red-100'>
                      <div className='flex items-center gap-2 sm:gap-4 min-w-0'>
                        <div className='p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0'>
                          <span className='text-lg sm:text-2xl'>🚫</span>
                        </div>
                        <div className='min-w-0'>
                          <p className='font-semibold text-gray-800 text-xs sm:text-base'>
                            <span className='sm:hidden'>{shortDate}</span>
                            <span className='hidden sm:inline'>{formattedDate}</span>
                          </p>
                          <p className='text-red-600 font-medium text-xs sm:text-sm'>
                            {formatTime(blocked.startTime)} - {formatTime(blocked.endTime)}
                          </p>
                          {blocked.reason && (
                            <p className='text-gray-500 text-[10px] sm:text-sm mt-0.5 sm:mt-1 truncate'>💬 {blocked.reason}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => unblockTimeSlot(blocked._id)}
                        className='px-2 sm:px-4 py-1.5 sm:py-2 bg-white text-red-500 border border-red-200 rounded-lg hover:bg-red-100 transition-all text-xs sm:text-sm font-medium flex-shrink-0'
                      >
                        <span className='sm:hidden'>✕</span>
                        <span className='hidden sm:inline'>✕ Remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-center py-8 sm:py-12 text-gray-500'>
                <p className='text-4xl sm:text-5xl mb-2 sm:mb-3'>✅</p>
                <p className='font-medium text-sm sm:text-base'>No blocked times</p>
                <p className='text-xs sm:text-sm'>All your available slots are open for booking</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className='bg-white rounded-xl p-4 sm:p-6 border border-gray-100'>
          <h3 className='font-semibold text-gray-800 mb-4 sm:mb-6 text-sm sm:text-base'>⚙️ Schedule Settings</h3>
          
          <div className='space-y-6 sm:space-y-8'>
            {/* Slot Duration */}
            <div className='p-3 sm:p-4 bg-gray-50 rounded-xl'>
              <label className='block text-sm sm:text-base font-medium text-gray-700 mb-2'>
                ⏱️ Appointment Slot Duration
              </label>
              <p className='text-xs sm:text-sm text-gray-500 mb-3'>How long each appointment slot should be</p>
              <select
                value={schedule?.slotDuration || 30}
                onChange={(e) => updateSlotDuration(e.target.value)}
                className='w-full sm:w-auto sm:min-w-[200px] px-3 sm:px-4 py-2.5 sm:py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary bg-white'
              >
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes (Recommended)</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes (1 hour)</option>
                <option value="90">90 minutes (1.5 hours)</option>
              </select>
            </div>

            {/* Max Patients */}
            <div className='p-3 sm:p-4 bg-gray-50 rounded-xl'>
              <label className='block text-sm sm:text-base font-medium text-gray-700 mb-2'>
                👥 Max Patients Per Day
              </label>
              <p className='text-xs sm:text-sm text-gray-500 mb-3'>Maximum number of patients you can see per day</p>
              <input
                type='number'
                value={schedule?.maxPatientsPerDay || 20}
                onChange={async (e) => {
                  try {
                    const { data } = await axios.post(`${backendUrl}/api/schedule/max-patients`, {
                      maxPatientsPerDay: parseInt(e.target.value)
                    }, { headers: { dToken } })
                    if (data.success) {
                      toast.success('Max patients updated')
                      fetchSchedule()
                    }
                  } catch (error) {
                    toast.error('Failed to update')
                  }
                }}
                min="1"
                max="100"
                className='w-full sm:w-auto sm:min-w-[200px] px-3 sm:px-4 py-2.5 sm:py-2 border rounded-lg text-sm focus:ring-primary focus:border-primary'
              />
            </div>

            {/* Info Card */}
            <div className='p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100'>
              <div className='flex gap-3'>
                <span className='text-xl sm:text-2xl'>💡</span>
                <div>
                  <p className='font-medium text-blue-800 text-sm sm:text-base'>Pro Tips</p>
                  <ul className='text-xs sm:text-sm text-blue-700 mt-2 space-y-1'>
                    <li>• 30-minute slots work well for regular consultations</li>
                    <li>• Use 45-60 minutes for new patient assessments</li>
                    <li>• Block lunch time daily to ensure you take breaks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorSchedule
