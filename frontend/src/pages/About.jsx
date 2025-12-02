import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { 
  RiStethoscopeLine, 
  RiUserHeartLine, 
  RiShieldCheckLine, 
  RiTeamLine,
  RiAwardLine,
  RiGlobalLine,
  RiTimeLine,
  RiCustomerService2Line,
  RiMedicineBottleLine,
  RiHospitalLine
} from 'react-icons/ri';

const About = () => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // If logged in, go to doctors page to book appointment
      navigate('/doctors');
    } else {
      // If not logged in, go to login page first
      navigate('/login');
    }
  };

  const handleLearnMore = () => {
    // Navigate to contact page for more information
    navigate('/contact');
  };

  const stats = [
    { number: "500+", label: "Patients Served", icon: RiUserHeartLine },
    { number: "25+", label: "Expert Doctors", icon: RiStethoscopeLine },
    { number: "6", label: "Medical Specialties", icon: RiMedicineBottleLine },
    { number: "99%", label: "Patient Satisfaction", icon: RiAwardLine }
  ];

  const values = [
    {
      icon: RiShieldCheckLine,
      title: "Quality Care",
      description: "We maintain the highest standards of medical care with certified professionals and state-of-the-art equipment."
    },
    {
      icon: RiTimeLine,
      title: "Accessibility",
      description: "24/7 online booking system with flexible scheduling to accommodate your busy lifestyle."
    },
    {
      icon: RiTeamLine,
      title: "Expert Team",
      description: "Our diverse team of specialists brings years of experience and continuous learning to patient care."
    },
    {
      icon: RiGlobalLine,
      title: "Innovation",
      description: "Leveraging cutting-edge technology to provide seamless healthcare experiences and better outcomes."
    }
  ];

  const specialties = [
    "General Medicine",
    "Gynecology", 
    "Dermatology",
    "Pediatrics",
    "Neurology",
    "Gastroenterology"
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-primary to-primary-dark text-white py-12 sm:py-16 md:py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 text-center'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight'>
            About <span className='text-red-200'>Kaga Health</span>
          </h1>
          <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-red-100 max-w-4xl mx-auto leading-relaxed px-2'>
            Transforming healthcare delivery through innovative technology and compassionate care. 
            We're committed to making quality healthcare accessible, convenient, and personalized for everyone.
          </p>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className='py-12 sm:py-16 md:py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='grid lg:grid-cols-2 gap-8 lg:gap-16 items-center'>
            <div className='order-2 lg:order-1'>
              <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8'>Our Mission</h2>
              <p className='text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6'>
                To revolutionize healthcare access by providing a seamless digital platform that connects patients 
                with qualified healthcare professionals. We believe that quality healthcare should be accessible, 
                convenient, and personalized for every individual, regardless of their location or circumstances.
              </p>
              <p className='text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed'>
                Our platform eliminates traditional barriers to healthcare access, making it easier for patients 
                to find the right specialists, book appointments, and manage their health journey effectively.
              </p>
            </div>
            <div className='relative order-1 lg:order-2 mx-4 sm:mx-0'>
              <img 
                className='w-full rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl' 
                src={assets.about_image} 
                alt="Kaga Health Team" 
              />
              <div className='absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 md:-bottom-6 md:-right-6 bg-primary text-white p-2.5 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-lg'>
                <RiHospitalLine className='text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1 md:mb-2' />
                <p className='font-semibold text-xs sm:text-sm md:text-base'>Healthcare Excellence</p>
                <p className='text-[10px] sm:text-xs md:text-sm text-red-100'>Since 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className='py-12 sm:py-16 md:py-20 bg-primary'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12 sm:mb-16'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4'>Our Impact</h2>
            <p className='text-base sm:text-lg md:text-xl text-red-100 px-2'>Numbers that reflect our commitment to healthcare excellence</p>
          </div>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8'>
            {stats.map((stat, index) => (
              <div key={index} className='text-center'>
                <div className='bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 hover:bg-white/20 transition-all duration-300'>
                  <stat.icon className='text-2xl sm:text-3xl md:text-4xl text-white mx-auto mb-2 sm:mb-4' />
                  <div className='text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2'>{stat.number}</div>
                  <div className='text-red-100 font-medium text-xs sm:text-sm md:text-base'>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className='py-12 sm:py-16 md:py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12 sm:mb-16'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4'>Our Core Values</h2>
            <p className='text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2'>
              The principles that guide everything we do and shape our commitment to exceptional healthcare delivery
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8'>
            {values.map((value, index) => (
              <div key={index} className='text-center group'>
                <div className='bg-red-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 group-hover:bg-red-100 transition-all duration-300 h-full'>
                  <value.icon className='text-3xl sm:text-4xl md:text-5xl text-primary mx-auto mb-4 sm:mb-6' />
                  <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4'>{value.title}</h3>
                  <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className='py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-red-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12 sm:mb-16'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4'>Medical Specialties</h2>
            <p className='text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2'>
              Comprehensive healthcare services across multiple specialties to meet all your medical needs
            </p>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
            {specialties.map((specialty, index) => {
              const specialtyIcons = {
                "General Medicine": "🩺",
                "Gynecology": "👩‍⚕️",
                "Dermatology": "🧴",
                "Pediatrics": "👶",
                "Neurology": "🧠",
                "Gastroenterology": "🫀"
              };
              
              const specialtyColors = [
                "from-blue-500 to-blue-600",
                "from-pink-500 to-pink-600", 
                "from-green-500 to-green-600",
                "from-yellow-500 to-yellow-600",
                "from-purple-500 to-purple-600",
                "from-red-500 to-red-600"
              ];
              
              return (
                <div 
                  key={index} 
                  className='group relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 border border-gray-100 overflow-hidden h-full'
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${specialtyColors[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Icon */}
                  <div className='text-center mb-4 sm:mb-6'>
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${specialtyColors[index]} text-white text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {specialtyIcons[specialty]}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className='text-center relative z-10'>
                    <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300'>
                      {specialty}
                    </h3>
                    <p className='text-gray-600 text-xs sm:text-sm leading-relaxed'>
                      Expert care and treatment for {specialty.toLowerCase()} conditions with personalized attention and modern medical practices.
                    </p>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-${specialtyColors[index].split('-')[1]}-500 group-hover:to-${specialtyColors[index].split('-')[3]}-600 transition-all duration-300`}></div>
                </div>
              );
            })}
          </div>
          
          {/* Bottom CTA */}
          <div className='text-center mt-12 sm:mt-16'>
            <div className='inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white rounded-full px-4 sm:px-8 py-3 sm:py-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 max-w-full'>
              <RiMedicineBottleLine className='text-xl sm:text-2xl text-primary flex-shrink-0' />
              <span className='text-gray-700 font-medium text-sm sm:text-base text-center sm:text-left'>
                Need a different specialty? 
                <span 
                  onClick={handleLearnMore}
                  className='text-primary font-semibold ml-1 sm:ml-2 cursor-pointer hover:underline transition-all duration-300 block sm:inline'
                >
                  Contact us for more information
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className='py-12 sm:py-16 md:py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-12 sm:mb-16'>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4'>Why Choose Kaga Health?</h2>
            <p className='text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2'>
              Discover what sets us apart in the healthcare industry
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
            <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 h-full'>
              <RiCustomerService2Line className='text-3xl sm:text-4xl text-primary mb-4 sm:mb-6' />
              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4'>24/7 Support</h3>
              <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                Our dedicated support team is available around the clock to assist you with any questions 
                or concerns. We're here to ensure your healthcare journey is smooth and stress-free.
              </p>
            </div>
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 h-full'>
              <RiTimeLine className='text-3xl sm:text-4xl text-green-600 mb-4 sm:mb-6' />
              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4'>Convenient Booking</h3>
              <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                Book appointments in seconds with our intuitive platform. Choose your preferred time slot, 
                doctor, and location - all from the comfort of your home or office.
              </p>
            </div>
            <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all duration-300 h-full'>
              <RiShieldCheckLine className='text-3xl sm:text-4xl text-purple-600 mb-4 sm:mb-6' />
              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4'>Secure & Private</h3>
              <p className='text-sm sm:text-base text-gray-700 leading-relaxed'>
                Your health information is protected with enterprise-grade security. We comply with all 
                healthcare privacy regulations to ensure your data remains confidential and secure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='py-12 sm:py-16 md:py-20 bg-primary'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 text-center'>
          <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6'>Ready to Experience Better Healthcare?</h2>
          <p className='text-base sm:text-lg md:text-xl text-red-100 mb-6 sm:mb-8 leading-relaxed px-2'>
            Join thousands of patients who have already discovered the convenience and quality of Kaga Health. 
            Book your first appointment today and take the first step towards better health.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto'>
            <button 
              onClick={handleBookAppointment}
              className='bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto'
            >
              Book Appointment
            </button>
            <button 
              onClick={handleLearnMore}
              className='border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-white hover:text-primary transition-all duration-300 hover:shadow-xl transform hover:scale-105 w-full sm:w-auto'
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
