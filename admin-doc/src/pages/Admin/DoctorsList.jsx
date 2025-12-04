import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
  const { doctors, changeAvailability, deleteDoctor, editDoctor, aToken, getAllDoctors } = useContext(AdminContext);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newImage, setNewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpeciality, setFilterSpeciality] = useState('All');

  const specialities = [
    'General physician',
    'Gynecologist', 
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ];

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  const handleDelete = (docId, docName) => {
    setDeleteConfirm({ id: docId, name: docName });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteDoctor(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (doctor) => {
    setEditForm({
      docId: doctor._id,
      name: doctor.name,
      email: doctor.email,
      speciality: doctor.speciality,
      degree: doctor.degree,
      experience: doctor.experience,
      about: doctor.about,
      fees: doctor.fees,
      address: doctor.address || { line1: '', line2: '' },
      available: doctor.available
    });
    setEditModal(doctor);
    setNewImage(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('docId', editForm.docId);
    formData.append('name', editForm.name);
    formData.append('email', editForm.email);
    formData.append('speciality', editForm.speciality);
    formData.append('degree', editForm.degree);
    formData.append('experience', editForm.experience);
    formData.append('about', editForm.about);
    formData.append('fees', editForm.fees);
    formData.append('address', JSON.stringify(editForm.address));
    formData.append('available', editForm.available);
    
    if (newImage) {
      formData.append('image', newImage);
    }

    const success = await editDoctor(formData);
    setIsSubmitting(false);
    
    if (success) {
      setEditModal(null);
      setNewImage(null);
    }
  };

  // Filter doctors based on search and speciality
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpeciality = filterSpeciality === 'All' || doc.speciality === filterSpeciality;
    return matchesSearch && matchesSpeciality;
  });

  const availableCount = doctors.filter(d => d.available).length;
  const unavailableCount = doctors.filter(d => !d.available).length;

  return (
    <div className="w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Doctors Directory</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and monitor all registered doctors</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 border border-primary/30">
              <p className="text-lg sm:text-2xl font-bold text-primary">{doctors.length}</p>
              <p className="text-[10px] sm:text-xs text-primary font-medium">Total</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 border border-green-200">
              <p className="text-lg sm:text-2xl font-bold text-green-600">{availableCount}</p>
              <p className="text-[10px] sm:text-xs text-green-600 font-medium">Available</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 border border-red-200">
              <p className="text-lg sm:text-2xl font-bold text-red-600">{unavailableCount}</p>
              <p className="text-[10px] sm:text-xs text-red-600 font-medium">Unavailable</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            />
          </div>
          <select
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className="w-full sm:w-56 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-sm"
          >
            <option value="All">All Specialities</option>
            {specialities.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center mb-2">Delete Doctor</h3>
            <p className="text-sm sm:text-base text-gray-500 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteConfirm.name}</span>? 
              This will also remove all their appointments.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Edit Doctor Profile</h3>
              <button onClick={() => setEditModal(null)} className="text-white/80 hover:text-white transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
              {/* Image Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mb-6 pb-6 border-b border-gray-100">
                <div className="relative">
                  <img 
                    src={newImage ? URL.createObjectURL(newImage) : editModal.image} 
                    alt={editForm.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white ${editForm.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-gray-800">{editModal.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{editModal.speciality}</p>
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Change Photo
                    <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* Name & Email */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Speciality & Degree */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Speciality</label>
                    <select
                      value={editForm.speciality}
                      onChange={(e) => setEditForm({...editForm, speciality: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white text-sm"
                      required
                    >
                      {specialities.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Degree</label>
                    <input
                      type="text"
                      value={editForm.degree}
                      onChange={(e) => setEditForm({...editForm, degree: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Experience & Fees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
                    <select
                      value={editForm.experience}
                      onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white text-sm"
                      required
                    >
                      {[1,2,3,4,5,6,7,8,9,10,15,20].map((yr) => (
                        <option key={yr} value={`${yr} Year`}>{yr} Year{yr > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fee (UGX)</label>
                    <input
                      type="number"
                      value={editForm.fees}
                      onChange={(e) => setEditForm({...editForm, fees: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1</label>
                    <input
                      type="text"
                      value={editForm.address?.line1 || ''}
                      onChange={(e) => setEditForm({...editForm, address: {...editForm.address, line1: e.target.value}})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                    <input
                      type="text"
                      value={editForm.address?.line2 || ''}
                      onChange={(e) => setEditForm({...editForm, address: {...editForm.address, line2: e.target.value}})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    />
                  </div>
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">About</label>
                  <textarea
                    value={editForm.about}
                    onChange={(e) => setEditForm({...editForm, about: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-sm"
                    required
                  />
                </div>

                {/* Available Toggle */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Availability Status</p>
                    <p className="text-xs sm:text-sm text-gray-500">Toggle doctor's availability</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.available}
                      onChange={(e) => setEditForm({...editForm, available: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-primary rounded-xl hover:bg-primary-light transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">No doctors found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredDoctors.map((item, index) => (
            <div
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              key={index}
            >
              {/* Card Header with Image */}
              <div className="relative">
                <img
                  className="w-full h-36 sm:h-48 object-cover"
                  src={item.image}
                  alt={item.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Status Badge */}
                <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                  item.available 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {item.available ? '● Available' : '● Unavailable'}
                </div>

                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-white font-bold text-base sm:text-lg">{item.name}</h3>
                  <p className="text-white/80 text-xs sm:text-sm">{item.speciality}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 sm:p-4">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5">
                    <p className="text-[10px] sm:text-xs text-gray-500">Experience</p>
                    <p className="font-semibold text-gray-800 text-sm">{item.experience}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5">
                    <p className="text-[10px] sm:text-xs text-gray-500">Fee</p>
                    <p className="font-semibold text-gray-800 text-sm">UGX {item.fees?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Degree */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="truncate">{item.degree}</span>
                </div>

                {/* Toggle Availability */}
                <div className="flex items-center justify-between py-2 sm:py-3 px-2 sm:px-3 bg-gray-50 rounded-lg mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Available for booking</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.available}
                      onChange={() => changeAvailability(item._id)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 sm:w-9 sm:h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 sm:after:h-4 sm:after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-primary bg-primary/10 rounded-lg sm:rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    className="flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 bg-red-50 rounded-lg sm:rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
