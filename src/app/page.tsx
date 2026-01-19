'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProfileCard from '@/components/ProfileCard';
import { useStore } from '@/store';
import { FileText, Pill, TestTube, Calendar, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Stethoscope, Lightbulb, Phone, Droplets, Loader2, ChevronRight, Edit3, X } from 'lucide-react';
import Link from 'next/link';
import { format, isAfter, parseISO } from 'date-fns';

interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
}

interface HealthTipsData {
  dailyTip: {
    title: string;
    content: string;
    category: string;
  };
  tips: HealthTip[];
  focusAreas: string[];
}

export default function Dashboard() {
  const { medications, documents, labReports, appointments, profile, updateProfile } = useStore();
  const [healthTips, setHealthTips] = useState<HealthTipsData | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(true);
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState<{
    name: string;
    relationship: string;
    phone: string;
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  }>({
    name: profile.emergencyContact?.name || '',
    relationship: profile.emergencyContact?.relationship || '',
    phone: profile.emergencyContact?.phone || '',
    bloodGroup: profile.emergencyContact?.bloodGroup || 'O+',
  });

  const bloodGroups: ('A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-')[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const activeMedications = medications.filter((m) => m.status === 'active');
  const now = new Date();
  const upcomingAppointments = appointments
    .filter((apt) => isAfter(parseISO(`${apt.date}T${apt.time}`), now))
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 2);

  const abnormalValues = labReports.flatMap((report) =>
    report.values.filter((v) => v.trend !== 'normal')
  );

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchHealthTips = async () => {
      setIsLoadingTips(true);
      try {
        const response = await fetch('/api/health-tips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null,
            gender: profile.gender,
            bloodGroup: profile.bloodGroup,
            allergies: profile.allergies,
            medications: activeMedications.map((m) => ({
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
            })),
            labValues: labReports.flatMap((report) =>
              report.values.map((v) => ({
                name: v.name,
                value: v.value,
                unit: v.unit,
                trend: v.trend,
              }))
            ),
            hasAbnormalValues: abnormalValues.length > 0,
          }),
        });

        const data = await response.json();
        setHealthTips(data);
      } catch (err) {
        console.error('Error fetching health tips:', err);
      } finally {
        setIsLoadingTips(false);
      }
    };

    fetchHealthTips();
  }, []);

  const stats = [
    {
      icon: Pill,
      label: 'Active Meds',
      value: activeMedications.length,
      color: 'bg-[var(--spital-gold)]',
      href: '/medications',
    },
    {
      icon: Calendar,
      label: 'Doctor Appointments',
      value: appointments.length,
      color: 'bg-[var(--spital-green)]',
      href: '/appointments',
    },
    {
      icon: TestTube,
      label: 'Lab Reports',
      value: labReports.length,
      color: 'bg-[var(--success)]',
      href: '/lab-reports',
    },
    {
      icon: AlertTriangle,
      label: 'Deficiencies',
      value: abnormalValues.length,
      color: abnormalValues.length > 0 ? 'bg-[var(--signal-red)]' : 'bg-[var(--spital-green-light)]',
      href: '/lab-reports',
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

      {/* Emergency Contact */}
      <div className="glass-card p-4 sm:p-5 border-l-4 border-[var(--signal-red)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-[var(--signal-red)]/15 flex items-center justify-center flex-shrink-0">
              <Phone size={22} className="text-[var(--signal-red)]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">Emergency Contact</p>
              <p className="font-semibold text-[var(--text-primary)] truncate">
                {profile.emergencyContact?.name || 'Not set'}
                {profile.emergencyContact?.relationship && (
                  <span className="text-xs text-[var(--text-muted)] font-normal ml-1">({profile.emergencyContact.relationship})</span>
                )}
              </p>
              <p className="text-sm text-[var(--spital-gold)] font-medium">
                {profile.emergencyContact?.phone || 'Add phone number'}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-12 bg-[var(--border-color)]" />

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--signal-red)]/15 flex items-center justify-center flex-shrink-0">
              <Droplets size={22} className="text-[var(--signal-red)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-medium">Blood Type</p>
              <p className="text-2xl font-bold text-[var(--signal-red)]">
                {profile.emergencyContact?.bloodGroup || 'Not set'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEmergencyForm({
                name: profile.emergencyContact?.name || '',
                relationship: profile.emergencyContact?.relationship || '',
                phone: profile.emergencyContact?.phone || '',
                bloodGroup: profile.emergencyContact?.bloodGroup || 'O+',
              });
              setIsEditingEmergency(true);
            }}
            className="btn-secondary text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Edit3 size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* Emergency Contact Edit Modal */}
      {isEditingEmergency && (
        <div className="modal-overlay" onClick={() => setIsEditingEmergency(false)}>
          <div className="modal-content p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--spital-green)]">Edit Emergency Contact</h2>
              <button
                onClick={() => setIsEditingEmergency(false)}
                className="p-2 rounded-lg hover:bg-[var(--spital-slate)] transition-colors"
              >
                <X size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Contact Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={emergencyForm.name}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                    placeholder="Enter contact name"
                  />
                </div>

                <div>
                  <label className="input-label">Relationship</label>
                  <input
                    type="text"
                    className="input-field"
                    value={emergencyForm.relationship}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={emergencyForm.phone}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="input-label">Blood Group</label>
                  <select
                    className="input-field"
                    value={emergencyForm.bloodGroup}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, bloodGroup: e.target.value as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' })}
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
              <button
                onClick={() => setIsEditingEmergency(false)}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateProfile({
                    emergencyContact: {
                      name: emergencyForm.name,
                      relationship: emergencyForm.relationship,
                      phone: emergencyForm.phone,
                      bloodGroup: emergencyForm.bloodGroup,
                    },
                  });
                  setIsEditingEmergency(false);
                }}
                className="btn-primary w-full sm:w-auto"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Health Tips Section */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--spital-green)] flex items-center gap-2">
            <Lightbulb size={20} className="text-[var(--spital-gold)]" />
            Personalized Health Tips
          </h3>
          <Link href="/health-tips" className="text-sm text-[var(--spital-gold)] hover:underline font-medium flex items-center gap-1">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {isLoadingTips ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[var(--spital-gold)]" />
            <span className="ml-2 text-[var(--text-muted)]">Loading tips...</span>
          </div>
        ) : healthTips ? (
          <div className="space-y-4">
            {/* Daily Tip */}
            {healthTips.dailyTip && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--spital-gold)]/10 to-[var(--spital-green)]/5 border border-[var(--spital-gold)]/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--spital-gold)] flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={20} className="text-[var(--spital-green)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--spital-gold)] font-semibold uppercase tracking-wide mb-1">Today's Tip</p>
                    <h4 className="font-semibold text-[var(--text-primary)]">{healthTips.dailyTip.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{healthTips.dailyTip.content}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {healthTips.tips.slice(0, 3).map((tip) => (
                <div key={tip.id} className="p-3 rounded-xl bg-[var(--spital-slate)] border border-[var(--border-color)]">
                  <h4 className="font-medium text-[var(--text-primary)] text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Lightbulb size={40} className="mx-auto text-[var(--text-muted)] mb-2" />
            <p className="text-[var(--text-muted)]">Unable to load health tips</p>
          </div>
        )}
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

      {/* AI Features */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        <Link href="/symptom-checker">
          <div className="ai-summary-card cursor-pointer group h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--success)] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Stethoscope size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="ai-badge mb-2 inline-block">AI Powered</span>
                <h3 className="text-base font-semibold text-[var(--spital-green)]">Symptom Checker</h3>
                <p className="text-sm text-[var(--text-secondary)]">Get guidance on what to track and ask your doctor</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/health-tips">
          <div className="ai-summary-card cursor-pointer group h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--spital-gold)] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Lightbulb size={24} className="text-[var(--spital-green)]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="ai-badge mb-2 inline-block">Personalized</span>
                <h3 className="text-base font-semibold text-[var(--spital-green)]">Health Tips</h3>
                <p className="text-sm text-[var(--text-secondary)]">AI-curated tips based on your health profile</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/ai-summary">
          <div className="ai-summary-card cursor-pointer group h-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--spital-green)] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Brain size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="ai-badge mb-2 inline-block">AI Summary</span>
                <h3 className="text-base font-semibold text-[var(--spital-green)]">Health Summary</h3>
                <p className="text-sm text-[var(--text-secondary)]">Get comprehensive insights from your data</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Security Notice */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--success)] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[var(--spital-green)]">Your Data is Secure</h3>
            <p className="text-sm text-[var(--text-secondary)]">All your health information stays on your device</p>
          </div>
          <Link href="/privacy" className="text-sm text-[var(--spital-gold)] hover:underline font-medium whitespace-nowrap">
            Manage privacy →
          </Link>
        </div>
      </div>
    </div>
  );
}
