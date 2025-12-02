import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Notifications = () => {
  const { backendUrl, token, userData } = useContext(AppContext)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        `${backendUrl}/api/notifications/patient/${userData._id}`,
        { headers: { token } }
      )
      if (data.success) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
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
        userId: userData._id
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
      }
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  useEffect(() => {
    if (token && userData?._id) {
      fetchNotifications()
    }
  }, [token, userData])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    return n.type === filter
  })

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment_confirmation': return '✅'
      case 'appointment_reminder': return '⏰'
      case 'cancellation_alert': return '❌'
      default: return '📢'
    }
  }

  const getTypeBg = (type) => {
    switch (type) {
      case 'appointment_confirmation': return 'bg-green-50 border-green-200'
      case 'appointment_reminder': return 'bg-blue-50 border-blue-200'
      case 'cancellation_alert': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (!token) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-500 text-lg mb-4'>Please login to view notifications</p>
          <a href='/login' className='text-primary hover:underline'>Login here</a>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex flex-wrap justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-800'>🔔 Notifications</h1>
          <p className='text-gray-500 text-sm mt-1'>
            {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'You\'re all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className='px-4 py-2 text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-all text-sm mt-3 sm:mt-0'
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'appointment_confirmation', label: '✅ Confirmations' },
          { id: 'appointment_reminder', label: '⏰ Reminders' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              filter === f.id 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className='flex justify-center py-12'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary'></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className='text-center py-16 bg-gray-50 rounded-2xl'>
          <p className='text-5xl mb-4'>📭</p>
          <p className='text-gray-500 text-lg'>No notifications yet</p>
          <p className='text-gray-400 text-sm mt-1'>We'll notify you about your appointments here</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {filteredNotifications.map((notification) => (
            <div 
              key={notification._id}
              className={`p-5 rounded-2xl border transition-all ${
                notification.isRead 
                  ? 'bg-white border-gray-100' 
                  : getTypeBg(notification.type)
              }`}
            >
              <div className='flex gap-4'>
                <div className='text-3xl'>{getTypeIcon(notification.type)}</div>
                <div className='flex-1'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-semibold text-gray-800 flex items-center gap-2'>
                        {notification.title}
                        {!notification.isRead && (
                          <span className='w-2 h-2 bg-primary rounded-full'></span>
                        )}
                      </h3>
                      <p className='text-gray-600 mt-1'>{notification.message}</p>
                      <p className='text-gray-400 text-sm mt-2'>
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className='flex gap-2 ml-4'>
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification._id)}
                          className='p-2 hover:bg-gray-100 rounded-full transition-all'
                          title='Mark as read'
                        >
                          ✓
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification._id)}
                        className='p-2 hover:bg-red-50 text-red-500 rounded-full transition-all'
                        title='Delete'
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
