"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { programs, Program } from "@/data/curriculum";
import { ShieldCheck, ArrowRight, X, GraduationCap, Laptop, BookOpen } from "lucide-react";

export default function CataloguePage() {
    const [selectedCycle, setSelectedCycle] = useState<string>("Tous");
    const [showModal, setShowModal] = useState(false);
    const [activeProgram, setActiveProgram] = useState<Program | null>(null);

    const cycles = ["Tous", "Premier Cycle", "Second Cycle Littéraire", "Second Cycle Scientifique", "Série Technique"];

    const filteredPrograms = selectedCycle === "Tous" 
        ? programs 
        : programs.filter(p => p.cycle === selectedCycle);

    const handleProgramClick = (program: Program) => {
        setActiveProgram(program);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-[var(--primary-dark)] text-white selection:bg-[var(--primary-gold)]/30">
            {/* Nav Header */}
            <header className="bg-[var(--primary-dark)]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
                        <span className="text-xl font-black">
                            Smart<span className="text-[var(--primary-gold)]">Learn</span>
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-bold">
                        <Link href="/auth/connexion" className="text-gray-400 hover:text-white transition-colors">Connexion</Link>
                        <Link href="/auth/inscription" className="bg-white text-[var(--primary-dark)] px-4 py-2 rounded-full hover:bg-[var(--primary-gold)] transition-all">
                            S'inscrire
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-6 py-20 relative">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[var(--primary-gold)]/5 blur-[120px] pointer-events-none"></div>

                <div className="text-center mb-16 relative">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[var(--primary-gold)] text-xs font-black uppercase tracking-widest">
                        Catalogue Officiel
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6">Explorez nos <span className="gradient-gold font-black">Programmes</span></h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                        De la 6ème à la Terminale, accédez à des cours structurés selon l'Approche Par les Compétences (APC). 100% conformes au programme du Cameroun.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-16 overflow-x-auto pb-4 no-scrollbar">
                    {cycles.map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => setSelectedCycle(cycle)}
                            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300 ${
                                selectedCycle === cycle 
                                ? "bg-[var(--primary-gold)] border-[var(--primary-gold)] text-[var(--primary-dark)] shadow-lg shadow-[var(--primary-gold)]/20 scale-105" 
                                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10"
                            }`}
                        >
                            {cycle}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                    {filteredPrograms.map((program) => (
                        <div 
                            key={program.id}
                            onClick={() => handleProgramClick(program)}
                            className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/10 hover:border-[var(--primary-gold)]/30 hover:shadow-2xl hover:shadow-[var(--primary-gold)]/10 transition-all duration-500 cursor-pointer flex flex-col"
                        >
                            {/* Card Header Illustration */}
                            <div className={`h-40 bg-gradient-to-br ${program.color} relative overflow-hidden flex items-center justify-center`}>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <span className="text-7xl group-hover:scale-110 transition-transform duration-500">{program.icon}</span>
                                
                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{program.category}</span>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 rounded-lg bg-[var(--primary-gold)]/10 border border-[var(--primary-gold)]/20 text-[var(--primary-gold)]">
                                        {program.category.includes('Info') ? <Laptop className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{program.cycle}</span>
                                </div>

                                <h3 className="text-2xl font-black mb-3 group-hover:text-[var(--primary-gold)] transition-colors">{program.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">{program.description}</p>

                                <div className="space-y-3 mb-8">
                                    {program.objectives.slice(0, 2).map((obj, i) => (
                                        <div key={i} className="flex items-start gap-3 text-[11px] font-bold text-white/70">
                                            <ShieldCheck className="w-4 h-4 text-[var(--primary-gold)] shrink-0" />
                                            <span>{obj}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-gray-500">Accès</span>
                                        <span className="text-xs font-black text-[var(--primary-gold)]">MEMBRE VIP</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[var(--primary-gold)] text-[var(--primary-dark)] flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Box Footer */}
                <div className="mt-24 p-12 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-3xl font-black mb-4">Prêt à devenir <span className="text-[var(--primary-gold)]">l'élite</span> ?</h2>
                        <p className="text-gray-400 font-medium leading-relaxed">
                            Rejoignez plus de 500 élèves qui utilisent déjà nos cours pour transformer leurs résultats scolaires au Cameroun.
                        </p>
                    </div>
                    <Link href="/auth/inscription" className="px-10 py-5 bg-[var(--primary-gold)] hover:bg-[var(--primary-gold-hover)] text-[var(--primary-dark)] rounded-full font-black transition-all transform hover:scale-105 shadow-xl shadow-[var(--primary-gold)]/20 whitespace-nowrap">
                        M'inscrire Maintenant
                    </Link>
                </div>
            </main>

            {/* Registration Modal */}
            {showModal && activeProgram && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[var(--primary-dark)]/80 backdrop-blur-xl" onClick={() => setShowModal(false)}></div>
                    
                    <div className="relative bg-[#1a2236] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                        {/* Modal Header Decoration */}
                        <div className={`h-4 bg-gradient-to-r ${activeProgram.color}`}></div>
                        
                        <div className="p-10">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-gray-400 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-[var(--primary-gold)]/10 text-[var(--primary-gold)] flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-white/10">
                                    {activeProgram.icon}
                                </div>
                                <h1 className="text-3xl font-black mb-4">{activeProgram.title}</h1>
                                <div className="bg-[var(--primary-gold)]/10 px-4 py-1.5 rounded-full text-xs font-black text-[var(--primary-gold)] mb-8 uppercase tracking-widest border border-[var(--primary-gold)]/20 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    Offre Exclusive VIP
                                </div>
                                
                                <p className="text-gray-300 text-lg leading-relaxed mb-10">
                                    Ce module est conçu pour vous offrir une maîtrise totale du programme officiel. Pour accéder aux vidéos, PDF et exercices de cette formation, vous devez être **Visiteur VIP**.
                                </p>

                                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="text-[var(--primary-gold)] mb-2 font-black text-[10px] uppercase">Niveau</div>
                                        <div className="text-sm font-bold text-white">{activeProgram.gradeLevels.join(', ')}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="text-[var(--primary-gold)] mb-2 font-black text-[10px] uppercase">Méthode</div>
                                        <div className="text-sm font-bold text-white">APC (Compétences)</div>
                                    </div>
                                </div>

                                <div className="w-full flex flex-col gap-4">
                                    <Link 
                                        href="/auth/inscription" 
                                        className="w-full py-5 bg-[var(--primary-gold)] hover:bg-[var(--primary-gold-hover)] text-[var(--primary-dark)] rounded-2xl font-black transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                        S'enregistrer comme Visiteur VIP
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="w-full py-4 text-gray-500 font-bold hover:text-white transition-colors text-sm"
                                    >
                                        Peut-être plus tard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

