
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { isWorkshopExpired } from '../utils';

interface HeroProps {
  onExploreClick: () => void;
  onOpenWorkshopDetails: (workshopId: number) => void;
}

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center mx-2 sm:mx-3">
        <span className="text-2xl sm:text-4xl font-bold text-black tracking-tight">
            {value.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-1 font-bold">{label}</span>
    </div>
);

const Hero: React.FC<HeroProps> = ({ onExploreClick, onOpenWorkshopDetails }) => {
    const { workshops } = useUser();

    const nextWorkshop = useMemo(() => {
        const upcomingWorkshops = workshops
            .filter(w => w.isVisible && !w.isRecorded && !isWorkshopExpired(w))
            .sort((a, b) => new Date(`${a.startDate}T${a.startTime}:00Z`).getTime() - new Date(`${b.startDate}T${b.startTime}:00Z`).getTime());
        return upcomingWorkshops[0];
    }, [workshops]);

    const calculateTimeLeft = () => {
        if (!nextWorkshop) return null;

        const targetDate = new Date(`${nextWorkshop.startDate}T${nextWorkshop.startTime}:00Z`);
        const difference = +targetDate - +new Date();
        
        let timeLeft: { days?: number; hours?: number; minutes?: number; seconds?: number } | null = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60