import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import { 
  RiMapPin2Line, 
  RiPhoneLine, 
  RiMailLine, 
  RiGlobalLine, 
  RiTimeLine,
  RiCustomerService2Line,
  RiMessage3Line,
  RiSendPlaneLine,
  RiCheckLine,
  RiErrorWarningLine
} from 'react-icons/ri';
import { toast } from 'react-toastify';
import { sanitizeInput, isValidEmail, validatePhone, createRateLimiter } from '../utils/security';

// Rate limiter for contact form (3 submissions per 15 minutes)
const contactRateLimiter = createRateLimiter(3, 15 * 60 * 1000);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: RiMapPin2Line,
      title: "Visit Us",
      details: ["123 Health Street", "Kampala, Uganda"],
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: RiPhoneLine,
      title: "Call Us",
      details: ["+256 785550132", "+256 700123456"],
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: RiMailLine,
      title: "Email Us",
      details: ["contact@kagahealth.com", "support@kagahealth.com"],
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: RiTimeLine,
      title: "Working Hours",
      details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 4:00 PM"],
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Name must be less than 50 characters";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    // Validate phone if provided
    if (formData.phone.trim()) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.message;
      }
    }
    
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    } else if (formData.subject.trim().length > 100) {
      errors.subject = "Subject must be less than 100 characters";
    }
    
    if (!formData.message.trim()) {
      errors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 2000) {
      errors.message = "Message must be less than 2000 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const sendMessage = async () => {
    // Check rate limit
    if (!contactRateLimiter.checkLimit()) {
      const remaining = contactRateLimiter.getRemainingTime();
      const minutes = Math.ceil(remaining / 60000);
      toast.error(`Too many messages. Please try again in ${minutes} minute(s).`);
      return;
    }

    try {
      setIsLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
      
      // Sanitize all form data before sending
      const sanitizedData = {
        name: sanitizeInput(formData.name.trim()),
        email: sanitizeInput(formData.email.trim().toLowerCase()),
        phone: sanitizeInput(formData.phone.trim()),
        subject: sanitizeInput(formData.subject.trim()),
        message: sanitizeInput(formData.message.trim()),
      };

      await axios.post(
        `${backendUrl}/api/messages`, 
        sanitizedData,
        { timeout: 15000 }
      );
      
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSubmitted(true);
    } catch (error) {
      console.error("[Contact] Send message error:", error);
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many messages. Please try again later.");
      } else {
        toast.error(error.response?.data?.message || "Failed to send message. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Contact <span className="text-red-200">Kaga Health</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-red-100 max-w-4xl mx-auto leading-relaxed px-2">
            We're here to help you with any questions or concerns. Get in touch with our team 
            and we'll respond as quickly as possible.
          </p>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Get in Touch
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              Multiple ways to reach us. Choose what works best for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center group">
                <div className={`${info.bgColor} rounded-2xl p-6 sm:p-8 group-hover:shadow-xl transition-all duration-300 h-full`}>
                  <info.icon className={`text-4xl sm:text-5xl ${info.color} mx-auto mb-4 sm:mb-6`} />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-sm sm:text-base text-gray-700">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Send us a Message
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Have a question or need assistance? Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <RiMessage3Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300 focus:border-primary'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <RiErrorWarningLine className="mr-1" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-primary'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <RiErrorWarningLine className="mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <RiPhoneLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <div className="relative">
                    <RiMessage3Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 ${
                        formErrors.subject ? 'border-red-500' : 'border-gray-300 focus:border-primary'
                      }`}
                      placeholder="What's this about?"
                    />
                  </div>
                  {formErrors.subject && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <RiErrorWarningLine className="mr-1" />
                      {formErrors.subject}
                    </p>
                  )}
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <RiMessage3Line className="absolute left-3 top-4 text-gray-400 text-lg" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 resize-none ${
                      formErrors.message ? 'border-red-500' : 'border-gray-300 focus:border-primary'
                    }`}
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                {formErrors.message && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <RiErrorWarningLine className="mr-1" />
                    {formErrors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isLoading || isSubmitted}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                    isLoading || isSubmitted
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <RiCheckLine className="text-xl" />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      <RiSendPlaneLine className="text-xl" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Quick answers to common questions about our services and support.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How quickly do you respond to messages?",
                answer: "We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly."
              },
              {
                question: "Can I book an appointment through this contact form?",
                answer: "While you can mention your interest in booking an appointment, we recommend using our online booking system for faster scheduling."
              },
              {
                question: "What information should I include in my message?",
                answer: "Please include your name, contact information, and a detailed description of your question or concern. The more specific you are, the better we can assist you."
              },
              {
                question: "Is my personal information secure?",
                answer: "Yes, we take your privacy seriously. All information submitted through this form is encrypted and stored securely according to healthcare privacy standards."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
