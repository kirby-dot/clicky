import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/templates/[id]/rate
 * Rate a template
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

    const body = await request.json();
    const { rating, review } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has already rated this template
    const { data: existingRating } = await supabase
      .from('template_ratings')
      .select('id')
      .eq('template_id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (existingRating) {
      // Update existing rating
      const { error } = await supabase
        .from('template_ratings')
        .update({
          rating,
          review,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRating.id);

      if (error) {
        console.error('Error updating rating:', error);
        return NextResponse.json(
          { error: 'Failed to update rating' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Rating updated successfully',
      });
    } else {
      // Create new rating
      const { error } = await supabase.from('template_ratings').insert({
        template_id: params.id,
        user_id: session.user.id,
        rating,
        review,
      });

      if (error) {
        console.error('Error creating rating:', error);
        return NextResponse.json(
          { error: 'Failed to create rating' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Rating created successfully',
      });
    }
  } catch (error) {
    console.error('Rate template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]/rate
 * Remove a rating
 */
export async function DELETE(
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

    const { error } = await supabase
      .from('template_ratings')
      .delete()
      .eq('template_id', params.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting rating:', error);
      return NextResponse.json(
        { error: 'Failed to delete rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Rating deleted successfully',
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
