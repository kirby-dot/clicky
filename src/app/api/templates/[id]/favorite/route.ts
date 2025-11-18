import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/templates/[id]/favorite
 * Toggle favorite status for a template
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('template_favorites')
      .select('id')
      .eq('template_id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (existingFavorite) {
      // Remove favorite
      const { error } = await supabase
        .from('template_favorites')
        .delete()
        .eq('id', existingFavorite.id);

      if (error) {
        console.error('Error removing favorite:', error);
        return NextResponse.json(
          { error: 'Failed to remove favorite' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        favorited: false,
      });
    } else {
      // Add favorite
      const { error } = await supabase.from('template_favorites').insert({
        template_id: params.id,
        user_id: session.user.id,
      });

      if (error) {
        console.error('Error adding favorite:', error);
        return NextResponse.json(
          { error: 'Failed to add favorite' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        favorited: true,
      });
    }
  } catch (error) {
    console.error('Favorite template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
