import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { RiMapPin2Line, RiPhoneLine, RiMailLine, RiGlobalLine, RiFacebookBoxLine, RiTwitterLine, RiInstagramLine, RiLinkedinBoxLine } from 'react-icons/ri';

const Footer = () => {
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 py-12">
          {/* About Section */}
          <div className="space-y-6">
            <img 
              className="w-24 cursor-pointer" 
              src={assets.logo} 
              alt="Kaga Health Logo" 
              onClick={() => handleNavClick('/')}
            />
            <p className="text-gray-600 leading-relaxed">
              Kaga Health is committed to revolutionizing healthcare access through our innovative digital platform. 
              We connect patients with qualified healthcare professionals, ensuring quality care is just a click away.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <RiFacebookBoxLine className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <RiTwitterLine className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <RiInstagramLine className="text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <RiLinkedinBoxLine className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-wider text-gray-900">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => handleNavClick('/')} className="text-gray-600 hover:text-primary transition-colors">Home</button>
              </li>
              <li>
                <button onClick={() => handleNavClick('/about')} className="text-gray-600 hover:text-primary transition-colors">About Us</button>
              </li>
              <li>
                <button onClick={() => handleNavClick('/doctors')} className="text-gray-600 hover:text-primary transition-colors">Find Doctors</button>
              </li>
              <li>
                <button onClick={() => handleNavClick('/contact')} className="text-gray-600 hover:text-primary transition-colors">Contact</button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-wider text-gray-900">Our Services</h3>
            <ul className="space-y-3">
              <li className="text-gray-600">Online Consultations</li>
              <li className="text-gray-600">Appointment Booking</li>
              <li className="text-gray-600">Health Records</li>
              <li className="text-gray-600">24/7 Support</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold tracking-wider text-gray-900">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <RiMapPin2Line className="text-primary text-xl mt-1" />
                <span className="text-gray-600">123 Health Street, Kampala, Uganda</span>
              </li>
              <li className="flex items-center space-x-3">
                <RiPhoneLine className="text-primary text-xl" />
                <span className="text-gray-600">+256 785550132</span>
              </li>
              <li className="flex items-center space-x-3">
                <RiMailLine className="text-primary text-xl" />
                <span className="text-gray-600">contact@kagahealth.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <RiGlobalLine className="text-primary text-xl" />
                <span className="text-gray-600">www.kagahealth.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200">
          <div className="flex justify-center items-center px-6 py-8">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Kaga Health. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
