import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export const dynamic = "force-dynamic";

export async function GET(request) {
  const supabase = await createSupabaseServerClient();

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
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("API Error: Unauthorized", authError);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let blogData;
  try {
    blogData = await request.json();
    console.log("API Received Payload:", blogData);
  } catch (e) {
    console.error("API Error: Failed to parse request body", e);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const dataToInsert = { ...blogData, user_id: user.id };

  const { data, error } = await supabase
    .from('blogs')
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    console.error("API Supabase Insert Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || { success: true });
}
