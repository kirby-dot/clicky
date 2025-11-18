'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassPanel, GlassButton, GlassBadge } from '@/components/ui/glass';
import {
  X,
  Download,
  Star,
  Heart,
  Crown,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
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
        .eq('user_id', user.id);

      if (data) {
        setProfiles(data);
        if (data.length > 0) {
          setSelectedProfile(data[0].id);
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassPanel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{template.name}</h2>
              {template.featured && (
                <GlassBadge variant="warning">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </GlassBadge>
              )}
              {template.is_premium && (
                <GlassBadge variant="primary">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </GlassBadge>
              )}
            </div>
            <p className="text-gray-400">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Preview Images */}
        {previewImages.length > 0 && (
          <div className="p-6 space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              {previewImages[imageIndex] ? (
                <img
                  src={previewImages[imageIndex]}
                  alt={`${template.name} preview ${imageIndex + 1}`}
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-white/20" />
                </div>
              )}
            </div>

            {/* Image Navigation */}
            {previewImages.length > 1 && (
              <div className="flex gap-2 justify-center">
                {previewImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === imageIndex
                        ? 'bg-purple-500'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Download className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {template.installs_count.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-400">Installs</p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {template.rating_average.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {template.rating_count} ratings
              </p>
            </div>

            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="text-2xl font-bold text-white">
                  {template.favorites_count.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-400">Favorites</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <GlassBadge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </GlassBadge>
              ))}
            </div>
          </div>
        )}

        {/* Profile Selection */}
        <div className="px-6 pb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Install to Profile
          </label>
          <select
            value={selectedProfile || ''}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.title} (@{profile.slug})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-2">
            Your current profile content will be replaced. Personal info (title, bio,
            avatar) will be preserved.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <GlassButton
            variant="primary"
            className="flex-1"
            onClick={handleInstall}
            disabled={loading || !selectedProfile}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
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
        <div className="px-6 pb-6 border-t border-white/10 pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">What&apos;s Included</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Pre-designed Layout</p>
                <p className="text-sm text-gray-400">
                  {template.config.sections?.length || 0} sections with modules
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Custom Theme</p>
                <p className="text-sm text-gray-400">
                  Colors, fonts, and animations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Fully Customizable</p>
                <p className="text-sm text-gray-400">
                  Edit all content and styling
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-white font-medium">Mobile Optimized</p>
                <p className="text-sm text-gray-400">
                  Looks great on all devices
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
