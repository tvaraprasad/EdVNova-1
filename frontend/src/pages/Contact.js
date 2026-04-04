import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
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
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Contact Us</p>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-primary mb-6">
                            Get in touch
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            Have questions about our programs? Ready to enroll? We'd love to hear from you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-2">
                            <h2 className="font-heading text-2xl font-medium text-primary mb-6">Contact Information</h2>
                            <p className="text-text-secondary mb-8">
                                Reach out to us for inquiries about courses, enrollment, or any other questions. We're here to help!
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-primary">Email</p>
                                        <a href="mailto:info@edvnova.com" className="text-text-secondary hover:text-accent transition-colors" data-testid="contact-email">
                                            info@edvnova.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-primary">Phone</p>
                                        <a href="tel:+919652546434" className="text-text-secondary hover:text-accent transition-colors" data-testid="contact-phone">
                                            +91 9652546434
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-primary">Location</p>
                                        <p className="text-text-secondary">Pune, Maharashtra, India</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-background rounded-xl">
                                <p className="font-medium text-primary mb-2">Office Hours</p>
                                <p className="text-text-secondary text-sm">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                                <p className="text-text-secondary text-sm">Sunday: Closed</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="premium-card p-6 md:p-8">
                                {submitted ? (
                                    <div className="text-center py-12" data-testid="contact-success">
                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="font-heading text-2xl font-medium text-primary mb-2">Thank you!</h3>
                                        <p className="text-text-secondary mb-6">
                                            Your message has been sent successfully. We'll get back to you within 24 hours.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSubmitted(false);
                                                setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                                            }}
                                            className="text-accent hover:underline"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Your name"
                                                    required
                                                    className="mt-2"
                                                    data-testid="contact-name-input"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your@email.com"
                                                    required
                                                    className="mt-2"
                                                    data-testid="contact-email-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+91 XXXXX XXXXX"
                                                    required
                                                    className="mt-2"
                                                    data-testid="contact-phone-input"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="subject">Subject</Label>
                                                <select
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="mt-2 w-full px-3 py-2 border border-border rounded-lg bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
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
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="How can we help you?"
                                                rows={5}
                                                required
                                                className="mt-2"
                                                data-testid="contact-message-input"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
