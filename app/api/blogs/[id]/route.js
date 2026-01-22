import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const supabase = await createSupabaseServerClient();
  const { id } = await params;
  const blogData = await request.json();

  // User ID tidak boleh diubah
  delete blogData.user_id;

  const { data, error } = await supabase
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
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  // Cek cover_image dulu
  const { data: blog } = await supabase
    .from('blogs')
    .select('cover_image')
    .eq('id', id)
    .single();

  if (blog?.cover_image) {
    const imagePath = blog.cover_image.split('/').pop();
    await supabase
      .storage
      .from('portfolio-images')
      .remove([`blogs/${imagePath}`]);
  }

  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Blog deleted successfully' });
}
