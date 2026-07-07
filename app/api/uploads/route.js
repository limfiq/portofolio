import { createSupabaseServerClient } from '../../../utils/supabase/server';

export const POST = async (req) => {
    try {
        const supabase = await createSupabaseServerClient();
        const form = await req.formData();
        const file = form.get('file');

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .upload(fileName, buffer, { contentType: file.type });

        if (uploadError) {
            console.error('storage.upload error', uploadError);
            return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
        }

        const { data: publicData } = supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .getPublicUrl(fileName);

        return new Response(JSON.stringify({ url: publicData.publicUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('upload route error', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};
