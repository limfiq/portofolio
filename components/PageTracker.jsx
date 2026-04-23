"use client";

import { useEffect } from "react";
import { trackPageView } from "@/utils/tracker";

export default function PageTracker({ name }) {
    useEffect(() => {
        trackPageView(name);
    }, [name]);

    return null;
}
