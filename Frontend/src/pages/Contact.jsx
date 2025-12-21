import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram, FaFacebook,
  FaLinkedin, FaGithub, FaPaperPlane, FaQuestionCircle,
  FaBug, FaLightbulb
} from 'react-icons/fa';

import Aviral from "../assets/Aviral.jpg";
import Aman from "../assets/Aman.jpeg";
import Prateek from "../assets/Prateek.jpeg";

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
        headers: { 'Content-Type': 'application/json' },
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
      {/* ================= DEVELOPERS SECTION ================= */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-emerald-400">
              Meet Our Developers
            </h2>
            <p className="text-slate-300 text-lg">
              The passionate team behind driveSutra
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Aviral Ved Varshney",
                designation: "Lead Full Stack Developer",
                about:
                  "Passionate about creating sustainable technology solutions and environmental conservation. Specializes in React, Node.js, and MongoDB.",
                email: "aviralvarshney07@gmail.com",
                avatar: Aviral,
                social: {
                  github: "https://github.com/avi-var07",
                  linkedin: "https://www.linkedin.com/in/avi7/",
                  instagram: "https://instagram.com/ae._jethiyaaaa"
                }
              },
              {
                name: "Aman Verma",
                designation: "Lead Frontend Developer",
                about:
                  "UI/UX enthusiast with a focus on creating beautiful and intuitive user experiences. Expert in React, Tailwind CSS, and modern web technologies.",
                email: "amanverma130604@gmail.com",
                avatar: Aman,
                social: {
                  github: "https://github.com/aman130604",
                  linkedin: "https://www.linkedin.com/in/aman-verma-0a0997394/",
                  instagram: "https://www.instagram.com/am.a._.n"
                }
              },
              {
                name: "Prateek Asthana",
                designation: "Lead AI/ML Developer",
                about:
                  "Backend architecture specialist focused on scalable and efficient systems. Experienced in Node.js, Express, database optimization, and API design.",
                email: "prateekasthana0912@gmail.com",
                avatar: Prateek,
                social: {
                  github: "https://github.com/Prateek-Asthana",
                  linkedin: "https://www.linkedin.com/in/prateek-asthana09/",
                  instagram: "https://www.instagram.com/prateek_asthana_09/"
                }
              }
            ].map((dev, index) => (
              <DeveloperCard
                key={dev.email}
                {...dev}
                delay={(index + 1) * 0.1}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ================= Developer Card ================= */
function DeveloperCard({ name, designation, about, email, social, avatar, delay = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10 text-center mb-6">
        {/* ✅ FIXED AVATAR (ONLY CHANGE) */}
        <motion.div
          className="w-20 h-20 rounded-full mx-auto mb-4 shadow-lg overflow-hidden"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        <p className="text-emerald-400 font-medium">{designation}</p>
      </div>

      <p className="text-slate-300 text-sm mb-6 leading-relaxed">{about}</p>

      <div className="flex items-center gap-2 mb-6 justify-center">
        <FaEnvelope className="text-emerald-400 text-sm" />
        <a
          href={`mailto:${email}`}
          className="text-slate-300 text-sm hover:text-emerald-400 transition-colors"
        >
          {email}
        </a>
      </div>

      <div className="flex items-center justify-center gap-3">
        {social.github && (
          <a href={social.github} target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
        )}
        {social.linkedin && (
          <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>
        )}
        {social.instagram && (
          <a href={social.instagram} target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
        )}
      </div>
    </motion.div>
  );
}
