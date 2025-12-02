import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Notifications = () => {
  const { aToken, backendUrl } = useContext(AdminContext)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${backendUrl}/api/notifications/admin`, {
        headers: { aToken }
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
        isAdmin: true
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
    if (!window.confirm('Are you sure you want to delete this notification?')) return
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

  const deleteAllNotifications = async () => {
    if (!window.confirm(`Are you sure you want to delete all ${filteredNotifications.length} notifications? This cannot be undone.`)) return
    try {
      // Delete all filtered notifications one by one
      const deletePromises = filteredNotifications.map(n => 
        axios.delete(`${backendUrl}/api/notifications/${n._id}`)
      )
      await Promise.all(deletePromises)
      setNotifications(prev => prev.filter(n => !filteredNotifications.find(fn => fn._id === n._id)))
      toast.success(`Deleted ${filteredNotifications.length} notification(s)`)
    } catch (error) {
      toast.error('Failed to delete notifications')
      fetchNotifications() // Refresh to get accurate state
    }
  }

  const processReminders = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/notifications/process-reminders`, {}, {
        headers: { aToken }
      })
      if (data.success) {
        toast.success(`Sent ${data.reminders?.length || 0} reminder(s)`)
        fetchNotifications()
      }
    } catch (error) {
      toast.error('Failed to process reminders')
    }
  }

  useEffect(() => {
    if (aToken) {
      fetchNotifications()
    }
  }, [aToken])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    return n.type === filter
  })

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment_confirmation': return 'bg-green-100 text-green-700'
      case 'appointment_reminder': return 'bg-blue-100 text-blue-700'
      case 'appointment_rescheduled': return 'bg-purple-100 text-purple-700'
      case 'cancellation_alert': return 'bg-red-100 text-red-700'
      case 'schedule_change': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment_confirmation': return '✅'
      case 'appointment_reminder': return '⏰'
      case 'appointment_rescheduled': return '🔄'
      case 'cancellation_alert': return '❌'
      case 'schedule_change': return '📅'
      default: return '📢'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className='p-3 sm:p-5 lg:p-8 w-full min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6'>
          <div>
            <h1 className='text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2'>
              🔔 Notifications
              {unreadCount > 0 && (
                <span className='bg-red-500 text-white text-xs px-2 py-0.5 rounded-full'>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className='text-gray-500 text-xs sm:text-sm mt-1'>
              {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'All caught up! 🎉'}
            </p>
          </div>
          <div className='flex gap-2 w-full sm:w-auto'>
            <button 
              onClick={processReminders}
              className='flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs sm:text-sm flex items-center justify-center gap-1'
            >
              📤 <span className='hidden xs:inline'>Send</span> Reminders
            </button>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className='flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-xs sm:text-sm flex items-center justify-center gap-1'
              >
                ✓ <span className='hidden xs:inline'>Mark All</span> Read
              </button>
            )}
            {filteredNotifications.length > 0 && (
              <button 
                onClick={deleteAllNotifications}
                className='flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs sm:text-sm flex items-center justify-center gap-1'
              >
                🗑️ <span className='hidden xs:inline'>Delete All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters - Scrollable on mobile */}
        <div className='bg-white rounded-xl p-1.5 sm:p-2 mb-4 sm:mb-6 shadow-sm overflow-x-auto scrollbar-hide'>
          <div className='flex gap-1 sm:gap-2 min-w-max'>
            {[
              { id: 'all', label: 'All', icon: '📋' },
              { id: 'unread', label: 'Unread', icon: '🔵' },
              { id: 'cancellation_alert', label: 'Cancellations', icon: '❌' },
              { id: 'appointment_rescheduled', label: 'Rescheduled', icon: '🔄' },
              { id: 'schedule_change', label: 'Schedule', icon: '📅' },
              { id: 'appointment_confirmation', label: 'Confirmed', icon: '✅' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1 ${
                  filter === f.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{f.icon}</span>
                <span className='hidden sm:inline'>{f.label}</span>
                <span className='sm:hidden'>{f.label.slice(0, 4)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className='text-center py-12 bg-white rounded-xl shadow-sm'>
            <p className='text-4xl mb-3'>📭</p>
            <p className='text-gray-500 text-base'>No notifications found</p>
            <p className='text-gray-400 text-sm mt-1'>
              {filter !== 'all' ? 'Try changing the filter' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className='space-y-2 sm:space-y-3'>
            {filteredNotifications.map((notification) => (
              <div 
                key={notification._id}
                className={`p-3 sm:p-4 rounded-xl border transition-all shadow-sm ${
                  notification.isRead 
                    ? 'bg-white border-gray-100' 
                    : 'bg-gradient-to-r from-blue-50 to-white border-blue-200'
                }`}
              >
                {/* Mobile Layout */}
                <div className='sm:hidden'>
                  <div className='flex items-start gap-3'>
                    <div className='text-xl flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h3 className='font-semibold text-gray-800 text-sm truncate'>{notification.title}</h3>
                        {!notification.isRead && (
                          <span className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0'></span>
                        )}
                      </div>
                      <p className='text-gray-600 text-xs line-clamp-2'>{notification.message}</p>
                      <div className='flex items-center justify-between mt-2'>
                        <div className='flex items-center gap-2'>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${getTypeColor(notification.type)}`}>
                            {notification.type?.replace(/_/g, ' ').replace('appointment ', '')}
                          </span>
                          <span className='text-gray-400 text-[10px]'>
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          {!notification.isRead && (
                            <button 
                              onClick={() => markAsRead(notification._id)}
                              className='text-blue-500 hover:text-blue-700 text-xs p-1'
                            >
                              ✓
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(notification._id)}
                            className='text-red-400 hover:text-red-600 text-xs p-1'
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className='hidden sm:flex items-start gap-4'>
                  <div className='text-2xl flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center'>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1 flex-wrap'>
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
                  <div className='flex gap-2 flex-shrink-0'>
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification._id)}
                        className='px-3 py-1.5 text-blue-500 hover:bg-blue-50 rounded-lg text-sm transition-colors'
                      >
                        ✓ Read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification._id)}
                      className='px-3 py-1.5 text-red-400 hover:bg-red-50 rounded-lg text-sm transition-colors'
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {!loading && filteredNotifications.length > 0 && (
          <div className='mt-4 sm:mt-6 text-center'>
            <p className='text-gray-400 text-xs sm:text-sm'>
              Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` (filtered)`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
