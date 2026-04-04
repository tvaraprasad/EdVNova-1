import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'Book Free Demo Class',
        message: '',
        grade: ''
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
            // Send to backend (which can be configured to send email)
            await axios.post(`${API_URL}/api/contact`, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                subject: formData.subject,
                message: `Grade: ${formData.grade}\n\n${formData.message}`
            });
            
            setSubmitted(true);
            toast.success('Form submitted successfully!');
            
            // Redirect to WhatsApp after 2 seconds
            setTimeout(() => {
                const whatsappMessage = encodeURIComponent(
                    `Hi EdVNova! I just submitted a form on your website.\n\nName: ${formData.name}\nGrade: ${formData.grade}\nPhone: ${formData.phone}\nSubject: ${formData.subject}\n\nI would like to book a free demo class.`
                );
                window.open(`https://wa.me/919652546434?text=${whatsappMessage}`, '_blank');
            }, 2000);
            
        } catch (error) {
            toast.error('Failed to send message. Redirecting to WhatsApp...');
            // Fallback: redirect to WhatsApp directly
            const whatsappMessage = encodeURIComponent(
                `Hi EdVNova!\n\nName: ${formData.name}\nGrade: ${formData.grade}\nPhone: ${formData.phone}\nSubject: ${formData.subject}\n\nI would like to book a free demo class.`
            );
            window.open(`https://wa.me/919652546434?text=${whatsappMessage}`, '_blank');
        } finally {
            setSubmitting(false);
        }
    };

    const handleWhatsAppClick = () => {
        window.open('https://wa.me/919652546434?text=Hi%20EdVNova!%20I%20would%20like%20to%20know%20more%20about%20your%20IGCSE%20courses.', '_blank');
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="contact-page">
            {/* Hero */}
            <section className="hero-gradient py-24 md:py-32">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="badge-accent mx-auto mb-6 w-fit">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Get In Touch
                        </div>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-bold text-primary mb-8">
                            Start Your IGCSE Journey Today
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Ready to transform your science learning experience? Book a free demo class and see the difference.
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Contact Options */}
            <section className="py-8 bg-primary">
                <div className="container-custom">
                    <div className="grid sm:grid-cols-3 gap-4">
                        <a 
                            href="tel:+919652546434"
                            className="flex items-center justify-center gap-3 py-4 px-6 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                        >
                            <Phone className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">+91 9652546434</span>
                        </a>
                        <button
                            onClick={handleWhatsAppClick}
                            className="flex items-center justify-center gap-3 py-4 px-6 bg-green-500 rounded-xl hover:bg-green-600 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">WhatsApp Us</span>
                        </button>
                        <a 
                            href="mailto:info@edvnova.com"
                            className="flex items-center justify-center gap-3 py-4 px-6 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                        >
                            <Mail className="w-5 h-5 text-white" />
                            <span className="text-white font-semibold">info@edvnova.com</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="section section-light">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-5 gap-16 lg:gap-20">
                        {/* Contact Info */}
                        <div className="lg:col-span-2">
                            <h2 className="font-heading text-2xl font-bold text-primary mb-6">Contact Information</h2>
                            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                                Reach out to us for course inquiries, enrollment, or to schedule a free demo class. We typically respond within 2 hours.
                            </p>
                            
                            <div className="space-y-6">
                                <a href="tel:+919652546434" className="flex items-start gap-5 group">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                        <Phone className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary mb-1">Call Us</p>
                                        <p className="text-gray-600 group-hover:text-accent transition-colors">+91 9652546434</p>
                                        <p className="text-gray-500 text-sm">+91 94458 28326</p>
                                    </div>
                                </a>

                                <button onClick={handleWhatsAppClick} className="flex items-start gap-5 group text-left w-full">
                                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                                        <MessageCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary mb-1">WhatsApp</p>
                                        <p className="text-gray-600 group-hover:text-green-600 transition-colors">+91 9652546434</p>
                                        <p className="text-green-600 text-sm font-medium">Chat Now →</p>
                                    </div>
                                </button>

                                <a href="mailto:info@edvnova.com" className="flex items-start gap-5 group">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                                        <Mail className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary mb-1">Email</p>
                                        <p className="text-gray-600 group-hover:text-accent transition-colors" data-testid="contact-email">
                                            info@edvnova.com
                                        </p>
                                    </div>
                                </a>

                                <div className="flex items-start gap-5">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary mb-1">Locations</p>
                                        <p className="text-gray-600">Baner, Kothrud, Amanora, Hinjawadi</p>
                                        <p className="text-gray-500 text-sm">Pune, Maharashtra, India</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-accent" />
                                    <p className="font-bold text-primary">Office Hours</p>
                                </div>
                                <p className="text-gray-600">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                                <p className="text-gray-600">Sunday: By Appointment</p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="premium-card p-8 md:p-10">
                                <h3 className="font-heading text-2xl font-bold text-primary mb-2">Book Your Free Demo Class</h3>
                                <p className="text-gray-600 mb-8">Fill out the form and we'll get back to you within 2 hours.</p>

                                {submitted ? (
                                    <div className="text-center py-16" data-testid="contact-success">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h3 className="font-heading text-2xl font-bold text-primary mb-4">Thank you!</h3>
                                        <p className="text-gray-600 text-lg mb-4">
                                            Your request has been submitted. We'll contact you shortly.
                                        </p>
                                        <p className="text-accent font-semibold mb-8">
                                            Redirecting to WhatsApp for instant response...
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSubmitted(false);
                                                setFormData({ name: '', email: '', phone: '', subject: 'Book Free Demo Class', message: '', grade: '' });
                                            }}
                                            className="text-accent font-semibold hover:underline"
                                        >
                                            Submit another request
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="name" className="text-gray-700 font-medium">Student Name *</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Student's full name"
                                                    required
                                                    className="mt-2 h-12"
                                                    data-testid="contact-name-input"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="grade" className="text-gray-700 font-medium">Grade *</Label>
                                                <select
                                                    id="grade"
                                                    name="grade"
                                                    value={formData.grade}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-2 w-full h-12 px-4 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                                    data-testid="contact-grade-select"
                                                >
                                                    <option value="">Select Grade</option>
                                                    <option value="Grade 8">Grade 8</option>
                                                    <option value="Grade 9">Grade 9</option>
                                                    <option value="Grade 10">Grade 10</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number *</Label>
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
                                                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="parent@email.com"
                                                    className="mt-2 h-12"
                                                    data-testid="contact-email-input"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="subject" className="text-gray-700 font-medium">I'm interested in</Label>
                                            <select
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="mt-2 w-full h-12 px-4 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                                data-testid="contact-subject-select"
                                            >
                                                <option>Book Free Demo Class</option>
                                                <option>IGCSE Sciences Program</option>
                                                <option>IGCSE Maths Program</option>
                                                <option>General Inquiry</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="message" className="text-gray-700 font-medium">Message (Optional)</Label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Any specific questions or requirements?"
                                                rows={4}
                                                className="mt-2 resize-none"
                                                data-testid="contact-message-input"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-accent/20 text-lg"
                                            data-testid="contact-submit-button"
                                        >
                                            {submitting ? (
                                                'Submitting...'
                                            ) : (
                                                <>
                                                    Book Free Demo Class
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>

                                        <p className="text-center text-gray-500 text-sm">
                                            By submitting, you'll also be connected via WhatsApp for faster response
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-16 bg-primary">
                <div className="container-custom text-center">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
                        Prefer to talk directly?
                    </h3>
                    <p className="text-white/70 mb-8">
                        Call us or send a WhatsApp message for instant response
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="tel:+919652546434"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-all"
                        >
                            <Phone className="w-5 h-5" />
                            Call +91 9652546434
                        </a>
                        <button
                            onClick={handleWhatsAppClick}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all"
                        >
                            <MessageCircle className="w-5 h-5" />
                            WhatsApp Us
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
