import React from 'react';
import NeetNavbar from '../components/neetforge/NeetNavbar';
import NeetFooter from '../components/neetforge/NeetFooter';
import { MapPin, Users, BookOpen, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const campuses = [
    {
        city: 'Malappuram',
        locations: [
            { name: 'Inkel Campus', features: ['NEET Coaching', 'JEE Coaching', 'Board Prep'] },
            { name: 'Kondotty Campus', features: ['NEET Coaching', 'JEE Coaching', 'Board Prep'] },
        ],
    },
    {
        city: 'Kozhikode',
        locations: [
            { name: 'Feroke Campus', features: ['NEET Coaching', 'JEE Coaching'] },
            { name: 'Mathara Campus', features: ['NEET Coaching', 'JEE Coaching'] },
        ],
    },
    {
        city: 'Thrissur',
        locations: [
            { name: 'Eduport Campus', features: ['NEET Coaching', 'JEE Coaching', 'Board Prep'] },
        ],
    },
];

const highlights = [
    { icon: Users, value: '50+', label: 'Expert Faculty' },
    { icon: BookOpen, value: '500+', label: 'Hours of Coaching' },
    { icon: Clock, value: '100+', label: 'Tests & Assessments' },
    { icon: MapPin, value: '5', label: 'Campus Locations' },
];

export default function Campus() {
    return (
        <div className="min-h-screen bg-background">
            <NeetNavbar />

            {/* Hero */}
            <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-accent text-accent-foreground">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-poppins font-bold mb-4">NEET JEE Campus</h1>
                    <p className="text-lg text-accent-foreground/80 max-w-2xl mx-auto">
                        Experience offline coaching at our state-of-the-art campuses across Kerala with the best faculty from IIT, NIT, and AIIMS.
                    </p>
                </div>
            </section>

            {/* Highlights */}
            <section className="py-12 -mt-0 relative z-10">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {highlights.map((h, i) => (
                            <Card key={i} className="text-center border-border shadow-lg">
                                <CardContent className="pt-6">
                                    <h.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                                    <p className="text-2xl font-poppins font-bold text-foreground">{h.value}</p>
                                    <p className="text-sm text-muted-foreground">{h.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Campus locations */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-3xl font-poppins font-bold text-foreground mb-10 text-center">Our Locations</h2>
                    <div className="space-y-10">
                        {campuses.map((campus) => (
                            <div key={campus.city}>
                                <h3 className="text-xl font-poppins font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {campus.city}
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {campus.locations.map((loc) => (
                                        <Card key={loc.name} className="border-border hover:shadow-md transition-shadow">
                                            <CardHeader>
                                                <CardTitle className="text-lg">{loc.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {loc.features.map((f) => (
                                                        <span key={f} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{f}</span>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <NeetFooter />
        </div>
    );
}
