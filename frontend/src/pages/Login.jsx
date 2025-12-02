import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, Link } from 'react-router-dom'
import { sanitizeInput, isValidEmail, validatePassword, validateName, createRateLimiter } from '../utils/security'

// Rate limiter for login/register attempts (5 attempts per 15 minutes)
const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000);

const Login = () => {

  const [state, setState] = useState('Sign Up')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ name: '', email: '', password: '' })

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  // Validate all inputs
  const validateInputs = useCallback(() => {
    const newErrors = { name: '', email: '', password: '' };
    let isValid = true;

    // Name validation (only for Sign Up)
    if (state === 'Sign Up') {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        newErrors.name = nameValidation.message;
        isValid = false;
      }
    }

    // Email validation
    const sanitizedEmail = sanitizeInput(email.trim());
    if (!sanitizedEmail) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(sanitizedEmail)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (state === 'Sign Up') {
      // Stricter validation for signup
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
        isValid = false;
      }
    } else if (password.length < 6) {
      // Basic validation for login
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [name, email, password, state]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    // Check rate limit
    if (!authRateLimiter.checkLimit()) {
      const remaining = authRateLimiter.getRemainingTime();
      const minutes = Math.ceil(remaining / 60000);
      toast.error(`Too many attempts. Please try again in ${minutes} minute(s).`);
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
      const sanitizedName = state === 'Sign Up' ? sanitizeInput(name.trim()) : '';

      if (state === 'Sign Up') {
        const { data } = await axios.post(
          backendUrl + '/api/user/register', 
          { name: sanitizedName, email: sanitizedEmail, password },
          { timeout: 15000 }
        )

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Account created successfully!')
          // Redirect after successful signup
          setTimeout(() => {
            navigate('/')
          }, 500)
        } else {
          toast.error(data.message)
          setIsSubmitting(false)
        }
      } else {
        const { data } = await axios.post(
          backendUrl + '/api/user/login', 
          { email: sanitizedEmail, password },
          { timeout: 15000 }
        )

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Login successful!')
          // Redirect after successful login
          setTimeout(() => {
            navigate('/')
          }, 500)
        } else {
          toast.error(data.message)
          setIsSubmitting(false)
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 429) {
        toast.error('Too many attempts. Please try again later.');
      } else if (status === 401) {
        toast.error('Invalid email or password');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Connection timeout. Please try again.');
      } else {
        toast.error(message || 'An error occurred. Please try again.');
      }
      setIsSubmitting(false)
    }
  }

  // Handle input changes with error clearing
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  // Only redirect if user is already logged in when component mounts
  useEffect(() => {
    if (token) {
      navigate('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-8 px-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-6 sm:mb-8'>
          <div className='inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl mb-4'>
            <svg className='w-7 h-7 sm:w-8 sm:h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
            </svg>
          </div>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className='text-gray-600 mt-2 text-sm sm:text-base'>
            {state === 'Sign Up' ? 'Sign up to book your appointments' : 'Login to access your appointments'}
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={onSubmitHandler} className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8'>
          <div className='space-y-4 sm:space-y-5'>
            {state === 'Sign Up' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Full Name</label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                  </div>
                  <input 
                    onChange={handleNameChange} 
                    value={name} 
                    className={`w-full pl-10 pr-4 py-3 border-2 ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900`}
                    type='text' 
                    placeholder='Enter your full name'
                    autoComplete='name'
                    disabled={isSubmitting}
                    required 
                  />
                </div>
                {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name}</p>}
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email Address</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <input 
                  onChange={handleEmailChange} 
                  value={email} 
                  className={`w-full pl-10 pr-4 py-3 border-2 ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900`}
                  type='email' 
                  placeholder='Enter your email'
                  autoComplete='email'
                  disabled={isSubmitting}
                  required 
                />
              </div>
              {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Password</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                  </svg>
                </div>
                <input 
                  onChange={handlePasswordChange} 
                  value={password} 
                  className={`w-full pl-10 pr-12 py-3 border-2 ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  autoComplete={state === 'Sign Up' ? 'new-password' : 'current-password'}
                  disabled={isSubmitting}
                  required 
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                  disabled={isSubmitting}
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
              {state === 'Sign Up' && !errors.password && (
                <p className='text-gray-500 text-xs mt-1'>
                  Password must be at least 8 characters with uppercase, lowercase, and a number
                </p>
              )}
              {state === 'Login' && (
                <div className='flex justify-end mt-1'>
                  <Link 
                    to='/forgot-password' 
                    className='text-primary text-sm hover:underline'
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
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
                Processing...
              </>
            ) : (
              <>
                {state === 'Sign Up' ? 'Create Account' : 'Sign In'}
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
                </svg>
              </>
            )}
          </button>

          {/* Divider */}
          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-200'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white text-gray-500'>or</span>
            </div>
          </div>

          {/* Toggle Sign Up / Login */}
          <div className='text-center'>
            {state === 'Sign Up' ? (
              <p className='text-gray-600 text-sm sm:text-base'>
                Already have an account?{' '}
                <button 
                  type='button'
                  onClick={() => !isSubmitting && setState('Login')} 
                  className='text-primary font-semibold hover:underline'
                  disabled={isSubmitting}
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className='text-gray-600 text-sm sm:text-base'>
                Don't have an account?{' '}
                <button 
                  type='button'
                  onClick={() => !isSubmitting && setState('Sign Up')} 
                  className='text-primary font-semibold hover:underline'
                  disabled={isSubmitting}
                >
                  Create one
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <p className='text-center text-xs sm:text-sm text-gray-500 mt-6'>
          By continuing, you agree to our{' '}
          <a href='#' className='text-primary hover:underline'>Terms of Service</a>
          {' '}and{' '}
          <a href='#' className='text-primary hover:underline'>Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}

export default Login