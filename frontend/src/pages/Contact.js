import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await axios.post(`${API_URL}/api/contact`, formData);
            setSubmitted(true);
            toast.success('Message sent successfully!');
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="contact-page">
            {/* Hero */}
            <section className="hero-gradient py-20 md:py-28">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="badge-accent mx-auto mb-6 w-fit">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Contact Us
                        </div>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-bold text-primary mb-8">
                            Get in touch
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Have questions about our programs? Ready to enroll? We'd love to hear from you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="section section-light">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-5 gap-16">
                        {/* Contact Info */}
                        <div className="lg:col-span-2">
                            <h2 className="font-heading text-2xl font-bold text-primary mb-6">Contact Information</h2>
                            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                                Reach out to us for inquiries about courses, enrollment, or any other questions. We're here to help!
                            </p>
                            
                            <div className="space-y-6">
                                <a href="mailto:info@edvnova.com" className="flex items-start gap-5 group">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                        <Mail className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary mb-1">Email</p>
                                        <p className="text-gray-600 group-hover:text-accent transition-colors" data-testid="contact-email">
                                            info@edvnova.com
                                        </p>
                                    </div>
                                </a>

                                <a href="tel:+919652546434" className="flex items-start gap-5 group">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                        <Phone className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary mb-1">Phone</p>
                                        <p className="text-gray-600 group-hover:text-accent transition-colors" data-testid="contact-phone">
                                            +91 9652546434
                                        </p>
                                    </div>
                                </a>

                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary mb-1">Location</p>
                                        <p className="text-gray-600">Pune, Maharashtra, India</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-accent" />
                                    <p className="font-semibold text-primary">Office Hours</p>
                                </div>
                                <p className="text-gray-600">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                                <p className="text-gray-600">Sunday: Closed</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="premium-card p-8 md:p-10">
                                {submitted ? (
                                    <div className="text-center py-16" data-testid="contact-success">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h3 className="font-heading text-2xl font-bold text-primary mb-4">Thank you!</h3>
                                        <p className="text-gray-600 text-lg mb-8">
                                            Your message has been sent successfully. We'll get back to you within 24 hours.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSubmitted(false);
                                                setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                                            }}
                                            className="text-accent font-semibold hover:underline"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8" data-testid="contact-form">
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Your name"
                                                    required
                                                    className="mt-2 h-12"
                                                    data-testid="contact-name-input"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your@email.com"
                                                    required
                                                    className="mt-2 h-12"
                                                    data-testid="contact-email-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+91 XXXXX XXXXX"
                                                    required
                                                    className="mt-2 h-12"
                                                    data-testid="contact-phone-input"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="subject" className="text-gray-700 font-medium">Subject</Label>
                                                <select
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="mt-2 w-full h-12 px-4 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                                    data-testid="contact-subject-select"
                                                >
                                                    <option>General Inquiry</option>
                                                    <option>Course Enrollment</option>
                                                    <option>Workshop Registration</option>
                                                    <option>Schedule a Consultation</option>
                                                    <option>Feedback</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="message" className="text-gray-700 font-medium">Message</Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="How can we help you?"
                                                rows={6}
                                                required
                                                className="mt-2 resize-none"
                                                data-testid="contact-message-input"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-accent/20"
                                            data-testid="contact-submit-button"
                                        >
                                            {submitting ? (
                                                'Sending...'
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
