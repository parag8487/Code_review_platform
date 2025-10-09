"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import CardSwap, { Card } from "@/components/CardSwap";
import SpotlightCard from "@/components/SpotlightCard";



const ContactPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string } | null>(null);

  const features = [
    {
      title: 'Quick Response',
      description: 'We aim to respond to all inquiries within 24 hours. Your feedback is important to us.',
      icon: "bolt",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrhlavDcdNeHo4JZrlsdRfYr85jnRGtKR21Mi0OHsk20Zmp-PcByuocVpgm96x28Jm-hXYbWL-Z2-GiuTqMCUql9f19ER8Tx8wcC_pvQqiTH0P_1Lj-A_B1R4rGgO_FU2umnHNwmkit29WClgOgdbYnMHoIOzorKEgwStb1pi3qrh5YEjmlzWg2R_hu9xkV73vSXujg0_MquiUPUQyK81Qpq7QfUmM4Hnu7moVGik4kAXep_evuhWRiTxZW7y7DAbNfUvu-wkKUyA"
    },
    {
      title: 'Multiple Channels',
      description: 'Reach out through email, or use our contact form for the fastest response.',
      icon: "alternate_email",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDR0mkq3YJDKpGKaAlpzAylNQxNugkmKpNpSiizMnkA3WOGNW-Xy_oomp0_J8V-AsZAG5UgKe78dL3olPbLt-2V3AvssAtwpmsWhipRQS3ivt3Adik0jcMKyiSL_SUj9nzsKGvp46aa92E-4qp2cpg2lOCsI8lHh9RWkousQZruFMJv-ARPFItvqaOmaf65XSaPJKYSMIYsD6tBzfxtrNhtTUo0U8HafYRYJb4YRLjfvEebPZpsfi1SIuOQDtUtw6U9MSnVl5GqzxM"
    },
    {
      title: 'Dedicated Support',
      description: 'Our team is committed to providing you with the best possible assistance.',
      icon: "support_agent",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4Kxd4TYw5HEp9bReEorQRqERvdqe3B6PHPZ87aNewaI5nL2GyjR-hBIeTpUSKZ2QAm8QJ4joWYLqcp1mMbr8Pvl9KjEpUifuLcjuB_MkGGOxvHo7bRIIFpRms-s9LNjMxHZp3DE0MfH2Qbe4L-g77ZJCwKoY6FAKCtLYgPqfVyGP0GVa9_mwcKOO9WRQBAA0FcR2FgLI9HiQrkir_WDXOffbCfWU0h8hrZ-ZVu6oRl5L-cen7F4moG0NDn80uCjcDoB2-FHbp_A4"
    },
  ];



  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Send the form data to our API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! We will get back to you soon.'
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'There was an error sending your message. Please try again.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'There was an error sending your message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply theme class to body
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`${isDarkMode ? 'dark bg-background-dark' : 'bg-[#F3E8FF]'} text-gray-100 min-h-screen flex flex-col font-display`}>
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
        {/* Back Button Below Nav Bar */}
        <div className="mb-0">
          <Link href="/welcome">
            <Button className={`font-semibold py-2 px-4 rounded-lg shadow-md transition-colors ${isDarkMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-[#A98DFA] text-white hover:bg-[#A98DFA]/90'}`}>
              ⬅ Back
            </Button>
          </Link>
        </div>
        
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Get in Touch
          </h2>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Have questions or feedback? We'd love to hear from you. Reach out to us through the contact form or email us directly.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <SpotlightCard isDarkMode={isDarkMode} className={`rounded-xl p-8 shadow-lg ${isDarkMode ? 'bg-[#070010] border border-[#170d26]' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Send us a Message
            </h3>
            
            {submitStatus && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {submitStatus.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                    isDarkMode 
                      ? 'bg-[#0f001f] border-[#2d1a4f] text-white focus:ring-primary focus:border-primary' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-[#A98DFA] focus:border-[#A98DFA]'
                  }`}
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                    isDarkMode 
                      ? 'bg-[#0f001f] border-[#2d1a4f] text-white focus:ring-primary focus:border-primary' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-[#A98DFA] focus:border-[#A98DFA]'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                    isDarkMode 
                      ? 'bg-[#0f001f] border-[#2d1a4f] text-white focus:ring-primary focus:border-primary' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-[#A98DFA] focus:border-[#A98DFA]'
                  }`}
                  placeholder="What's this regarding?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                    isDarkMode 
                      ? 'bg-[#0f001f] border-[#2d1a4f] text-white focus:ring-primary focus:border-primary' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-[#A98DFA] focus:border-[#A98DFA]'
                  }`}
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  isDarkMode 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-[#A98DFA] text-white hover:bg-[#A98DFA]/90'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="material-icons animate-spin mr-2">autorenew</span>
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </SpotlightCard>

          {/* Features Section - Moved from below */}
          <div>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <SpotlightCard 
                  key={index} 
                  isDarkMode={isDarkMode}
                  className={`rounded-lg shadow-lg overflow-hidden group transition-all hover:shadow-xl ${isDarkMode ? 'bg-[#070010] border border-[#170d26]' : 'bg-white border border-gray-200'}`}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <span className={`material-icons text-2xl mr-3 ${isDarkMode ? 'text-primary' : 'text-[#A98DFA]'}`}>
                        {feature.icon}
                      </span>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
                      {feature.description}
                    </p>
                  </div>
                </SpotlightCard>
              ))}
            </section>
          </div>
        </div>
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

export default ContactPage;