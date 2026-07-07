/**
 * Centralized Formatter Utilities
 * Extract common formatting functions used across components
 */

/**
 * Strip HTML tags and decode HTML entities
 * @param html - HTML string to clean
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string | null | undefined): string => {
    if (!html) return "";
    const cleanTag = html.replace(/<[^>]*>?/gm, '');
    const entities: Record<string, string> = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
    };
    return cleanTag.replace(/&[a-z0-9#]+;/gi, (match) => entities[match] || match);
};

/**
 * Convert Google Drive image ID to accessible URL
 * @param imageIdentifier - Google Drive file ID or full URL
 * @returns Accessible image URL
 */
export const getGoogleDriveImageUrl = (imageIdentifier: string | null | undefined): string => {
    if (!imageIdentifier) {
        return "/placeholder.jpg";
    }
    if (imageIdentifier.startsWith('http')) {
        return imageIdentifier;
    }
    return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
};

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @param format - Format type: 'short', 'long', 'year'
 * @returns Formatted date string
 */
export const formatDate = (
    date: string | Date | null | undefined,
    format: 'short' | 'long' | 'year' = 'short'
): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return '';
    }

    const options: Intl.DateTimeFormatOptions = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        year: { year: 'numeric' },
    }[format];

    return dateObj.toLocaleDateString('id-ID', options);
};

/**
 * Format year range
 * @param startYear - Start year
 * @param endYear - End year
 * @returns Formatted year range
 */
export const formatYearRange = (startYear: number | null, endYear: number | null): string => {
    if (!startYear) return '';
    if (startYear === endYear) return String(startYear);
    return `${startYear} - ${endYear || 'Sekarang'}`;
};

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param length - Max length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, length: number = 100): string => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Convert slug to title case
 * @param slug - Slug string
 * @returns Title case string
 */
export const slugToTitle = (slug: string): string => {
    return slug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Convert title to URL slug
 * @param title - Title string
 * @returns URL slug
 */
export const titleToSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};
