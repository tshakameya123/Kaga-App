import React, { useState, useEffect, useMemo } from 'react';

import backgroundImage1 from '../assets/slider1.png';
import backgroundImage2 from '../assets/slider2.png';
import backgroundImage3 from '../assets/slider3.png';
import backgroundImage4 from '../assets/slider4.png';
import backgroundImage5 from '../assets/slider5.png';

const Header = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = useMemo(() => ([
        {
            image: backgroundImage1,
            title: 'Your health, our priority',
            subtitle: 'Seamlessly connect with specialists, book appointments, and manage follow-ups from a single dashboard.'
        },
        {
            image: backgroundImage2,
            title: 'Find trusted experts',
            subtitle: 'Browse vetted doctors, read reviews, and choose the right specialist for your needs.'
        },
        {
            image: backgroundImage3,
            title: 'Care that fits your schedule',
            subtitle: 'Flexible appointment slots, instant confirmations, and gentle reminders keep you on track.'
        },
        {
            image: backgroundImage4,
            title: 'Modern clinics, modern experience',
            subtitle: 'Enjoy premium care with up-to-date medical technology and compassionate teams.'
        },
        {
            image: backgroundImage5,
            title: 'Book in minutes, from anywhere',
            subtitle: 'Our responsive platform works beautifully on any device to keep care within reach.'
        }
    ]), []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000);

        return () => clearInterval(interval);
    }, [slides.length]);

    const activeSlide = slides[currentIndex];

    return (
        <section className="px-4 sm:px-6 lg:px-10 mt-6">
            <div
                className="relative min-h-[70vh] rounded-3xl overflow-hidden shadow-2xl text-white flex items-center"
                style={{
                    backgroundImage: `url(${activeSlide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'background-image 1s ease-in-out'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40" />
                <div className="relative z-10 max-w-3xl px-6 sm:px-10 py-12 sm:py-16">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Premium care
                    </p>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                        {activeSlide.title}
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed">
                        {activeSlide.subtitle}
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                        <a
                            href="#speciality"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-blue-600 font-semibold text-sm shadow-lg hover:-translate-y-0.5 transition"
                        >
                            Book appointment
                        </a>
                        <div className="flex items-center gap-6 text-sm text-white/80">
                            <div>
                                <p className="text-2xl font-bold text-white">120+</p>
                                <p className="uppercase text-[11px] tracking-[0.3em]">specialists</p>
                            </div>
                            <div className="h-10 w-px bg-white/30" />
                            <div>
                                <p className="text-2xl font-bold text-white">15k</p>
                                <p className="uppercase text-[11px] tracking-[0.3em]">patients served</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center gap-2">
                        {slides.map((_, idx) => (
                            <span
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentIndex ? 'w-10 bg-white' : 'w-4 bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Header;
