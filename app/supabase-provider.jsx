'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SupabaseProvider({ children }) {
    const [supabase] = useState(() =>
        createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
        )
    )

    const router = useRouter()

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
            router.refresh()
        })

        return () => subscription.unsubscribe()
    }, [supabase, router])

    return children
}