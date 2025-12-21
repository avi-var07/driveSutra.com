import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaPaperPlane, FaQuestionCircle, FaBug, FaLightbulb } from 'react-icons/fa';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/contact/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: ''
        });
      } else {
        alert('Failed to send message: ' + data.message);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      alert('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Have questions, suggestions, or just want to say hello? 
              We'd love to hear from you and help make your eco-journey even better.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800"
            >
              <h2 className="text-2xl font-bold mb-6 text-emerald-400">Send us a Message</h2>
              
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPaperPlane className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-400">Message Sent!</h3>
                  <p className="text-slate-400">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="partnership">Partnership</option>
                      <option value="press">Press & Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="Brief description of your message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Contact Details */}
              <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                <h2 className="text-2xl font-bold mb-6 text-emerald-400">Contact Information</h2>
                <div className="space-y-6">
                  <ContactItem
                    icon={FaEnvelope}
                    title="Email"
                    content="support@drivesutrago.com"
                    subtitle="We typically respond within 24 hours"
                  />
                  <ContactItem
                    icon={FaPhone}
                    title="Phone"
                    content="8687883676"
                    subtitle="Monday - Friday, 9 AM - 6 PM"
                  />
                  <ContactItem
                    icon={FaMapMarkerAlt}
                    title="Address"
                    content="Lovely Professional University, Jalandhar, Punjab"
                    subtitle="India"
                  />
                </div>
              </div>

              {/* Quick Help */}
              <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                <h3 className="text-xl font-bold mb-6 text-emerald-400">Quick Help</h3>
                <div className="space-y-4">
                  <QuickHelpItem
                    icon={FaQuestionCircle}
                    title="FAQ"
                    description="Find answers to common questions"
                  />
                  <QuickHelpItem
                    icon={FaBug}
                    title="Report a Bug"
                    description="Help us improve by reporting issues"
                  />
                  <QuickHelpItem
                    icon={FaLightbulb}
                    title="Feature Request"
                    description="Suggest new features or improvements"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                <h3 className="text-xl font-bold mb-6 text-emerald-400">Follow Us</h3>
                <p className="text-slate-400 mb-6">
                  Stay updated with the latest news, features, and eco-tips from our community.
                </p>
                <div className="flex items-center gap-4">
                  <SocialButton href="https://twitter.com" icon={FaTwitter} />
                  <SocialButton href="https://facebook.com" icon={FaFacebook} />
                  <SocialButton href="https://linkedin.com" icon={FaLinkedin} />
                  <SocialButton href="https://github.com" icon={FaGithub} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-emerald-400">Meet Our Developers</h2>
            <p className="text-slate-300 text-lg">The passionate team behind driveSutra</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Developer 1 */}
            <DeveloperCard
              name="Aviral Ved Varshney"
              designation="Lead Full Stack Developer"
              about="Passionate about creating sustainable technology solutions and environmental conservation. Specializes in React, Node.js, and MongoDB."
              email="aviralvarshney07@gmail.com"
              social={{
                github: "https://github.com/avi-var07",
                linkedin: "https://www.linkedin.com/in/avi7/",
                twitter: "https://twitter.com/developer1"
              }}
              avatar=""
              delay={0.1}
            />

            {/* Developer 2 */}
            <DeveloperCard
              name="Aman Verma"
              designation="Lead Frontend Developer"
              about="UI/UX enthusiast with a focus on creating beautiful and intuitive user experiences. Expert in React, Tailwind CSS, and modern web technologies."
              email="developer2@drivesutra.com"
              social={{
                github: "https://github.com/developer2",
                linkedin: "https://linkedin.com/in/developer2",
                twitter: "https://twitter.com/developer2"
              }}
              avatar="👩‍💻"
              delay={0.2}
            />

            {/* Developer 3 */}
            <DeveloperCard
              name="Prateek Randi"
              designation="Lead AI/ML Developer"
              about="Backend architecture specialist focused on scalable and efficient systems. Experienced in Node.js, Express, database optimization, and API design."
              email="developer3@drivesutra.com"
              social={{
                github: "https://github.com/developer3",
                linkedin: "https://linkedin.com/in/developer3",
                twitter: "https://twitter.com/developer3"
              }}
              avatar="🧑‍💻"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-emerald-400">Frequently Asked Questions</h2>
            <p className="text-slate-300 text-lg">Quick answers to help you get started</p>
          </motion.div>

          <div className="space-y-6">
            <FAQItem
              question="How does the ecoScore calculation work?"
              answer="Our ecoScore is calculated based on 5 factors: transport mode (30%), trip efficiency (30%), driving behavior (20%), weather conditions (10%), and verification accuracy (10%). Each component is weighted to encourage sustainable choices."
            />
            <FAQItem
              question="Is driveSutra free to use?"
              answer="Yes! driveSutra is completely free to use. We believe sustainable transportation should be accessible to everyone. All core features including trip tracking, ecoScore calculation, and achievements are available at no cost."
            />
            <FAQItem
              question="How accurate is the CO₂ savings calculation?"
              answer="Our CO₂ calculations are based on industry-standard emission factors and real-world data. We use average emission rates for different transport modes and continuously update our algorithms to ensure accuracy."
            />
            <FAQItem
              question="Can I use driveSutra without GPS?"
              answer="While GPS enhances the experience, you can manually enter trip details. However, some verification features and real-time tracking require location services for the most accurate ecoScore calculation."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* Contact Item Component */
function ContactItem({ icon: Icon, title, content, subtitle }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-slate-300 mb-1">{content}</p>
        <p className="text-slate-400 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

/* Quick Help Item Component */
function QuickHelpItem({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
      <Icon className="text-emerald-400 text-lg" />
      <div>
        <h5 className="font-medium text-white">{title}</h5>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
}

/* Social Button Component */
function SocialButton({ href, icon: Icon }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon />
    </motion.a>
  );
}

/* Developer Card Component */
function DeveloperCard({ name, designation, about, email, social, avatar, delay = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles */}
      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 20}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-10, -20, -30]
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          ))}
        </>
      )}

      <div className="relative z-10">
        {/* Avatar */}
        <div className="text-center mb-6">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            {avatar}
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
          <p className="text-emerald-400 font-medium">{designation}</p>
        </div>

        {/* About */}
        <div className="mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">{about}</p>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaEnvelope className="text-emerald-400 text-sm" />
            <a 
              href={`mailto:${email}`}
              className="text-slate-300 text-sm hover:text-emerald-400 transition-colors"
            >
              {email}
            </a>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-3">
          {social.github && (
            <motion.a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-gray-700 hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGithub className="text-sm" />
            </motion.a>
          )}
          {social.linkedin && (
            <motion.a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaLinkedin className="text-sm" />
            </motion.a>
          )}
          {social.twitter && (
            <motion.a
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-400 hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTwitter className="text-sm" />
            </motion.a>
          )}
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: '-100%', skewX: -45 }}
          animate={{ x: isHovered ? '200%' : '-100%' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>

      {/* Corner accent */}
      <motion.div
        className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-bl-full"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ 
          scale: isHovered ? 1 : 0,
          rotate: isHovered ? 0 : -45
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

/* FAQ Item Component */
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-slate-800/50 rounded-xl border border-slate-700"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800/70 transition-colors rounded-xl"
      >
        <h4 className="font-semibold text-white pr-4">{question}</h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-4">
          <p className="text-slate-300 leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}