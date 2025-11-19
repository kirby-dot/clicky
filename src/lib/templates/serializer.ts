/**
 * Template Serialization & Deserialization
 *
 * Converts profiles to/from template format for the marketplace
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface TemplateConfig {
  version: string; // Schema version for future compatibility
  profile: {
    title: string;
    bio?: string;
    avatar_url?: string;
    custom_css?: string;
    meta_tags?: Record<string, any>;
    style?: Record<string, any>;
    theme_colors?: Record<string, any>;
    badge_name?: string; // Badge name to reference
  };
  theme?: {
    name: string;
    config: Record<string, any>;
  };
  sections: Array<{
    title?: string;
    order: number;
    layout: Record<string, any>;
    style: Record<string, any>;
    modules: Array<{
      type: string;
      title?: string;
      content: Record<string, any>;
      position: number;
      column_index: number;
    }>;
  }>;
  // Legacy links support (for backward compatibility)
  links?: Array<{
    type: string;
    title: string;
    url?: string;
    position: number;
    style?: Record<string, any>;
  }>;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id?: string;
  preview_image_url?: string;
  preview_images?: string[];
  is_premium: boolean;
  price: number;
  required_tier?: string;
  creator_id?: string;
  is_official: boolean;
  is_user_submitted: boolean;
  config: TemplateConfig;
  tags: string[];
  installs_count: number;
  favorites_count: number;
  rating_average: number;
  rating_count: number;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Serialize a profile into a template configuration
 */
export async function serializeProfileToTemplate(
  profileId: string,
  options?: {
    includeAvatar?: boolean;
    includeCustomCss?: boolean;
  }
): Promise<TemplateConfig> {
  const supabase = createClientComponentClient();

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (profileError || !profile) {
    throw new Error('Profile not found');
  }

  // Fetch sections with modules
  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('*')
    .eq('profile_id', profileId)
    .order('order', { ascending: true });

  if (sectionsError) {
    throw new Error('Failed to fetch sections');
  }

  // Fetch all modules for this profile
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .eq('profile_id', profileId)
    .order('position', { ascending: true });

  if (modulesError) {
    throw new Error('Failed to fetch modules');
  }

  // Fetch theme if exists
  let themeData: TemplateConfig['theme'] = undefined;
  if (profile.theme_id) {
    const { data: theme } = await supabase
      .from('themes')
      .select('name, config')
      .eq('id', profile.theme_id)
      .single();

    if (theme) {
      themeData = {
        name: theme.name,
        config: theme.config,
      };
    }
  }

  // Fetch badge name if exists
  let badgeName = undefined;
  if (profile.badge_id) {
    const { data: badge } = await supabase
      .from('badges')
      .select('name')
      .eq('id', profile.badge_id)
      .single();

    if (badge) {
      badgeName = badge.name;
    }
  }

  // Fetch legacy links for backward compatibility
  const { data: links } = await supabase
    .from('links')
    .select('type, title, url, position, style')
    .eq('profile_id', profileId)
    .order('position', { ascending: true });

  // Group modules by section
  const sectionsWithModules = (sections || []).map((section) => {
    const sectionModules = (modules || [])
      .filter((m) => m.section_id === section.id)
      .map((m) => ({
        type: m.type,
        title: m.title,
        content: m.content,
        position: m.position,
        column_index: m.column_index || 0,
      }));

    return {
      title: section.title,
      order: section.order,
      layout: section.layout || {},
      style: section.style || {},
      modules: sectionModules,
    };
  });

  // Build template config
  const config: TemplateConfig = {
    version: '1.0.0',
    profile: {
      title: profile.title,
      bio: profile.bio,
      avatar_url: options?.includeAvatar ? profile.avatar_url : undefined,
      custom_css: options?.includeCustomCss ? profile.custom_css : undefined,
      meta_tags: profile.meta_tags,
      style: profile.style,
      theme_colors: profile.theme_colors,
      badge_name: badgeName,
    },
    theme: themeData,
    sections: sectionsWithModules,
    links: links || [],
  };

  return config;
}

/**
 * Apply a template to a profile
 */
export async function applyTemplateToProfile(
  templateConfig: TemplateConfig,
  profileId: string,
  options?: {
    preservePersonalInfo?: boolean; // Keep existing title, bio, avatar
    preserveCustomCss?: boolean;
  }
): Promise<void> {
  const supabase = createClientComponentClient();

  try {
    // Get existing profile data if we need to preserve info
    let existingProfile = null;
    if (options?.preservePersonalInfo) {
      const { data } = await supabase
        .from('profiles')
        .select('title, bio, avatar_url')
        .eq('id', profileId)
        .single();
      existingProfile = data;
    }

    // Find or create theme if template has one
    let themeId = null;
    if (templateConfig.theme) {
      const { data: existingTheme } = await supabase
        .from('themes')
        .select('id')
        .eq('name', templateConfig.theme.name)
        .single();

      if (existingTheme) {
        themeId = existingTheme.id;
      } else {
        // Create new theme
        const { data: newTheme, error: themeError } = await supabase
          .from('themes')
          .insert({
            name: templateConfig.theme.name,
            config: templateConfig.theme.config,
            is_premium: false,
          })
          .select('id')
          .single();

        if (themeError) throw themeError;
        themeId = newTheme.id;
      }
    }

    // Find badge ID if template has a badge
    let badgeId = null;
    if (templateConfig.profile.badge_name) {
      const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', templateConfig.profile.badge_name)
        .single();

      if (badge) {
        badgeId = badge.id;
      }
    }

    // Update profile with template data
    const profileUpdate: any = {
      title: options?.preservePersonalInfo
        ? existingProfile?.title || templateConfig.profile.title
        : templateConfig.profile.title,
      bio: options?.preservePersonalInfo
        ? existingProfile?.bio || templateConfig.profile.bio
        : templateConfig.profile.bio,
      avatar_url: options?.preservePersonalInfo
        ? existingProfile?.avatar_url || templateConfig.profile.avatar_url
        : templateConfig.profile.avatar_url,
      theme_id: themeId,
      badge_id: badgeId,
      meta_tags: templateConfig.profile.meta_tags,
      style: templateConfig.profile.style,
      theme_colors: templateConfig.profile.theme_colors,
    };

    if (!options?.preserveCustomCss && templateConfig.profile.custom_css) {
      profileUpdate.custom_css = templateConfig.profile.custom_css;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', profileId);

    if (profileError) throw profileError;

    // Delete existing sections and modules
    const { error: deleteModulesError } = await supabase
      .from('modules')
      .delete()
      .eq('profile_id', profileId);

    if (deleteModulesError) throw deleteModulesError;

    const { error: deleteSectionsError } = await supabase
      .from('sections')
      .delete()
      .eq('profile_id', profileId);

    if (deleteSectionsError) throw deleteSectionsError;

    // Delete existing links
    const { error: deleteLinksError } = await supabase
      .from('links')
      .delete()
      .eq('profile_id', profileId);

    if (deleteLinksError) throw deleteLinksError;

    // Create sections and modules from template
    for (const sectionData of templateConfig.sections) {
      // Create section
      const { data: newSection, error: sectionError } = await supabase
        .from('sections')
        .insert({
          profile_id: profileId,
          title: sectionData.title,
          order: sectionData.order,
          layout: sectionData.layout,
          style: sectionData.style,
          active: true,
        })
        .select('id')
        .single();

      if (sectionError) throw sectionError;

      // Create modules for this section
      const modulesData = sectionData.modules.map((module) => ({
        profile_id: profileId,
        section_id: newSection.id,
        type: module.type,
        title: module.title,
        content: module.content,
        position: module.position,
        column_index: module.column_index,
        active: true,
      }));

      if (modulesData.length > 0) {
        const { error: modulesError } = await supabase
          .from('modules')
          .insert(modulesData);

        if (modulesError) throw modulesError;
      }
    }

    // Create legacy links if they exist
    if (templateConfig.links && templateConfig.links.length > 0) {
      const linksData = templateConfig.links.map((link) => ({
        profile_id: profileId,
        type: link.type,
        title: link.title,
        url: link.url,
        position: link.position,
        style: link.style,
        active: true,
      }));

      const { error: linksError } = await supabase
        .from('links')
        .insert(linksData);

      if (linksError) throw linksError;
    }
  } catch (error) {
    console.error('Error applying template:', error);
    throw new Error('Failed to apply template to profile');
  }
}

/**
 * Validate template configuration
 */
export function validateTemplateConfig(config: any): config is TemplateConfig {
  if (!config || typeof config !== 'object') return false;
  if (!config.version || typeof config.version !== 'string') return false;
  if (!config.profile || typeof config.profile !== 'object') return false;
  if (!config.profile.title || typeof config.profile.title !== 'string') return false;
  if (!Array.isArray(config.sections)) return false;

  return true;
}

/**
 * Create a template from a profile
 */
export async function createTemplateFromProfile(
  profileId: string,
  templateData: {
    name: string;
    slug: string;
    description?: string;
    category_id?: string;
    tags?: string[];
    is_premium?: boolean;
    price?: number;
  },
  userId: string
): Promise<string> {
  const supabase = createClientComponentClient();

  // Serialize the profile
  const config = await serializeProfileToTemplate(profileId, {
    includeAvatar: false, // Don't include personal avatar in public templates
    includeCustomCss: true,
  });

  // Create the template
  const { data: template, error } = await supabase
    .from('templates')
    .insert({
      name: templateData.name,
      slug: templateData.slug,
      description: templateData.description,
      category_id: templateData.category_id,
      tags: templateData.tags || [],
      is_premium: templateData.is_premium || false,
      price: templateData.price || 0,
      creator_id: userId,
      is_user_submitted: true,
      is_official: false,
      config,
      is_active: false, // Requires approval
      published_at: null,
    })
    .select('id')
    .single();

  if (error) throw error;

  return template.id;
}
