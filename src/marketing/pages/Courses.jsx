import React from 'react';
import AnnouncementBar from '../components/eduport/AnnouncementBar';
import Navbar from '../components/eduport/Navbar';
import CoursesSection from '../components/eduport/CoursesSection';
import Footer from '../components/eduport/Footer';

export default function Courses() {
    return (
        <div className="min-h-screen bg-background">
            <AnnouncementBar />
            <Navbar />
            <CoursesSection />
            <Footer />
        </div>
    );
}