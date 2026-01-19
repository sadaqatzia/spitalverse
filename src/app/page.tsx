'use client';

import Header from '@/components/Header';
import ProfileCard from '@/components/ProfileCard';
import { useStore } from '@/store';
import { FileText, Pill, TestTube, Calendar, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format, isAfter, parseISO } from 'date-fns';

export default function Dashboard() {
  const { medications, documents, labReports, appointments, profile } = useStore();

  const activeMedications = medications.filter((m) => m.status === 'active');
  const now = new Date();
  const upcomingAppointments = appointments
    .filter((apt) => isAfter(parseISO(`${apt.date}T${apt.time}`), now))
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 2);

  const abnormalValues = labReports.flatMap((report) =>
    report.values.filter((v) => v.trend !== 'normal')
  );

  const stats = [
    {
      icon: FileText,
      label: 'Documents',
      value: documents.length,
      color: 'bg-[var(--spital-green)]',
      href: '/documents',
    },
    {
      icon: Pill,
      label: 'Active Meds',
      value: activeMedications.length,
      color: 'bg-[var(--spital-gold)]',
      href: '/medications',
    },
    {
      icon: TestTube,
      label: 'Lab Reports',
      value: labReports.length,
      color: 'bg-[var(--success)]',
      href: '/lab-reports',
    },
    {
      icon: Calendar,
      label: 'Upcoming',
      value: upcomingAppointments.length,
      color: 'bg-[var(--spital-green-light)]',
      href: '/appointments',
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-[var(--signal-red)]" />;
      case 'down':
        return <TrendingDown size={14} className="text-[var(--spital-gold)]" />;
      default:
        return <Minus size={14} className="text-[var(--success)]" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <Header
        title={profile.fullName ? `Welcome back, ${profile.fullName.split(' ')[0]}!` : 'Welcome to Spitalverse'}
        subtitle="Here's your health overview for today"
      />

      {/* Profile Card */}
      <ProfileCard />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <div className="glass-card p-3 sm:p-5 cursor-pointer group">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${stat.color} flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-xl sm:text-3xl font-bold text-[var(--spital-green)]">{stat.value}</p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Appointments */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--spital-green)] flex items-center gap-2">
              <Calendar size={20} className="text-[var(--spital-gold)]" />
              Upcoming Appointments
            </h3>
            <Link href="/appointments" className="text-sm text-[var(--spital-gold)] hover:underline font-medium">
              View all
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <Calendar size={40} className="mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-[var(--text-muted)]">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-[var(--spital-slate)] rounded-lg sm:rounded-xl border border-[var(--border-color)]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[var(--spital-gold)] flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="sm:w-[18px] sm:h-[18px] text-[var(--spital-green)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-[var(--text-primary)] truncate">{apt.doctorName}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">
                      {format(new Date(apt.date), 'MMM d')} at {apt.time}
                    </p>
                  </div>
                  <span className="tag text-[10px] sm:text-xs hidden sm:inline-flex">{apt.specialty}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Medications */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--spital-green)] flex items-center gap-2">
              <Pill size={20} className="text-[var(--spital-gold)]" />
              Active Medications
            </h3>
            <Link href="/medications" className="text-sm text-[var(--spital-gold)] hover:underline font-medium">
              View all
            </Link>
          </div>
          {activeMedications.length === 0 ? (
            <div className="text-center py-6">
              <Pill size={40} className="mx-auto text-[var(--text-muted)] mb-2" />
              <p className="text-[var(--text-muted)]">No active medications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeMedications.slice(0, 3).map((med) => (
                <div key={med.id} className="flex items-center gap-4 p-3 bg-[var(--spital-slate)] rounded-xl border border-[var(--border-color)]">
                  <div className="w-10 h-10 rounded-lg bg-[var(--spital-green)] flex items-center justify-center">
                    <Pill size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{med.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{med.dosage} • {med.frequency}</p>
                  </div>
                  <span className="status-active">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Health Alerts */}
      {abnormalValues.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-[var(--signal-red)]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--signal-red)]/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-[var(--signal-red)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--spital-green)] mb-2">Health Alerts</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                You have {abnormalValues.length} lab value{abnormalValues.length > 1 ? 's' : ''} outside the normal range.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {abnormalValues.slice(0, 4).map((value) => (
                  <span key={value.id} className={`tag ${value.trend === 'up' ? 'tag-danger' : 'tag-warning'} flex items-center gap-1`}>
                    {getTrendIcon(value.trend)}
                    {value.name}: {value.value} {value.unit}
                  </span>
                ))}
              </div>
              <Link href="/ai-summary" className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--spital-gold)] hover:underline font-medium">
                <Brain size={16} />
                Get AI Health Summary
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Health Check */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/ai-summary">
          <div className="ai-summary-card cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--spital-gold)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain size={28} className="text-[var(--spital-green)]" />
              </div>
              <div>
                <span className="ai-badge mb-2 inline-block">AI Powered</span>
                <h3 className="text-lg font-semibold text-[var(--spital-green)]">Generate Health Summary</h3>
                <p className="text-sm text-[var(--text-secondary)]">Get personalized insights based on your health data</p>
              </div>
            </div>
          </div>
        </Link>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[var(--success)] flex items-center justify-center">
              <CheckCircle2 size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--spital-green)]">Your Data is Secure</h3>
              <p className="text-sm text-[var(--text-secondary)]">All your health information stays on your device</p>
              <Link href="/privacy" className="text-sm text-[var(--spital-gold)] hover:underline mt-1 inline-block font-medium">
                Manage privacy settings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
