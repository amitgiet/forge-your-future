
import React from 'react';
import NeetNavbar from '../components/neetforge/NeetNavbar';
import NeetFooter from '../components/neetforge/NeetFooter';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const positions = [
    { title: 'Physics Faculty - NEET/JEE', location: 'Malappuram', type: 'Full-time', department: 'Teaching' },
    { title: 'Chemistry Faculty - NEET', location: 'Kozhikode', type: 'Full-time', department: 'Teaching' },
    { title: 'Mathematics Faculty - JEE', location: 'Thrissur', type: 'Full-time', department: 'Teaching' },
    { title: 'Biology Faculty - NEET', location: 'Malappuram', type: 'Full-time', department: 'Teaching' },
    { title: 'Content Developer', location: 'Remote', type: 'Full-time', department: 'Content' },
    { title: 'Video Editor', location: 'Malappuram', type: 'Full-time', department: 'Media' },
];

export default function Careers() {
    return (
        <div className="min-h-screen bg-background">
            <NeetNavbar />

            {/* Hero */}
            <section className="pt-28 pb-16 md:pt-32 md:pb-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">Join Our Team</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Be part of the mission to make quality education accessible and affordable. We're looking for passionate individuals to help shape the future of learning.
                    </p>
                </div>
            </section>

            {/* Positions */}
            <section className="pb-16 md:pb-24">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-2xl font-poppins font-bold text-foreground mb-8">Open Positions</h2>
                    <div className="space-y-4">
                        {positions.map((pos, i) => (
                            <Card key={i} className="border-border hover:shadow-md transition-shadow">
                                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
                                    <div>
                                        <h3 className="font-semibold text-foreground text-lg">{pos.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5" /> {pos.location}
                                            </span>
                                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="w-3.5 h-3.5" /> {pos.type}
                                            </span>
                                            <Badge variant="secondary" className="text-xs">{pos.department}</Badge>
                                        </div>
                                    </div>
                                    <Button className="bg-primary hover:bg-primary/90 shrink-0">Apply Now</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <NeetFooter />
        </div>
    );
}
