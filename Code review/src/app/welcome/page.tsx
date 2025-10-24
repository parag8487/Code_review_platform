"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import LogoLoop from "@/components/logo-loop";
import CardSwap, { Card } from "@/components/CardSwap";
import SpotlightCard from "@/components/SpotlightCard";
import LightRays from "@/components/LightRays";

// Import SVG components
import GoogleLogo from "@/components/svgs/GoogleLogo";
import GitHubLogo from "@/components/svgs/GitHubLogo";
import GoogleCloudLogo from "@/components/svgs/GoogleCloudLogo";
import GoogleColabLogo from "@/components/svgs/GoogleColabLogo";
import GoogleDriveLogo from "@/components/svgs/GoogleDriveLogo";
import GoogleGeminiLogo from "@/components/svgs/GoogleGeminiLogo";

const WelcomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const features = [
    {
      title: 'AI-Powered Analysis',
      description: 'Leverage cutting-edge artificial intelligence to gain deep insights from your data. Our platform simplifies complex analysis, providing actionable good intelligence.',
      icon: "auto_awesome",
      image: "/ai_analysis.png"
    },
    {
      title: 'Real-Time Collaboration',
      description: 'Work together seamlessly with your team. Our platform supports concurrent editing, instant messaging, and shared workspaces to boost productivity and innovation.',
      icon: "people",
      image: "/real_time_collaboration.png"
    },
    {
      title: 'Collaborative Classrooms',
      description: 'Transform education with interactive and engaging virtual classrooms. Foster a dynamic learning environment with tools designed for modern pedagogy.',
      icon: "school",
      image: "/collaborative_classrooms.png"
    },
  ];

  // SVG logos data
  const logos = [
    { node: <GoogleLogo className={`h-10 w-auto ${isDarkMode ? 'text-white' : 'text-black'}`} />, ariaLabel: "Google" },
    { node: <GitHubLogo className={`h-10 w-auto ${isDarkMode ? 'text-white' : 'text-black'}`} />, ariaLabel: "GitHub" },
    { node: <GoogleCloudLogo className={`h-10 w-auto ${isDarkMode ? 'text-white' : 'text-black'}`} />, ariaLabel: "Google Cloud" },
    { node: <GoogleColabLogo className={`h-10 w-auto ${isDarkMode ? 'text-white' : 'text-black'}`} />, ariaLabel: "Google Colab" },
    { node: <GoogleDriveLogo className={`h-10 w-auto ${isDarkMode ? 'text-white' : 'text-black'}`} />, ariaLabel: "Google Drive" },
    { node: <GoogleGeminiLogo className={`h-10 w-auto ${isDarkMode ? 'text-white' : 'text-black'}`} />, ariaLabel: "Google Gemini" },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Auto-advance slides (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Apply theme class to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`${isDarkMode ? 'dark bg-background-dark' : 'bg-[#F3E8FF]'} text-gray-100 min-h-screen flex flex-col font-display`}>
      {/* LightRays Background */}
      <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 20, pointerEvents: 'none' }}>
        <LightRays
          raysOrigin="top-center"
          raysColor={isDarkMode ? "#ffffff" : "#FFEDFF"}
          raysSpeed={isDarkMode ? 1 : 1}
          lightSpread={isDarkMode ? 0.6 : 0}
          rayLength={isDarkMode ? 0.7 : 0}
          followMouse={true}
          mouseInfluence={isDarkMode ? 0.3 : 0.3}
          noiseAmount={0.1}
          distortion={0.05}
          saturation={1.2}
          fadeDistance={0.8}
          className="custom-rays"
        />
      </div>

      {/* Header */}
      <header className={`py-4 px-6 md:px-12 ${isDarkMode ? 'bg-background-dark/80 backdrop-blur-sm shadow-md border-b border-dark-border' : 'bg-white backdrop-blur-sm shadow-md border-b border-gray-200'} fixed top-0 left-0 right-0 z-10`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src={isDarkMode ? '/logo_in_dark_mode.png' : '/logo_in_light_mode.png'} 
              alt="Company Logo" 
              className="h-8 w-auto" 
            />
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#A98DFA]'}`}>CodeReview</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`flex items-center space-x-2 text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-primary' : 'text-gray-700 hover:text-primary'}`}
            >
              {isDarkMode ? (
                <>
                  <span>Light Mode</span>
                  <span className="material-icons">light_mode</span>
                </>
              ) : (
                <>
                  <span>Dark Mode</span>
                  <span className="material-icons">dark_mode</span>
                </>
              )}
            </button>
            <LogoutButton isDarkMode={isDarkMode} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 pt-28 pb-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to the Future of Collaboration
          </h2>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You've successfully logged in. Explore the powerful features our
            platform offers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/code-review" 
              className={`font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors ${isDarkMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-[#A98DFA] text-white hover:bg-[#A98DFA]/90'}`}
            >
              Start Code Review
            </Link>
            <button 
              onClick={() => window.open('http://localhost:5000', '_blank')}
              className={`font-semibold py-3 px-6 rounded-lg shadow-md transition-colors border ${isDarkMode ? 'bg-card-dark text-white border-dark-border hover:bg-card-dark/80' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
            >
              Live Classroom
            </button>
          </div>
        </section>

        {/* CardSwap Section */}
        <section className="relative mb-16">
          <SpotlightCard isDarkMode={isDarkMode} className={`rounded-xl p-6 mb-12 shadow-lg ${isDarkMode ? 'bg-[#070010] border border-[#170d26]' : 'bg-white border border-gray-200'}`}>
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <div className="lg:w-2/5 text-left pl-4 ml-10">
                <h3 className={`text-2xl lg:text-4xl font-bold mb-3 leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Card stacks have never looked so good
                </h3>
                <p className={isDarkMode ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>
                  Just look at it go!
                </p>
              </div>
              <div className="lg:w-3/5 pr-4 flex items-center justify-center">
                <div style={{ height: '370px', position: 'relative', overflow: 'hidden', width: '100%' }}>
                  <CardSwap
                    cardDistance={40}
                    verticalDistance={50}
                    delay={5000}
                    pauseOnHover={false}
                  >
                    <Card>
                      <div className="w-full h-full flex flex-col justify-center p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Code Review</h3>
                            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Automated analysis</p>
                          </div>
                          <div className={isDarkMode ? 'bg-gray-700 rounded-lg p-2' : 'bg-gray-200 rounded-lg p-2'}>
                            <span className={`material-icons ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>code</span>
                          </div>
                        </div>
                        <p className={isDarkMode ? 'text-gray-300 text-sm mb-4' : 'text-gray-700 text-sm mb-4'}>
                          AI-powered code review tools that identify bugs, security vulnerabilities, 
                          and performance issues before they reach production.
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className={isDarkMode ? 'text-xs text-gray-500' : 'text-xs text-gray-400'}>AI Enhanced</span>
                          <button className={isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded transition-colors' : 'bg-gray-200 hover:bg-gray-300 text-gray-900 text-xs py-1 px-3 rounded transition-colors'}>
                            Explore
                          </button>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div className="w-full h-full flex flex-col justify-center p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Team Collaboration</h3>
                            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Real-time workspace</p>
                          </div>
                          <div className={isDarkMode ? 'bg-gray-700 rounded-lg p-2' : 'bg-gray-200 rounded-lg p-2'}>
                            <span className={`material-icons ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>group</span>
                          </div>
                        </div>
                        <p className={isDarkMode ? 'text-gray-300 text-sm mb-4' : 'text-gray-700 text-sm mb-4'}>
                          Collaborate seamlessly with your team through shared workspaces, 
                          real-time editing, and instant messaging features.
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className={isDarkMode ? 'text-xs text-gray-500' : 'text-xs text-gray-400'}>Live Sync</span>
                          <button className={isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded transition-colors' : 'bg-gray-200 hover:bg-gray-300 text-gray-900 text-xs py-1 px-3 rounded transition-colors'}>
                            Join Now
                          </button>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div className="w-full h-full flex flex-col justify-center p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Data Insights</h3>
                            <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Advanced analytics</p>
                          </div>
                          <div className={isDarkMode ? 'bg-gray-700 rounded-lg p-2' : 'bg-gray-200 rounded-lg p-2'}>
                            <span className={`material-icons ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>insights</span>
                          </div>
                        </div>
                        <p className={isDarkMode ? 'text-gray-300 text-sm mb-4' : 'text-gray-700 text-sm mb-4'}>
                          Transform your data into actionable insights with our powerful analytics engine 
                          and customizable dashboard components.
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className={isDarkMode ? 'text-xs text-gray-500' : 'text-xs text-gray-400'}>Real-time</span>
                          <button className={isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-3 rounded transition-colors' : 'bg-gray-200 hover:bg-gray-300 text-gray-900 text-xs py-1 px-3 rounded transition-colors'}>
                            Analyze
                          </button>
                        </div>
                      </div>
                    </Card>
                  </CardSwap>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </section>

        {/* Logo Loop Section */}
        <section className="mb-16">
          <LogoLoop 
            logos={logos} 
            speed={80}
            logoHeight={40}
            gap={120}
            fadeOut={true}
            pauseOnHover={true}
          />
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <SpotlightCard 
              key={index} 
              isDarkMode={isDarkMode}
              className={`rounded-lg shadow-lg overflow-hidden group transition-all hover:shadow-xl ${isDarkMode ? 'bg-[#070010] border border-[#170d26]' : 'bg-white border border-gray-200'}`}
            >
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <span className={`material-icons text-3xl mr-3 ${isDarkMode ? 'text-primary' : 'text-[#A98DFA]'}`}>
                    {feature.icon}
                  </span>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className={isDarkMode ? 'text-gray-400 mb-6' : 'text-gray-600 mb-6'}>
                  {feature.description}
                </p>
              </div>
              <img 
                alt={`A beautiful image representing ${feature.title}`} 
                className="w-full h-48 object-cover" 
                src={feature.image} 
              />
            </SpotlightCard>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className={`py-6 px-6 md:px-12 mt-auto ${isDarkMode ? 'border-t border-dark-border' : 'border-t border-gray-200'}`}>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6">
              <Link href="#" className={isDarkMode ? 'text-gray-400 hover:text-white transition-colors' : 'text-gray-600 hover:text-gray-900 transition-colors'}>Terms</Link>
              <Link href="#" className={isDarkMode ? 'text-gray-400 hover:text-white transition-colors' : 'text-gray-600 hover:text-gray-900 transition-colors'}>Privacy</Link>
              <Link href="/contact" className={isDarkMode ? 'text-gray-400 hover:text-white transition-colors' : 'text-gray-600 hover:text-gray-900 transition-colors'}>Contact</Link>
            </div>
            <p className={isDarkMode ? 'text-gray-500 text-sm mt-4 md:mt-0' : 'text-gray-500 text-sm mt-4 md:mt-0'}>
              © 2025 Code Review. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;