'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassPanel, GlassButton, GlassBadge } from '@/components/ui/glass';
import { X, Download, Star, Heart, Crown, Check, Sparkles } from 'lucide-react';
import { Template } from '@/lib/templates/serializer';
import { createBrowserClient } from '@/lib/supabase';

interface Profile {
  id: string;
  slug: string;
  title: string;
}

interface TemplatePreviewModalProps {
  template: Template;
  onClose: () => void;
  onInstall: (templateId: string, profileId: string) => void;
}

export function TemplatePreviewModal({
  template,
  onClose,
  onInstall,
}: TemplatePreviewModalProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const supabase = createBrowserClient();

  const loadProfiles = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, slug, title')
        .eq('user_id', user.id)
        .returns<Profile[]>();

      const profileOptions = data ?? [];
      setProfiles(profileOptions);

      const defaultProfileId = profileOptions[0]?.id;
      if (defaultProfileId) {
        setSelectedProfile(defaultProfileId);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }, [supabase]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleInstall = async () => {
    if (!selectedProfile) {
      alert('Please select a profile');
      return;
    }

    setLoading(true);
    try {
      await onInstall(template.id, selectedProfile);
    } catch (error) {
      console.error('Error installing template:', error);
    } finally {
      setLoading(false);
    }
  };

  const previewImages = [
    template.preview_image_url,
    ...(template.preview_images || []),
  ].filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <GlassPanel className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900/90 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{template.name}</h2>
              {template.featured && (
                <GlassBadge variant="warning">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </GlassBadge>
              )}
              {template.is_premium && (
                <GlassBadge variant="info">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </GlassBadge>
              )}
            </div>
            <p className="text-gray-200/80 max-w-3xl">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 pt-4 lg:grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="space-y-5">
            {/* Preview Images */}
            {previewImages.length > 0 && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-white/10 shadow-inner">
                  {previewImages[imageIndex] ? (
                    <img
                      src={previewImages[imageIndex]}
                      alt={`${template.name} preview ${imageIndex + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                </div>

                {previewImages.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {previewImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === imageIndex
                            ? 'bg-purple-400'
                            : 'bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`View preview ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-xl border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Download className="w-5 h-5 text-blue-300" />
                  <span className="text-2xl font-bold text-white">
                    {template.installs_count.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">Installs</p>
              </div>

              <div className="text-center p-4 bg-white/10 rounded-xl border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-amber-300" />
                  <span className="text-2xl font-bold text-white">
                    {template.rating_average.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  {template.rating_count} ratings
                </p>
              </div>

              <div className="text-center p-4 bg-white/10 rounded-xl border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Heart className="w-5 h-5 text-pink-300" />
                  <span className="text-2xl font-bold text-white">
                    {template.favorites_count.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">Favorites</p>
              </div>
            </div>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <GlassBadge key={tag} variant="default" className="text-xs bg-white/10 text-white border border-white/10">
                    {tag}
                  </GlassBadge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5 bg-white/5 rounded-2xl border border-white/10 p-5 shadow-lg">
            {/* Profile Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Install to Profile</label>
              <select
                value={selectedProfile || ''}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.title} (@{profile.slug})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-300">
                Your current profile content will be replaced. Personal info (title, bio,
                avatar) will be preserved.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <GlassButton
                variant="primary"
                className="flex-1"
                onClick={handleInstall}
                disabled={loading || !selectedProfile}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Install Template
                  </>
                )}
              </GlassButton>
              <GlassButton variant="secondary" onClick={onClose}>
                Cancel
              </GlassButton>
            </div>

            {/* Template Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">What&apos;s Included</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Pre-designed Layout</p>
                    <p className="text-sm text-gray-300">
                      {template.config.sections?.length || 0} sections with modules
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Custom Theme</p>
                    <p className="text-sm text-gray-300">Colors, fonts, and animations</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Fully Customizable</p>
                    <p className="text-sm text-gray-300">Edit all content and styling</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-9 h-9 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-pink-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Mobile Optimized</p>
                    <p className="text-sm text-gray-300">Looks great on all devices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
