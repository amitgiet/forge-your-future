import React from 'react';
import NeetNavbar from '../components/neetforge/NeetNavbar';
import NeetFooter from '../components/neetforge/NeetFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const courses = [
    { title: 'NEET Foundation', description: 'Concept-first coaching with daily practice, analytics, and revision planning.' },
    { title: 'JEE Main Track', description: 'Focused problem-solving program with structured topic progression and mocks.' },
    { title: 'Board + Entrance Integrated', description: 'Balanced preparation for board exams and competitive entrance tests.' },
];

export default function Courses() {
    return (
        <div className="min-h-screen bg-background">
            <NeetNavbar />
            <section className="pt-28 pb-16 md:pt-32 md:pb-24">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">Courses</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Structured entrance-prep programs designed for consistency, performance tracking, and revision depth.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {courses.map((course) => (
                            <Card key={course.title} className="border-border">
                                <CardHeader>
                                    <CardTitle className="text-lg">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{course.description}</p>
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
