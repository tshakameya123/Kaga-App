import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { validatePassword } from '../utils/security'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContext)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' })

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/user/verify-reset-token/${token}`,
          { timeout: 15000 }
        )
        if (data.success) {
          setIsTokenValid(true)
        } else {
          setIsTokenValid(false)
        }
      } catch (error) {
        console.error('Token verification error:', error)
        setIsTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }

    if (token) {
      verifyToken()
    } else {
      setIsVerifying(false)
      setIsTokenValid(false)
    }
  }, [token, backendUrl])

  const validateInputs = () => {
    const newErrors = { password: '', confirmPassword: '' }
    let isValid = true

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message
      isValid = false
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateInputs()) {
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/reset-password`,
        { token, newPassword: password },
        { timeout: 15000 }
      )

      if (data.success) {
        setIsSuccess(true)
        toast.success('Password reset successfully!')
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      const message = error.response?.data?.message || 'An error occurred. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isVerifying) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-8 px-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>Verifying your reset link...</p>
        </div>
      </div>
    )
  }

  // Invalid or expired token
  if (!isTokenValid && !isVerifying) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-8 px-4'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
              <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
              </svg>
            </div>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>Invalid or Expired Link</h2>
            <p className='text-gray-600 text-sm mb-6'>
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <div className='flex flex-col gap-3'>
              <Link
                to='/forgot-password'
                className='w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all'
              >
                Request New Link
              </Link>
              <Link
                to='/login'
                className='w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all'
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-8 px-4'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
              <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>Password Reset Successful!</h2>
            <p className='text-gray-600 text-sm mb-4'>
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>
            <Link
              to='/login'
              className='inline-flex items-center gap-2 text-primary font-medium hover:underline'
            >
              Go to Login
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-8 px-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-6 sm:mb-8'>
          <div className='inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl mb-4'>
            <svg className='w-7 h-7 sm:w-8 sm:h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            Set New Password
          </h1>
          <p className='text-gray-600 mt-2 text-sm sm:text-base'>
            Create a strong password for your account
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8'>
          <div className='space-y-4 sm:space-y-5'>
            {/* New Password */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>New Password</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                  }}
                  className={`w-full pl-10 pr-12 py-3 border-2 ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900`}
                  placeholder='Enter new password'
                  autoComplete='new-password'
                  disabled={isSubmitting}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
              {!errors.password && (
                <p className='text-gray-500 text-xs mt-1'>
                  Minimum 8 characters with uppercase, lowercase, and a number
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Confirm Password</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
                  }}
                  className={`w-full pl-10 pr-12 py-3 border-2 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900`}
                  placeholder='Confirm new password'
                  autoComplete='new-password'
                  disabled={isSubmitting}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                >
                  {showConfirmPassword ? (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className='text-red-500 text-xs mt-1'>{errors.confirmPassword}</p>}
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
                Resetting...
              </>
            ) : (
              <>
                Reset Password
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </>
            )}
          </button>

          {/* Back to Login */}
          <div className='text-center mt-6'>
            <Link
              to='/login'
              className='inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
              </svg>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
