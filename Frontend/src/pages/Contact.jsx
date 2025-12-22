import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaPaperPlane,
} from "react-icons/fa";

import Aviral from "../assets/Aviral.jpg";
import Aman from "../assets/Aman.jpeg";
import Prateek from "../assets/Prateek.jpeg";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/contact/send-message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          category: "general",
          message: "",
        });
      } else {
        alert(data.message || "Message failed");
      }
    } catch (err) {
      alert("Server error, try again later");
    } finally {
      setIsSubmitting(false);
    }
  };
const developers = [
  {
    name: "Aviral Ved Varshney",
    designation: "Lead Full Stack Developer",
    about:
      "Passionate about sustainable tech. Works with React, Node.js & MongoDB.",
    email: "aviralvarshney07@gmail.com",
    avatar: Aviral,
    social: {
      github: "https://github.com/avi-var07",
      linkedin: "https://www.linkedin.com/in/avi7/",
      instagram: "https://instagram.com/ae._jethiyaaaa",
    },
  },
  {
    name: "Aman Verma",
    designation: "Lead Frontend Developer",
    about:
      "UI/UX focused frontend dev. Expert in React & Tailwind CSS.",
    email: "amanverma130604@gmail.com",
    avatar: Aman,
    social: {
      github: "https://github.com/aman130604",
      linkedin: "https://www.linkedin.com/in/aman-verma-0a0997394/",
      instagram: "https://www.instagram.com/am.a._.n",
    },
  },
  {
    name: "Prateek Asthana",
    designation: "Lead AI/ML Developer",
    about:
      "Backend & AI systems specialist. Works on scalable APIs.",
    email: "prateekasthana0912@gmail.com",
    avatar: Prateek,
    social: {
      github: "https://github.com/Prateek-Asthana",
      linkedin: "https://www.linkedin.com/in/prateek-asthana09/",
      instagram: "https://www.instagram.com/prateek_asthana_09/",
    },
  },
];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ================= DEVELOPERS ================= */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-emerald-400 mb-12">
            Meet Our Developers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developers.map((dev, i) => (
              <DeveloperCard key={dev.email} {...dev} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT FORM ================= */}
      <section className="py-16 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-emerald-400 mb-8">
            Contact Us
          </h2>

          {submitted ? (
            <p className="text-center text-emerald-400">
              ✅ Message sent successfully!
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4"
            >
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-black border border-slate-700"
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-black border border-slate-700"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 rounded bg-black border border-slate-700"
              />

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 rounded bg-black border border-slate-700"
              >
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
              </select>

              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full p-3 rounded bg-black border border-slate-700"
              />

              <button
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-3 rounded font-semibold"
              >
                <FaPaperPlane />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
function DeveloperCard({
  name,
  designation,
  about,
  email,
  avatar,
  social,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center hover:border-emerald-500/50 transition"
    >
      {/* Avatar */}
      <motion.div
        className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-emerald-400 text-sm mb-3">{designation}</p>

      <p className="text-slate-300 text-sm mb-4">{about}</p>

      {/* Email */}
      <div className="flex justify-center items-center gap-2 text-sm mb-4">
        <FaEnvelope className="text-emerald-400" />
        <a
          href={`mailto:${email}`}
          className="hover:text-emerald-400 transition"
        >
          {email}
        </a>
      </div>

      {/* Social Links (NO TWITTER ✔️) */}
      <div className="flex justify-center gap-4 text-lg">
        {social.github && (
          <a href={social.github} target="_blank" rel="noreferrer">
            <FaGithub />
          </a>
        )}
        {social.linkedin && (
          <a href={social.linkedin} target="_blank" rel="noreferrer">
            <FaLinkedin />
          </a>
        )}
        {social.instagram && (
          <a href={social.instagram} target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
        )}
      </div>
    </motion.div>
  );
}
