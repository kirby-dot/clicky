import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createTemplateFromProfile } from '@/lib/templates/serializer';
import { DEFAULT_TEMPLATES } from '@/lib/templates/defaultTemplates';

/**
 * GET /api/templates
 * List all active templates with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    // Build query
    let query = supabase
      .from('templates')
      .select(`
        *,
        category:template_categories(id, name, display_name, icon, color),
        creator:users(username)
      `)
      .eq('is_active', true)
      .not('published_at', 'is', null)
      .order('featured', { ascending: false })
      .order('installs_count', { ascending: false });

    // Filter by category
    const categoryId = searchParams.get('category_id');
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Filter by tag
    const tag = searchParams.get('tag');
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    // Filter by price
    const priceFilter = searchParams.get('price');
    if (priceFilter === 'free') {
      query = query.eq('is_premium', false);
    } else if (priceFilter === 'premium') {
      query = query.eq('is_premium', true);
    }

    // Filter by featured
    const featured = searchParams.get('featured');
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Search by name
    const search = searchParams.get('search');
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    const filteredDefaultTemplates = DEFAULT_TEMPLATES.filter((template) => {
      if (categoryId && template.category_id !== categoryId) return false;
      if (tag && !(template.tags || []).includes(tag)) return false;
      if (priceFilter === 'free' && template.is_premium) return false;
      if (priceFilter === 'premium' && !template.is_premium) return false;
      if (featured === 'true' && !template.featured) return false;

      if (search) {
        const queryText = search.toLowerCase();
        return (
          template.name.toLowerCase().includes(queryText) ||
          (template.description || '').toLowerCase().includes(queryText) ||
          (template.tags || []).some((t) => t.toLowerCase().includes(queryText))
        );
      }

      return true;
    });

    const combinedTemplates = [...(templates || []), ...filteredDefaultTemplates].sort((a, b) => {
      if (a.featured === b.featured) {
        return (b.installs_count || 0) - (a.installs_count || 0);
      }

      return Number(b.featured) - Number(a.featured);
    });

    const paginated = combinedTemplates.slice(from, to + 1);
    const total = combinedTemplates.length;

    return NextResponse.json({
      templates: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new template from a profile
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      profile_id,
      name,
      slug,
      description,
      category_id,
      tags,
      is_premium,
      price,
    } = body;

    // Validate required fields
    if (!profile_id || !name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: profile_id, name, slug' },
        { status: 400 }
      );
    }

    // Verify user owns the profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profile_id)
      .single();

    if (!profile || profile.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 403 }
      );
    }

    // Check if slug is unique
    const { data: existingTemplate } = await supabase
      .from('templates')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template slug already exists' },
        { status: 409 }
      );
    }

    // Create template
    const templateId = await createTemplateFromProfile(
      profile_id,
      {
        name,
        slug,
        description,
        category_id,
        tags,
        is_premium,
        price,
      },
      session.user.id
    );

    return NextResponse.json({
      success: true,
      template_id: templateId,
      message: 'Template created successfully. It will be reviewed before publishing.',
    });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create template' },
      { status: 500 }
    );
  }
}
