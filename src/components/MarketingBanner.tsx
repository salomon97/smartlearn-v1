'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, BookOpen, Facebook, GraduationCap, Award } from 'lucide-react';

export default function MarketingBanner() {
    return (
        <div className="bg-gradient-to-r from-slate-900 via-brand-orange-dark to-slate-900 overflow-hidden py-2 border-b border-brand-orange/30 relative z-50">
            <div className="flex animate-marquee whitespace-nowrap items-center text-sm font-medium text-white/90">
                {/* We double the content to create a seamless infinite scroll loop */}
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-8 mx-4">
                        <span className="flex items-center text-amber-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-2"></span>
                            SmartLearn propulsé par Salomon FOE
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2 text-brand-orange" />
                            Enseignant de Mathématiques et d'Informatique
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Cours en ligne & présentiel, Tuteurat, Mentorat, Prépa Concours
                        </span>
                        <span>•</span>
                        <span className="flex items-center font-bold text-amber-400 tracking-wide">
                            <Phone className="w-4 h-4 mr-2" />
                            +237 671 719 124 (WhatsApp)
                        </span>
                        <span>•</span>
                        <span className="flex items-center font-bold text-amber-400 tracking-wide">
                            <Phone className="w-4 h-4 mr-2" />
                            +237 691 276 334 (WhatsApp / Telegram)
                        </span>
                        <span>•</span>
                        <Link
                            href="https://web.facebook.com/profile.php?id=61571710934335"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:text-white text-blue-400 transition-colors"
                        >
                            <Facebook className="w-4 h-4 mr-2" />
                            Rejoignez-moi sur Facebook
                        </Link>
                        <span>•</span>
                        <span className="flex items-center text-brand-orange-light">
                            <Award className="w-4 h-4 mr-2" />
                            L'excellence à votre portée
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
