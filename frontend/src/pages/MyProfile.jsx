import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { sanitizeInput, validatePhone, validateName, validatePassword } from '../utils/security';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
    const { token, backendUrl, userData, setUserData, loadUserProfileData, handleLogout } = useContext(AppContext);
    const navigate = useNavigate();

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Function to update user profile data using API
    const updateUserProfileData = async () => {
        try {
            // Validate inputs before submission
            const nameValidation = validateName(userData.name);
            if (!nameValidation.isValid) {
                toast.error(nameValidation.message);
                return;
            }

            const phoneValidation = validatePhone(userData.phone);
            if (!phoneValidation.isValid) {
                toast.error(phoneValidation.message);
                return;
            }

            setLoading(true);
            const formData = new FormData();
            // Sanitize text inputs
            formData.append('name', sanitizeInput(userData.name.trim()));
            formData.append('phone', sanitizeInput(userData.phone || ''));
            formData.append('address', JSON.stringify({
                line1: sanitizeInput(userData.address?.line1 || ''),
                line2: sanitizeInput(userData.address?.line2 || '')
            }));
            formData.append('gender', sanitizeInput(userData.gender || 'Not Selected'));
            formData.append('dob', userData.dob || '');
            
            // Validate image file if provided
            if (image) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                const maxSize = 5 * 1024 * 1024; // 5MB
                
                if (!allowedTypes.includes(image.type)) {
                    toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
                    setLoading(false);
                    return;
                }
                if (image.size > maxSize) {
                    toast.error('Image size must be less than 5MB');
                    setLoading(false);
                    return;
                }
                formData.append('image', image);
            }

            const { data } = await axios.post(
                backendUrl + '/api/user/update-profile', 
                formData, 
                { 
                    headers: { token },
                    timeout: 30000, // Longer timeout for file upload
                }
            );

            if (data.success) {
                toast.success(data.message);
                await loadUserProfileData();
                setIsEdit(false);
                setImage(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('[Profile] Update error:', error);
            const status = error.response?.status;
            if (status === 401) {
                toast.error('Session expired. Please login again.');
            } else if (status === 429) {
                toast.error('Too many requests. Please wait a moment.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to update profile');
            }
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Change Password Handler
    const handleChangePassword = async () => {
        const errors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        const passwordValidation = validatePassword(passwordData.newPassword);
        if (!passwordValidation.isValid) {
            errors.newPassword = passwordValidation.message;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setPasswordLoading(true);
        setPasswordErrors({});

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/change-password`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                { headers: { token }, timeout: 15000 }
            );

            if (data.success) {
                toast.success('Password changed successfully');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Change password error:', error);
            const message = error.response?.data?.message || 'Failed to change password';
            toast.error(message);
        } finally {
            setPasswordLoading(false);
        }
    };

    // Delete Account Handler
    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error('Please enter your password to confirm');
            return;
        }

        setDeleteLoading(true);

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/delete-account`,
                { password: deletePassword },
                { headers: { token }, timeout: 15000 }
            );

            if (data.success) {
                toast.success('Account deleted successfully');
                handleLogout();
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Delete account error:', error);
            const message = error.response?.data?.message || 'Failed to delete account';
            toast.error(message);
        } finally {
            setDeleteLoading(false);
            setShowDeleteConfirm(false);
            setDeletePassword('');
        }
    };

    const hasValidImage = (img) => {
        return img && img.trim() !== '' && (img.startsWith('http') || img.startsWith('data:image'));
    };

    return userData ? (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    {/* Cover Background */}
                    <div className="h-24 sm:h-32 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 relative">
                        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, white 2%, transparent 2%), radial-gradient(circle at 75% 75%, white 2%, transparent 2%)', backgroundSize: '60px 60px'}}></div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="px-4 sm:px-8 pb-6 -mt-12 sm:-mt-16">
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                            {/* Avatar */}
                            <div className="relative">
                                {isEdit ? (
                                    <label htmlFor='image' className="cursor-pointer group block">
                                        <div className="relative">
                                            {hasValidImage(image ? URL.createObjectURL(image) : userData.image) ? (
                                                <img 
                                                    className='w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white' 
                                                    src={image ? URL.createObjectURL(image) : userData.image} 
                                                    alt="Profile" 
                                                />
                                            ) : (
                                                <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold'>
                                                    {getInitials(userData.name)}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <div className="text-center text-white">
                                                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-xs">Change</span>
                                                </div>
                                            </div>
                                        </div>
                                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden accept="image/*" />
                                    </label>
                                ) : (
                                    hasValidImage(userData.image) ? (
                                        <img 
                                            className='w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white' 
                                            src={userData.image} 
                                            alt="Profile" 
                                        />
                                    ) : (
                                        <div className='w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold'>
                                            {getInitials(userData.name)}
                                        </div>
                                    )
                                )}
                                {/* Online indicator */}
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 sm:border-4 border-white rounded-full"></div>
                            </div>

                            {/* Name and Email */}
                            <div className="flex-1 text-center sm:text-left sm:pb-2">
                                {isEdit ? (
                                    <input 
                                        className='text-xl sm:text-2xl font-bold bg-gray-50 p-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full max-w-xs text-gray-900' 
                                        type="text" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                                        value={userData.name} 
                                        placeholder="Your name"
                                    />
                                ) : (
                                    <h1 className='text-xl sm:text-2xl font-bold text-gray-900'>{userData.name}</h1>
                                )}
                                <p className="text-gray-500 mt-1">{userData.email}</p>
                            </div>

                            {/* Edit Button - Desktop */}
                            <div className="hidden sm:block">
                                {!isEdit && (
                                    <button 
                                        onClick={() => setIsEdit(true)} 
                                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            Contact Information
                        </h2>

                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Email Address</label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-900">{userData.email}</span>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Phone Number</label>
                                {isEdit ? (
                                    <input 
                                        className='w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all' 
                                        type="tel" 
                                        onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                        value={userData.phone} 
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="text-gray-900">{userData.phone && userData.phone !== '000000000' ? userData.phone : 'Not specified'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Address</label>
                                {isEdit ? (
                                    <div className="space-y-3">
                                        <input 
                                            className='w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all' 
                                            type="text" 
                                            onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                                            value={userData.address.line1} 
                                            placeholder="Street address"
                                        />
                                        <input 
                                            className='w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all' 
                                            type="text" 
                                            onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                                            value={userData.address.line2} 
                                            placeholder="City, Region"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            {userData.address.line1 || userData.address.line2 ? (
                                                <>
                                                    <p className="text-gray-900">{userData.address.line1 || 'Not specified'}</p>
                                                    {userData.address.line2 && <p className="text-gray-600">{userData.address.line2}</p>}
                                                </>
                                            ) : (
                                                <p className="text-gray-500">Not specified</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-xl">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            Personal Information
                        </h2>

                        <div className="space-y-4">
                            {/* Gender */}
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Gender</label>
                                {isEdit ? (
                                    <select 
                                        className='w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer' 
                                        onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                                        value={userData.gender}
                                    >
                                        <option value="Not Selected">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-gray-900">{userData.gender && userData.gender !== 'Not Selected' ? userData.gender : 'Not specified'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Date of Birth</label>
                                {isEdit ? (
                                    <input 
                                        className='w-full p-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all' 
                                        type='date' 
                                        onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                                        value={userData.dob && userData.dob !== 'Not Selected' ? userData.dob : ''} 
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-900">{userData.dob && userData.dob !== 'Not Selected' ? userData.dob : 'Not specified'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Stats */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Account Status</h3>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Active Account
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-xl">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        Security & Account
                    </h2>

                    {/* Change Password Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-1.5 block">Current Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => {
                                            setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                                            if (passwordErrors.currentPassword) setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                                        }}
                                        className={`w-full p-3 pr-10 bg-white border-2 ${passwordErrors.currentPassword ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.current ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 mb-1.5 block">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) => {
                                                setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                                                if (passwordErrors.newPassword) setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                                            }}
                                            className={`w-full p-3 pr-10 bg-white border-2 ${passwordErrors.newPassword ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 mb-1.5 block">Confirm Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => {
                                                setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                                                if (passwordErrors.confirmPassword) setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                                            }}
                                            className={`w-full p-3 pr-10 bg-white border-2 ${passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
                                </div>
                            </div>

                            <p className="text-gray-500 text-xs">
                                Password must be at least 8 characters with uppercase, lowercase, and a number
                            </p>

                            <button
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {passwordLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h3>
                        <div className="bg-red-50 rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="font-medium text-gray-900">Delete Account</h4>
                                    <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all text-sm"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Account Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Your Account?</h3>
                                <p className="text-gray-600 text-sm">
                                    This action cannot be undone. All your data, including appointments and profile information, will be permanently deleted.
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Enter your password to confirm</label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletePassword('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading || !deletePassword}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleteLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Account'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {isEdit && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button 
                                onClick={() => {
                                    setIsEdit(false);
                                    setImage(null);
                                    loadUserProfileData();
                                }} 
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={updateUserProfileData}
                                disabled={loading}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Edit Button */}
                {!isEdit && (
                    <div className="sm:hidden mt-6">
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    ) : null;
};

export default MyProfile;