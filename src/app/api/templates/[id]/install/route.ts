import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { applyTemplateToProfile } from '@/lib/templates/serializer';
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaultTemplates';
import { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/templates/[id]/install
 * Install a template to a user's profile
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profile_id, preserve_personal_info = true } = body;

    if (!profile_id) {
      return NextResponse.json(
        { error: 'Missing required field: profile_id' },
        { status: 400 }
      );
    }

    // Verify user owns the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profile_id)
      .single();

    if (profileError || !profile || profile.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 403 }
      );
    }

    // Get the template
    const defaultTemplate = DEFAULT_TEMPLATES.find(
      (template) => template.id === params.id || template.slug === params.id
    );

    const { data: template, error: templateError } = defaultTemplate
      ? { data: defaultTemplate as any, error: null }
      : await supabase
          .from('templates')
          .select('*')
          .eq('id', params.id)
          .eq('is_active', true)
          .not('published_at', 'is', null)
          .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if template is premium and user has access
    if (template.is_premium && template.required_tier) {
      const { data: user } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', session.user.id)
        .single();

      const tierHierarchy: { [key: string]: number } = {
        free: 0,
        pro: 1,
        business: 2,
      };

      const userTier = tierHierarchy[user?.subscription_tier || 'free'];
      const requiredTier = tierHierarchy[template.required_tier];

      if (userTier < requiredTier) {
        return NextResponse.json(
          {
            error: `This template requires ${template.required_tier} tier or higher`,
          },
          { status: 403 }
        );
      }
    }

    // Apply the template to the profile
    await applyTemplateToProfile(
      template.config,
      profile_id,
      {
        preservePersonalInfo: preserve_personal_info,
        preserveCustomCss: false,
      },
      supabase
    );

    // Record the installation
    if (!defaultTemplate) {
      const { error: installError } = await supabase
        .from('template_installs')
        .insert({
          template_id: params.id,
          user_id: session.user.id,
          profile_id: profile_id,
        })
        .select()
        .single();

      // Ignore conflict errors (user already installed this template to this profile)
      if (installError && installError.code !== '23505') {
        console.error('Install tracking error:', installError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Template installed successfully',
    });
  } catch (error) {
    console.error('Install template error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to install template',
      },
      { status: 500 }
    );
  }
}
