import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaultTemplates';

/**
 * GET /api/templates/[id]
 * Get a single template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const defaultTemplate = DEFAULT_TEMPLATES.find(
      (template) => template.id === params.id || template.slug === params.id
    );

    const { data: template, error } = defaultTemplate
      ? { data: defaultTemplate as any, error: null }
      : await supabase
          .from('templates')
          .select(`
        *,
        category:template_categories(id, name, display_name, icon, color),
        creator:users(id, username)
      `)
          .eq('id', params.id)
          .eq('is_active', true)
          .not('published_at', 'is', null)
          .single();

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if user has favorited this template
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let is_favorited = false;
    let user_rating = null;

    if (session) {
      const { data: favorite } = await supabase
        .from('template_favorites')
        .select('id')
        .eq('template_id', params.id)
        .eq('user_id', session.user.id)
        .single();

      is_favorited = !!favorite;

      // Get user's rating if exists
      const { data: rating } = await supabase
        .from('template_ratings')
        .select('rating, review')
        .eq('template_id', params.id)
        .eq('user_id', session.user.id)
        .single();

      user_rating = rating;
    }

    return NextResponse.json({
      ...template,
      is_favorited,
      user_rating,
    });
  } catch (error) {
    console.error('Get template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
