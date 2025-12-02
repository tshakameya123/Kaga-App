import React, { useCallback } from 'react';
import { specialityData } from '../assets/assets';
import { Link } from 'react-router-dom';

const SpecialityMenu = () => {
    const handleScrollToTop = useCallback(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div id='speciality' className='flex flex-col items-center gap-8 py-12 text-[#262626] bg-white'>
            <div className='text-center mb-4'>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 shadow-md mb-2'>Doctors by Speciality</h1>
                <p className='text-sm text-gray-600 max-w-2xl mx-auto px-4'>
                    Choose from our comprehensive range of medical specialties
                </p>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-screen-xl mx-auto px-4'>
                {specialityData.map((item) => (
                    <Link 
                        to={`/doctors/${item.speciality}`} 
                        onClick={handleScrollToTop} 
                        className='flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ease-in-out transform hover:shadow-md hover:scale-105 hover:bg-white hover:border-blue-200'
                        key={item.id} 
                    >
                        <div className='w-12 h-12 mb-3 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-full'>
                            <img 
                                className='w-8 h-8 transition-transform duration-300 ease-in-out transform hover:scale-110' 
                                src={item.image} 
                                alt={`${item.speciality} service`} 
                                loading="lazy" 
                            />
                        </div>
                        <p className='text-center font-medium text-xs text-gray-700 transition-colors duration-300 ease-in-out hover:text-blue-600 leading-tight'>
                            {item.speciality}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SpecialityMenu;
