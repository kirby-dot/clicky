'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { GlassPanel, GlassCard, GlassButton, GlassBadge } from '@/components/ui/glass';
import {
  Search,
  Filter,
  Star,
  Download,
  Heart,
  Sparkles,
  Crown,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { Template } from '@/lib/templates/serializer';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { useRouter } from 'next/navigation';

interface TemplateCategory {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
}

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const supabase = createBrowserClient();
  const router = useRouter();

  useEffect(() => {
    loadCategories();
    loadTemplates();
  }, [selectedCategory, priceFilter, searchQuery]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/templates/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append('category_id', selectedCategory);
      }

      if (priceFilter !== 'all') {
        params.append('price', priceFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/templates?${params.toString()}`);
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleInstallTemplate = async (templateId: string, profileId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          preserve_personal_info: true,
        }),
      });

      if (response.ok) {
        // Redirect to builder
        router.push(`/dashboard/builder?profile=${profileId}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to install template');
      }
    } catch (error) {
      console.error('Error installing template:', error);
      alert('Failed to install template');
    }
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/favorite`, {
        method: 'POST',
      });

      if (response.ok) {
        // Reload templates to update favorite status
        loadTemplates();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Template Marketplace
          </h1>
          <p className="text-gray-400 mt-1">
            Beautiful, ready-to-use profile templates for your link-in-bio
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassPanel className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <GlassButton
            variant={selectedCategory === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </GlassButton>
          {categories.map((category) => (
            <GlassButton
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.display_name}
            </GlassButton>
          ))}
        </div>

        {/* Price Filter */}
        <div className="flex gap-2">
          <GlassButton
            variant={priceFilter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPriceFilter('all')}
          >
            All
          </GlassButton>
          <GlassButton
            variant={priceFilter === 'free' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPriceFilter('free')}
          >
            Free
          </GlassButton>
          <GlassButton
            variant={priceFilter === 'premium' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPriceFilter('premium')}
          >
            <Crown className="w-4 h-4 mr-1" />
            Premium
          </GlassButton>
        </div>
      </GlassPanel>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="h-80 animate-pulse">
              <div className="h-full" />
            </GlassCard>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
          <p className="text-gray-400">
            Try adjusting your filters or search query
          </p>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={handlePreviewTemplate}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setShowPreview(false)}
          onInstall={handleInstallTemplate}
        />
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  onToggleFavorite: (templateId: string) => void;
}

function TemplateCard({ template, onPreview, onToggleFavorite }: TemplateCardProps) {
  return (
    <GlassCard className="group overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
      {/* Preview Image */}
      <div
        className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden"
        onClick={() => onPreview(template)}
      >
        {template.preview_image_url ? (
          <img
            src={template.preview_image_url}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-16 h-16 text-white/20" />
          </div>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <GlassButton size="sm" onClick={() => onPreview(template)}>
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </GlassButton>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {template.featured && (
            <GlassBadge variant="warning" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Featured
            </GlassBadge>
          )}
          {template.is_premium && (
            <GlassBadge variant="primary" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </GlassBadge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">
            {template.description || 'No description'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {template.installs_count.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            {template.rating_average.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-pink-500" />
            {template.favorites_count}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <GlassButton
            size="sm"
            variant="primary"
            className="flex-1"
            onClick={() => onPreview(template)}
          >
            Use Template
          </GlassButton>
          <GlassButton
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(template.id);
            }}
          >
            <Heart className="w-4 h-4" />
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}
