import { supabase } from "@/config/supabaseClient";

/**
 * Increments the view count for a specific page name in Supabase.
 * @param {string} pageName - The name of the page (Home, Publikasi, Proyek, Blog, Aktivitas)
 */
export const trackPageView = async (pageName) => {
    try {
        // We use an RPC call or a direct update. 
        // Since we are using simple update for now:
        // Fetch the current view count using maybeSingle to prevent PGRST116 error if row doesn't exist yet
        const { data, error: fetchError } = await supabase
            .from('page_views')
            .select('view_count')
            .eq('page_name', pageName)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
            // If the row doesn't exist, insert a new record initialized to 1
            const { error: insertError } = await supabase
                .from('page_views')
                .insert({
                    page_name: pageName,
                    view_count: 1,
                    last_updated: new Date().toISOString()
                });
            if (insertError) throw insertError;
        } else {
            // If it exists, increment the count by 1
            const { error: updateError } = await supabase
                .from('page_views')
                .update({ 
                    view_count: (data.view_count || 0) + 1,
                    last_updated: new Date().toISOString()
                })
                .eq('page_name', pageName);

            if (updateError) throw updateError;
        }
    } catch (err) {
        console.error(`Tracker error for ${pageName}:`, err.message);
    }
};
