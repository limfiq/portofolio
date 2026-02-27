import { createSupabaseServerClient } from '../../../../utils/supabase/server';

export const POST = async (req) => {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Missing credentials' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
        });

        if (error) {
            // the server client will already set cookies for a successful session
            return new Response(JSON.stringify({ error: error.message }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ user: data.user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('login route error', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
