'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { Camera, X, Plus } from 'lucide-react';
import Image from 'next/image';
import { PatientProfile } from '@/types';

export default function ProfileCard() {
    const { profile, updateProfile } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<PatientProfile>(profile);
    const [allergyInput, setAllergyInput] = useState('');

    const calculateAge = (dob: string): number => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const addAllergy = () => {
        if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
            setFormData({
                ...formData,
                allergies: [...formData.allergies, allergyInput.trim()],
            });
            setAllergyInput('');
        }
    };

    const removeAllergy = (allergy: string) => {
        setFormData({
            ...formData,
            allergies: formData.allergies.filter((a) => a !== allergy),
        });
    };

    const bloodGroups: PatientProfile['bloodGroup'][] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    if (!isEditing) {
        return (
            <div className="glass-card p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-[var(--spital-gold)] flex items-center justify-center">
                            {profile.photo ? (
                                <Image
                                    src={profile.photo}
                                    alt={profile.fullName}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-[var(--spital-green)]">
                                    {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : '?'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--spital-green)]">
                                    {profile.fullName || 'Set up your profile'}
                                </h2>
                                {profile.dateOfBirth && (
                                    <p className="text-[var(--text-secondary)]">
                                        {calculateAge(profile.dateOfBirth)} years old • {profile.gender}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setFormData(profile);
                                    setIsEditing(true);
                                }}
                                className="btn-secondary text-sm"
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-[var(--spital-slate)] rounded-xl p-3 text-center border border-[var(--border-color)]">
                                <p className="text-xs text-[var(--text-muted)] mb-1">Blood Group</p>
                                <p className="text-lg font-bold text-[var(--signal-red)]">{profile.bloodGroup || '-'}</p>
                            </div>
                            <div className="bg-[var(--spital-slate)] rounded-xl p-3 text-center border border-[var(--border-color)]">
                                <p className="text-xs text-[var(--text-muted)] mb-1">DOB</p>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            <div className="bg-[var(--spital-slate)] rounded-xl p-3 text-center md:col-span-2 border border-[var(--border-color)]">
                                <p className="text-xs text-[var(--text-muted)] mb-1">Emergency Contact</p>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    {profile.emergencyContact.name || 'Not set'}
                                </p>
                            </div>
                        </div>

                        {/* Allergies */}
                        <div>
                            <p className="text-xs text-[var(--text-muted)] mb-2">Allergies</p>
                            <div className="flex flex-wrap gap-2">
                                {profile.allergies.length > 0 ? (
                                    profile.allergies.map((allergy) => (
                                        <span key={allergy} className="tag tag-danger">
                                            {allergy}
                                        </span>
                                    ))
                                ) : (
                                    <span className="tag tag-success">No known allergies</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-[var(--spital-green)] mb-6">Edit Profile</h2>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Photo Upload */}
                <div className="md:col-span-2 flex items-center gap-4">
                    <label className="relative cursor-pointer">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-[var(--spital-gold)] flex items-center justify-center">
                            {formData.photo ? (
                                <Image
                                    src={formData.photo}
                                    alt="Profile"
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Camera size={32} className="text-[var(--spital-green)]" />
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--spital-gold)] flex items-center justify-center border-2 border-white">
                            <Camera size={14} className="text-[var(--spital-green)]" />
                        </div>
                    </label>
                    <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">Profile Photo</p>
                        <p className="text-xs text-[var(--text-muted)]">Click to upload</p>
                    </div>
                </div>

                {/* Full Name */}
                <div>
                    <label className="input-label">Full Name</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                    />
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="input-label">Date of Birth</label>
                    <input
                        type="date"
                        className="input-field"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                </div>

                {/* Gender */}
                <div>
                    <label className="input-label">Gender</label>
                    <select
                        className="input-field"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as PatientProfile['gender'] })}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Blood Group */}
                <div>
                    <label className="input-label">Blood Group</label>
                    <select
                        className="input-field"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as PatientProfile['bloodGroup'] })}
                    >
                        {bloodGroups.map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                        ))}
                    </select>
                </div>

                {/* Allergies */}
                <div className="md:col-span-2">
                    <label className="input-label">Allergies</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            className="input-field flex-1"
                            value={allergyInput}
                            onChange={(e) => setAllergyInput(e.target.value)}
                            placeholder="Enter allergy"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                        />
                        <button
                            type="button"
                            onClick={addAllergy}
                            className="btn-secondary px-4"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.allergies.map((allergy) => (
                            <span key={allergy} className="tag tag-danger">
                                {allergy}
                                <button onClick={() => removeAllergy(allergy)}>
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-[var(--spital-green)] mb-4">Emergency Contact</p>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="input-label">Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.emergencyContact.name}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                                })}
                                placeholder="Contact name"
                            />
                        </div>
                        <div>
                            <label className="input-label">Relationship</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.emergencyContact.relationship}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value },
                                })}
                                placeholder="e.g., Spouse, Parent"
                            />
                        </div>
                        <div>
                            <label className="input-label">Phone</label>
                            <input
                                type="tel"
                                className="input-field"
                                value={formData.emergencyContact.phone}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                                })}
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--border-color)]">
                <button onClick={() => setIsEditing(false)} className="btn-secondary">
                    Cancel
                </button>
                <button onClick={handleSave} className="btn-primary">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
