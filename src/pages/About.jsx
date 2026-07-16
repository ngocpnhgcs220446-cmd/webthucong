import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { SectionHeader } from '../components/Section';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { useAuth, useAdminMode } from '../context/AuthContext';
import Editable from '../components/Editable';
import AdminImageUploader from '../admin/components/AdminImageUploader';
import { apiFetch } from '../utils/apiFetch';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { company, achievements as defaultAchievements } from '../data/initialData';

export default function About() {
  const { isAdmin } = useAuth();
  const isAdminMode = useAdminMode();
  
  const [settings, setSettings] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data);
      if (data.aboutAchievements) {
        try {
          setAchievements(JSON.parse(data.aboutAchievements));
        } catch(e) {
          setAchievements(defaultAchievements);
        }
      } else {
        setAchievements(defaultAchievements);
      }
    }).catch(console.error);

    fetch('/api/team-members').then(r => r.json()).then(setTeamMembers).catch(console.error);
  }, []);

  const handleSaveSetting = async (key, value) => {
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (res.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to save setting');
    }
  };

  const saveAchievements = async (newArr) => {
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutAchievements: JSON.stringify(newArr) })
      });
      if (res.ok) {
        setAchievements(newArr);
      }
    } catch (e) {
      toast.error('Failed to save achievements');
    }
  };

  const handleAddAchievement = () => {
    const text = prompt('Enter new achievement:');
    if (text) {
      const newArr = [...achievements, text];
      saveAchievements(newArr);
    }
  };

  const handleDeleteAchievement = (index) => {
    if (confirm('Delete this achievement?')) {
      const newArr = achievements.filter((_, i) => i !== index);
      saveAchievements(newArr);
    }
  };

  const handleEditAchievement = (index, newValue) => {
    const newArr = [...achievements];
    newArr[index] = newValue;
    saveAchievements(newArr);
  };

  const handleAddTeamMember = async () => {
    try {
      const res = await apiFetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Member',
          role: 'Role',
          bio: 'Short bio...',
          image: '/pics/product1.jpg'
        })
      });
      if (res.ok) {
        const newMember = await res.json();
        setTeamMembers([...teamMembers, newMember]);
        toast.success('Team member added');
      }
    } catch(e) {
      toast.error('Failed to add team member');
    }
  };

  const handleDeleteTeamMember = async (id) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
      const res = await apiFetch(`/api/team-members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
        toast.success('Team member deleted');
      }
    } catch(e) {
      toast.error('Failed to delete team member');
    }
  };

  const handleUpdateTeamMember = async (id, field, value) => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return;
    const updatedMember = { ...member, [field]: value };
    
    // Optimistic update
    setTeamMembers(teamMembers.map(m => m.id === id ? updatedMember : m));
    
    try {
      await apiFetch(`/api/team-members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMember)
      });
    } catch(e) {
      toast.error(`Failed to update ${field}`);
      // Rollback on failure (lazy approach)
      fetch('/api/team-members').then(r => r.json()).then(setTeamMembers);
    }
  };

  return (
    <PageTransition>
      <SEO title="About Us | Conical Hat-Workshop group" description="Brand story, mission, and vision of Conical Hat-Workshop group." />
      
      {/* Hero Section */}
      <section className="page-hero-immersive">
        {isAdminMode ? (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
            <AdminImageUploader 
              currentImage={settings.aboutHeroImage || '/pics/product4.jpg'} 
              onUpload={(url) => handleSaveSetting('aboutHeroImage', url)} 
              mode="cover"
            />
          </div>
        ) : (
          <img src={settings.aboutHeroImage || '/pics/product4.jpg'} alt="About us background" />
        )}
        
        <ScrollReveal className="page-hero-immersive-content" style={{ zIndex: 2, position: 'relative' }}>
          <span className="eyebrow" style={{ color: 'var(--gold)' }}>
            <Editable 
              value={settings.aboutHeroEyebrow || 'Our Story'} 
              onSave={val => handleSaveSetting('aboutHeroEyebrow', val)} 
              disabled={!isAdminMode}
            />
          </span>
          <h1>
            <Editable 
              value={settings.aboutHeroTitle || 'Preserving the Art of Vietnamese Craftsmanship'} 
              onSave={val => handleSaveSetting('aboutHeroTitle', val)} 
              disabled={!isAdminMode}
            />
          </h1>
          <Editable 
            value={settings.aboutHeroDescription || company.shortIntro}
            onSave={val => handleSaveSetting('aboutHeroDescription', val)}
            disabled={!isAdminMode}
            type="textarea"
            tag="p"
          />
        </ScrollReveal>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container two-col" style={{ alignItems: 'center' }}>
          <ScrollReveal>
            <div className="section-header">
              <span className="eyebrow">
                <Editable 
                  value={settings.aboutStoryEyebrow || 'Brand story'} 
                  onSave={val => handleSaveSetting('aboutStoryEyebrow', val)} 
                  disabled={!isAdminMode}
                />
              </span>
              <h2>
                <Editable 
                  value={settings.aboutStoryTitle || 'A passion for cultural heritage'} 
                  onSave={val => handleSaveSetting('aboutStoryTitle', val)} 
                  disabled={!isAdminMode}
                />
              </h2>
              <Editable 
                value={settings.aboutStoryDescription || 'Our workshop was created to help travellers, companies and remote communities experience the traditional Vietnamese art of conical hat making through well-designed workshops and curated activities.'}
                onSave={val => handleSaveSetting('aboutStoryDescription', val)}
                disabled={!isAdminMode}
                type="textarea"
                tag="p"
                className="description"
              />
            </div>
            
            <div className="body-copy">
              <Editable 
                value={settings.aboutStoryBody || 'Instead of offering a generic tour, our workshop focuses on guided participation: crafting, storytelling, and creating take-home memories. Every activity is designed to be simple to understand, easy to book and flexible enough for different audiences.'}
                onSave={val => handleSaveSetting('aboutStoryBody', val)}
                disabled={!isAdminMode}
                type="textarea"
                tag="p"
              />
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '100%', height: '100%', border: '2px solid var(--gold)', borderRadius: '32px', zIndex: 0 }}></div>
            <div style={{ position: 'relative', zIndex: 10, borderRadius: '32px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', aspectRatio: '4/5' }}>
              {isAdminMode ? (
                <AdminImageUploader 
                  currentImage={settings.aboutStoryImage || '/pics/product1.jpg'} 
                  onUpload={url => handleSaveSetting('aboutStoryImage', url)}
                  mode="cover"
                />
              ) : (
                <img src={settings.aboutStoryImage || '/pics/product1.jpg'} alt="Team and workshop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section soft-bg">
        <div className="container">
          <div className="mission-grid" style={{ gridTemplateColumns: '1fr', gap: '64px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <ScrollReveal>
              <span className="eyebrow">Our Mission</span>
              <Editable 
                value={settings.aboutMission || company.mission}
                onSave={val => handleSaveSetting('aboutMission', val)}
                disabled={!isAdminMode}
                type="textarea"
                tag="h2"
                style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: '1.2' }}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <span className="eyebrow">Our Vision</span>
              <Editable 
                value={settings.aboutVision || company.vision}
                onSave={val => handleSaveSetting('aboutVision', val)}
                disabled={!isAdminMode}
                type="textarea"
                tag="h2"
                style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: '1.2' }}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <SectionHeader align="center" eyebrow="Our Artisans" title="Meet the Team" description="Meet the passionate artisans and hosts who will guide you through the art of conical hat making." />
          </ScrollReveal>
          
          <div className="team-grid">
            {teamMembers.map((member, i) => (
              <ScrollReveal delay={i * 0.1} className="team-card" key={member.id}>
                {isAdminMode ? (
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => handleDeleteTeamMember(member.id)}
                      style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: 'var(--error, #e53e3e)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div style={{ height: '300px' }}>
                      <AdminImageUploader 
                        currentImage={member.image} 
                        onUpload={url => handleUpdateTeamMember(member.id, 'image', url)}
                      />
                    </div>
                  </div>
                ) : (
                  <img src={member.image} alt={member.name} />
                )}
                
                <h3 style={{ marginTop: '16px' }}>
                  <Editable 
                    value={member.name} 
                    onSave={val => handleUpdateTeamMember(member.id, 'name', val)} 
                    disabled={!isAdminMode}
                  />
                </h3>
                <p>
                  <strong>
                    <Editable 
                      value={member.role} 
                      onSave={val => handleUpdateTeamMember(member.id, 'role', val)} 
                      disabled={!isAdminMode}
                    />
                  </strong>
                </p>
                <div style={{ marginTop: '12px' }}>
                  {isAdminMode ? (
                    <textarea 
                      value={member.bio}
                      onChange={e => handleUpdateTeamMember(member.id, 'bio', e.target.value)}
                      style={{ width: '100%', border: '1px solid var(--line)', padding: '8px', minHeight: '100px', fontSize: 'inherit', fontFamily: 'inherit' }}
                    />
                  ) : (
                    <p>{member.bio}</p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          {isAdminMode && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button className="btn" onClick={handleAddTeamMember}><Plus size={18} /> Add Team Member</button>
            </div>
          )}
        </div>
      </section>

      {/* Achievements Section */}
      <section className="section dark-section">
        <div className="container">
          <ScrollReveal>
            <SectionHeader align="center" eyebrow="Our achievements" title="Proof points for local and international customers" />
          </ScrollReveal>
          
          <div className="achievement-grid">
            {achievements.map((item, i) => (
              <ScrollReveal delay={i * 0.1} key={i}>
                <div style={{ position: 'relative' }}>
                  <Editable 
                    value={item} 
                    onSave={val => handleEditAchievement(i, val)} 
                    disabled={!isAdminMode}
                  />
                  {isAdminMode && (
                    <button 
                      onClick={() => handleDeleteAchievement(i)}
                      style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
          
          {isAdminMode && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button className="btn btn-secondary" onClick={handleAddAchievement}><Plus size={18} /> Add Achievement</button>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
