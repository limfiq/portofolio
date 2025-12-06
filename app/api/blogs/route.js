import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/config/supabaseClient';

export const dynamic = "force-dynamic";

export async function GET(request) {
  const supabase = createSupabaseServerClient();

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 0;
  const ITEMS_PER_PAGE = 10;

  const { data, error, count } = await supabase
    .from('blogs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { count: totalCount } = await supabase
    .from('blogs')
    .select('id', { count: 'exact', head: true });

  return NextResponse.json({
    blogs: data,
    totalCount: totalCount ?? 0,
  });
}

export async function POST(request) {
  const supabase = createSupabaseServerClient();

  const blogData = await request.json();
  const dataToInsert = { ...blogData, user_id: 1 };

  const { data, error } = await supabase
    .from('blogs')
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
