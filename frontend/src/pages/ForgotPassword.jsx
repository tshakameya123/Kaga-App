import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { isValidEmail } from '../utils/security'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { backendUrl } = useContext(AppContext)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!isValidEmail(email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/forgot-password`,
        { email: email.trim().toLowerCase() },
        { timeout: 15000 }
      )

      if (data.success) {
        setIsSuccess(true)
        toast.success('Password reset instructions sent!')
        
        // For development, log the reset URL if provided
        if (data.resetUrl) {
          console.log('Reset URL (dev only):', data.resetUrl)
        }
      } else {
        toast.error(data.message || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      const status = error.response?.status
      if (status === 429) {
        toast.error('Too many requests. Please try again later.')
      } else {
        toast.error(error.response?.data?.message || 'An error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-8 px-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-6 sm:mb-8'>
          <div className='inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl mb-4'>
            <svg className='w-7 h-7 sm:w-8 sm:h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' />
            </svg>
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            Forgot Password?
          </h1>
          <p className='text-gray-600 mt-2 text-sm sm:text-base'>
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {/* Form Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8'>
          {!isSuccess ? (
            <form onSubmit={handleSubmit}>
              <div className='space-y-4 sm:space-y-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email Address</label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                      </svg>
                    </div>
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900'
                      placeholder='Enter your email address'
                      autoComplete='email'
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type='submit'
                disabled={isSubmitting}
                className={`w-full mt-6 py-3 sm:py-3.5 rounded-xl text-white font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-primary/50 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className='text-center py-4'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
                <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Check your email</h3>
              <p className='text-gray-600 text-sm mb-4'>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className='text-gray-500 text-xs'>
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                  className='text-primary hover:underline'
                >
                  try again
                </button>
              </p>
            </div>
          )}

          {/* Divider */}
          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-200'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white text-gray-500'>or</span>
            </div>
          </div>

          {/* Back to Login */}
          <div className='text-center'>
            <Link
              to='/login'
              className='inline-flex items-center gap-2 text-primary font-medium hover:underline'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
