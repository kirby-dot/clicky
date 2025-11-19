import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DEFAULT_TEMPLATE_CATEGORIES } from '@/lib/templates/defaultTemplates';

export const dynamic = 'force-dynamic';

/**
 * GET /api/templates/categories
 * Get all active template categories
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: categories, error } = await supabase
      .from('template_categories')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    const mergedCategories = [
      ...DEFAULT_TEMPLATE_CATEGORIES,
      ...((categories || []).filter(
        (category) => !DEFAULT_TEMPLATE_CATEGORIES.find((defaultCategory) => defaultCategory.id === category.id)
      )),
    ];

    return NextResponse.json({ categories: mergedCategories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
