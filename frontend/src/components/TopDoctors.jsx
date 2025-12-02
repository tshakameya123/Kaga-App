import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const TopDoctors = () => {
    const navigate = useNavigate();
    const { availableDoctors } = useContext(AppContext);

    return (
        <section className="flex flex-col items-center gap-8 my-16 text-[#262626] px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-400 mb-2">Specialists</p>
                <h2 className="text-3xl font-bold text-gray-900">Available Doctors</h2>
                <p className="text-sm text-gray-500 mt-2">
                    Browse a curated list of doctors currently open for appointments.
                </p>
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">
                {availableDoctors.slice(0, 8).map((item) => (
                    <article
                        key={item._id}
                        onClick={() => {
                            navigate(`/appointment/${item._id}`);
                            window.scrollTo(0, 0);
                        }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                    >
                        <div className="relative px-4 pt-4">
                            <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gradient-to-br from-blue-50 to-slate-50 aspect-[5/4]">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = assets.profile_pic;
                                    }}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/85 text-gray-700 shadow">
                                    {item.experience ? `${String(item.experience).match(/\d+/)?.[0] || item.experience}+ yrs exp.` : 'Experienced'}
                                </div>
                                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow">
                                    Available
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-blue-600 font-medium">{item.speciality}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {item.about || 'Providing thoughtful, patient-first care with modern treatment plans.'}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
            <button
                onClick={() => {
                    navigate('/doctors');
                    window.scrollTo(0, 0);
                }}
                className="bg-blue-50 text-blue-700 font-medium px-8 py-3 rounded-full mt-8 hover:bg-blue-100 transition-colors duration-200"
            >
                View all doctors
            </button>
        </section>
    );
};

export default TopDoctors;
