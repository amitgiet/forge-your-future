
import React, { useState } from 'react';
import NeetNavbar from '../components/neetforge/NeetNavbar';
import NeetFooter from '../components/neetforge/NeetFooter';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Contact() {
    const { toast } = useToast();
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast({ title: 'Request Submitted', description: 'We will get back to you soon!' });
        setForm({ name: '', phone: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-background">
            <NeetNavbar />

            <section className="pt-28 pb-16 md:pt-32 md:pb-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground mb-3">Request A Callback</h1>
                        <p className="text-muted-foreground text-lg">Get in touch with us for admissions and queries</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-2xl p-8">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="+91 XXXXX XXXXX"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us about your requirements..."
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="mt-1.5 h-32"
                                />
                            </div>
                            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 font-semibold gap-2">
                                <Send className="w-4 h-4" /> Submit Request
                            </Button>
                        </form>

                        {/* Contact info */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xl font-poppins font-bold text-foreground mb-6">Contact Information</h3>
                                <div className="space-y-5">
                                    <a href="tel:+919207998855" className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">For Admission</p>
                                            <p className="text-muted-foreground">+91 92 07 99 88 55</p>
                                        </div>
                                    </a>
                                    <a href="mailto:hello@eduport.app" className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">Email Us</p>
                                            <p className="text-muted-foreground">hello@eduport.app</p>
                                        </div>
                                    </a>
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">Head Office</p>
                                            <p className="text-muted-foreground">Malappuram, Kerala, India</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Campus locations */}
                            <div className="bg-muted/50 rounded-2xl p-6">
                                <h4 className="font-poppins font-semibold text-foreground mb-4">Our Campus Locations</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Malappuram - Inkel Campus', 'Malappuram - Kondotty', 'Kozhikode - Feroke', 'Kozhikode - Mathara', 'Thrissur Campus'].map((loc) => (
                                        <div key={loc} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                            <span className="text-sm text-muted-foreground">{loc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <NeetFooter />
        </div>
    );
}
