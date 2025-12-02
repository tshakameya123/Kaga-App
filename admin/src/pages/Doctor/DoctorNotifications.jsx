import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorNotifications = () => {
  const { dToken, backendUrl } = useContext(DoctorContext)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await axios.post(`${backendUrl}/api/notifications/doctor`, {}, {
        headers: { dToken }
      })
      if (data.success) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      const { data } = await axios.patch(`${backendUrl}/api/notifications/read/${id}`)
      if (data.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        )
      }
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/notifications/read-all`, {
        doctorId: true // Will be replaced with actual docId in middleware
      }, {
        headers: { dToken }
      })
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (id) => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/notifications/${id}`)
      if (data.success) {
        setNotifications(prev => prev.filter(n => n._id !== id))
        toast.success('Notification deleted')
      }
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  useEffect(() => {
    if (dToken) {
      fetchNotifications()
    }
  }, [dToken])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    return n.type === filter
  })

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment_confirmation': return 'bg-green-100 text-green-800'
      case 'appointment_reminder': return 'bg-blue-100 text-blue-800'
      case 'cancellation_alert': return 'bg-red-100 text-red-800'
      case 'schedule_change': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment_confirmation': return '✅'
      case 'appointment_reminder': return '⏰'
      case 'cancellation_alert': return '❌'
      case 'schedule_change': return '📅'
      default: return '📢'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className='m-5 w-full max-w-4xl'>
      {/* Header */}
      <div className='flex flex-wrap justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-800'>🔔 Notifications</h1>
          <p className='text-gray-500 text-sm mt-1'>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm mt-3 sm:mt-0'
          >
            ✓ Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-6 flex-wrap'>
        {['all', 'unread', 'cancellation_alert'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === f 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : '❌ Cancellations'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className='flex justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className='text-center py-12 bg-gray-50 rounded-xl'>
          <p className='text-gray-500 text-lg'>📭 No notifications</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filteredNotifications.map((notification) => (
            <div 
              key={notification._id}
              className={`p-4 rounded-xl border transition-all ${
                notification.isRead 
                  ? 'bg-white border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className='flex items-start gap-4'>
                <div className='text-2xl'>{getTypeIcon(notification.type)}</div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h3 className='font-semibold text-gray-800'>{notification.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(notification.type)}`}>
                      {notification.type?.replace(/_/g, ' ')}
                    </span>
                    {!notification.isRead && (
                      <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                    )}
                  </div>
                  <p className='text-gray-600 text-sm'>{notification.message}</p>
                  <p className='text-gray-400 text-xs mt-2'>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className='flex gap-2'>
                  {!notification.isRead && (
                    <button 
                      onClick={() => markAsRead(notification._id)}
                      className='text-blue-500 hover:text-blue-700 text-sm'
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification._id)}
                    className='text-red-500 hover:text-red-700 text-sm'
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorNotifications
