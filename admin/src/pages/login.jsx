import axios from 'axios'
import React, { useContext, useState, useCallback } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import { isValidEmail } from '../utils/security'

const Login = () => {

  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  // Validate inputs before submission
  const validateInputs = useCallback(() => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [email, password]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      if (state === 'Admin') {
        const { data } = await axios.post(
          backendUrl + '/api/admin/login', 
          { email: trimmedEmail, password },
          { timeout: 15000 }
        );
        
        if (data.success) {
          // Store token securely
          setAToken(data.token);
          localStorage.setItem('aToken', data.token);
          toast.success('Login successful');
        } else {
          toast.error(data.message || 'Login failed');
        }
      } else {
        const { data } = await axios.post(
          backendUrl + '/api/doctor/login', 
          { email: trimmedEmail, password },
          { timeout: 15000 }
        );
        
        if (data.success) {
          // Store token securely
          setDToken(data.token);
          localStorage.setItem('dToken', data.token);
          toast.success('Login successful');
        } else {
          toast.error(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('[Login] Error:', error);
      
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 429) {
        toast.error('Too many login attempts. Please try again later.');
      } else if (status === 401) {
        toast.error('Invalid email or password');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Connection timeout. Please try again.');
      } else {
        toast.error(message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Handle email change with sanitization
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4'>
      <div className='w-full max-w-md'>
        {/* Logo/Brand */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg'>
            <span className='text-3xl'>🏥</span>
          </div>
          <h1 className='text-2xl font-bold text-gray-800'>Kaga Health</h1>
          <p className='text-gray-500 text-sm mt-1'>Healthcare Management System</p>
        </div>

        {/* Login Card */}
        <form onSubmit={onSubmitHandler} className='bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100'>
          {/* Toggle Buttons */}
          <div className='flex bg-gray-100 rounded-xl p-1 mb-6'>
            <button
              type='button'
              onClick={() => !isLoading && setState('Admin')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                state === 'Admin'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👤 Admin
            </button>
            <button
              type='button'
              onClick={() => !isLoading && setState('Doctor')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                state === 'Doctor'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🩺 Doctor
            </button>
          </div>

          <h2 className='text-xl font-semibold text-gray-800 mb-1'>
            Welcome back!
          </h2>
          <p className='text-gray-500 text-sm mb-6'>
            Sign in as {state.toLowerCase()} to continue
          </p>
          
          {/* Email Field */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Email Address</label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>📧</span>
              <input 
                onChange={handleEmailChange} 
                value={email} 
                className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`} 
                type="email" 
                placeholder="Enter your email"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className='text-red-500 text-xs mt-1.5 flex items-center gap-1'>⚠️ {errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Password</label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>🔒</span>
              <input 
                onChange={handlePasswordChange} 
                value={password}
                className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all`} 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1'
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className='text-red-500 text-xs mt-1.5 flex items-center gap-1'>⚠️ {errors.password}</p>}
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit"
            className={`w-full py-3 px-4 bg-primary text-white rounded-xl font-medium text-base transition-all flex items-center justify-center gap-2 ${
              isLoading 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className='animate-spin h-5 w-5' viewBox="0 0 24 24">
                  <circle className='opacity-25' cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className='opacity-75' fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </>
            ) : (
              <>Sign In →</>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className='text-center text-gray-400 text-xs mt-6'>
          © 2025 Kaga Health. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login