import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorProfile = () => {
    const { dToken, profileData, setProfileData, getProfileData, userRole } = useContext(DoctorContext);
    const { currency, backendUrl } = useContext(AppContext);
    const [isEdit, setIsEdit] = useState(false);

    const updateProfile = async () => {
        try {
            const updateData = {
                address: profileData.address,
                fees: profileData.fees,
                about: profileData.about,
                available: profileData.available,
                name: profileData.name,
                degree: profileData.degree,
                speciality: profileData.speciality,
                experience: profileData.experience
            };

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } });

            if (data.success) {
                toast.success(data.message);
                setIsEdit(false);
                getProfileData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error);
        }
    };

    useEffect(() => {
        if (dToken) {
            getProfileData();
        }
    }, [dToken]);

    return profileData && (
        <div className="bg-gray-100 p-5 min-h-screen flex flex-col items-center">
            <div className="max-w-3xl w-full bg-white shadow-md rounded-lg overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center p-8">
                    <img className="w-32 h-32 object-cover rounded-full border-4 border-primary mb-4 sm:mb-0" src={profileData.image} alt="Doctor Profile" />

                    <div className="flex-1 sm:pl-6">
                        {isEdit ? (
                            <input
                                type='text'
                                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                value={profileData.name}
                                className='text-2xl font-semibold text-gray-800 outline-none border-b-2 border-primary'
                            />
                        ) : (
                            <p className='text-2xl font-semibold text-gray-800'>{profileData.name}</p>
                        )}
                        
                        <div className='flex items-center gap-2 text-gray-600 mt-1'>
                            {isEdit ? (
                                <input
                                    type='text'
                                    onChange={(e) => setProfileData(prev => ({ ...prev, degree: e.target.value }))}
                                    value={profileData.degree}
                                    className='text-sm border-b-2 border-primary outline-none'
                                />
                            ) : (
                                <p>{profileData.degree}</p>
                            )}
                            {isEdit ? (
                                <input
                                    type='text'
                                    onChange={(e) => setProfileData(prev => ({ ...prev, speciality: e.target.value }))}
                                    value={profileData.speciality}
                                    className='text-sm border-b-2 border-primary outline-none'
                                />
                            ) : (
                                <p>- {profileData.speciality}</p>
                            )}
                            <span className='py-1 px-3 bg-primary text-white text-xs rounded-full'>{profileData.experience}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t p-6">
                    <h3 className="text-gray-800 font-semibold text-lg mb-2">About</h3>
                    {isEdit ? (
                        <textarea
                            onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                            className='w-full border border-gray-300 p-2 rounded-lg outline-none resize-none'
                            rows={4}
                            value={profileData.about}
                        />
                    ) : (
                        <p className='text-gray-700'>{profileData.about}</p>
                    )}
                </div>

                <div className="border-t p-6">
                    <h3 className="text-gray-800 font-semibold text-lg mb-2">Details</h3>
                    <div className="text-gray-700">
                        <p><strong>Appointment Fee:</strong> {currency} {isEdit ? (
                            <input
                                type='number'
                                onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                                value={profileData.fees}
                                className='border-b-2 border-primary outline-none'
                            />
                        ) : (
                            profileData.fees
                        )}</p>
                        <p className="mt-2"><strong>Address:</strong></p>
                        <p className="text-sm">
                            {isEdit ? (
                                <>
                                    <input type='text' className='border-b-2 border-primary outline-none' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={profileData.address.line1} />
                                    <br />
                                    <input type='text' className='border-b-2 border-primary outline-none' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={profileData.address.line2} />
                                </>
                            ) : (
                                <>
                                    {profileData.address.line1}<br />
                                    {profileData.address.line2}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="border-t p-6">
                    <label className="flex items-center gap-2 text-gray-700">
                        <input type="checkbox" onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} checked={profileData.available} />
                        Available for Appointments
                    </label>
                </div>

                <div className="border-t p-6 flex justify-end gap-3">
                    {isEdit ? (
                        <button onClick={updateProfile} className='bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all'>Save</button>
                    ) : (
                        <button onClick={() => setIsEdit(prev => !prev)} className='border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white transition-all'>Edit</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
