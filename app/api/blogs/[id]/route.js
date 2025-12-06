import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function PUT(request, { params }) {
  const { id } = params;
  const blogData = await request.json();

  // The user_id should not be updated, so we remove it from the data.
  delete blogData.user_id;

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .update(blogData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  const { id } = params;

  // First, get the image path to delete it from storage
  const { data: blog } = await supabaseAdmin
    .from('blogs')
    .select('cover_image')
    .eq('id', id)
    .single();

  if (blog && blog.cover_image) {
    const imagePath = blog.cover_image.split('/').pop();
    await supabaseAdmin.storage.from('portfolio-images').remove([`blogs/${imagePath}`]);
  }

  const { error } = await supabaseAdmin
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Blog post deleted successfully' });
}

