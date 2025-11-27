import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || 0;
  const ITEMS_PER_PAGE = 10;

  const { data, error, count } = await supabaseAdmin
    .from('blogs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // To get the total count, we need a separate query when using range.
  const { count: totalCount } = await supabaseAdmin
    .from('blogs')
    .select('id', { count: 'exact', head: true });

  return NextResponse.json({ blogs: data, totalCount: totalCount });
}

export async function POST(request) {
  const blogData = await request.json();
  
  // Hardcoding user_id = 1 as in the original component
  const dataToInsert = { ...blogData, user_id: 1 };

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
