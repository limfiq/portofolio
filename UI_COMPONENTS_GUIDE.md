# 🎨 UI Components Quick Reference Guide

**Last Updated:** July 7, 2026  
**Version:** 1.0  

---

## 📦 Available UI Components

### 1. Card Component System
**Location:** `components/ui/Card.jsx`

#### Components
- `<Card>` - Base container
- `<CardImage>` - Image wrapper (h-48 default)
- `<CardContent>` - Main content area with flex grow
- `<CardTitle>` - Heading (lg font, blue hover)
- `<CardDescription>` - Body text (line-clamp-3)
- `<CardFooter>` - Footer with border separator
- `<CardLink>` - Call-to-action link with arrow

#### Example Usage
```jsx
import { Card, CardImage, CardContent, CardTitle, CardDescription, CardFooter, CardLink } from "@/components/ui/Card";
import Image from "next/image";

<Card>
    <CardImage>
        <Image src="/image.jpg" alt="title" fill className="object-cover" />
    </CardImage>
    <CardContent>
        <CardTitle>Blog Post Title</CardTitle>
        <CardDescription>This is the excerpt or description...</CardDescription>
    </CardContent>
    <CardFooter>
        <CardLink href="/blog/slug">Read More <span>&rarr;</span></CardLink>
    </CardFooter>
</Card>
```

#### Styling Features
- ✅ Unified border, shadow, hover effects
- ✅ Dark mode support included
- ✅ Hover: scale image, translate card up, shadow enhancement
- ✅ Responsive: h-48 image on all screens
- ✅ Smooth transitions (300ms)

---

### 2. Button Component
**Location:** `components/ui/Button.jsx`

#### Variants
```
primary     - Blue background, white text (default)
secondary   - Light gray background
outline     - Border only, no fill
ghost       - Text only, subtle hover
link        - Text link style with underline
```

#### Sizes
```
sm  - px-3 py-1.5 text-xs
md  - px-4 py-2 text-sm (default)
lg  - px-6 py-3 text-base
```

#### Props
- `variant` - Button style (default: 'primary')
- `size` - Button size (default: 'md')
- `disabled` - Disabled state
- `isLoading` - Loading state with spinner
- All standard HTML button attributes

#### Example Usage
```jsx
import { Button } from "@/components/ui/Button";

// Primary button
<Button onClick={handleClick}>Click Me</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Link button
<Button variant="link">Visit Link</Button>

// Loading state
<Button isLoading={isLoading}>Saving...</Button>

// Large button
<Button size="lg" variant="primary">Big Button</Button>
```

#### Features
- ✅ Focus ring for accessibility (2px blue ring + offset)
- ✅ Animated loading spinner
- ✅ Scale animation on active
- ✅ Proper disabled state styling
- ✅ Dark mode variants

---

### 3. Badge Component
**Location:** `components/ui/Badge.jsx`

#### Variants
```
default     - Blue background (primary)
secondary   - Gray background
outline     - Border only
success     - Green background
warning     - Amber background
error       - Red background
info        - Cyan background
```

#### Sizes
```
sm  - px-2.5 py-0.5 text-[10px] (default)
md  - px-3 py-1 text-xs
```

#### Example Usage
```jsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning" size="md">Warning</Badge>
<Badge variant="error">Error</Badge>

// With icon
<Badge variant="info" className="flex items-center gap-1">
    <Icon className="w-3 h-3" />
    Badge Text
</Badge>
```

#### Features
- ✅ Semantic color system
- ✅ Uppercase tracking
- ✅ Dark mode support
- ✅ Small and medium sizes
- ✅ Icon-compatible

---

### 4. SectionHeader Component
**Location:** `components/ui/SectionHeader.jsx`

#### Props
- `title` - Main heading (required)
- `label` - Upper label (optional)
- `subtitle` - Description text (optional)
- `centered` - Center alignment (default: true)
- `className` - Additional classes

#### Example Usage
```jsx
import { SectionHeader } from "@/components/ui/SectionHeader";

<SectionHeader
    label="Publications"
    title="Research & Academic Work"
    subtitle="Discover my latest research publications and contributions"
/>

// Left-aligned variant
<SectionHeader
    title="Timeline"
    centered={false}
    className="mb-12"
/>
```

#### Styling
- ✅ Blue label with uppercase tracking
- ✅ Large extrabold heading (text-3xl md:text-4xl)
- ✅ Proper spacing (mb-6 for title)
- ✅ Dark mode text colors
- ✅ Optional center alignment

---

## 🛠️ Utilities Reference
**Location:** `utils/formatters.ts`

### stripHtml(html)
```jsx
import { stripHtml } from "@/utils/formatters";

stripHtml("<p>Hello <b>World</b></p>")
// Returns: "Hello World"

stripHtml("<p>&nbsp;Test&nbsp;</p>")
// Returns: " Test "
```

### getGoogleDriveImageUrl(imageIdentifier)
```jsx
import { getGoogleDriveImageUrl } from "@/utils/formatters";

// Google Drive file ID
getGoogleDriveImageUrl("1ABC123...")
// Returns: "https://drive.google.com/uc?export=view&id=1ABC123..."

// Full URL (pass-through)
getGoogleDriveImageUrl("https://example.com/image.jpg")
// Returns: "https://example.com/image.jpg"

// Null/undefined (fallback)
getGoogleDriveImageUrl(null)
// Returns: "/placeholder.jpg"
```

### formatDate(date, format)
```jsx
import { formatDate } from "@/utils/formatters";

formatDate("2026-07-07", "short")
// Returns: "7 Jul 2026"

formatDate("2026-07-07", "long")
// Returns: "Selasa, 7 Juli 2026"

formatDate("2026-07-07", "year")
// Returns: "2026"
```

### formatYearRange(startYear, endYear)
```jsx
import { formatYearRange } from "@/utils/formatters";

formatYearRange(2020, 2023)
// Returns: "2020 - 2023"

formatYearRange(2023, 2023)
// Returns: "2023"

formatYearRange(2023, null)
// Returns: "2023 - Sekarang"
```

### truncateText(text, length)
```jsx
import { truncateText } from "@/utils/formatters";

truncateText("This is a long text...", 10)
// Returns: "This is a ..."

truncateText("Short", 10)
// Returns: "Short" (no truncation if within length)
```

### slugToTitle(slug)
```jsx
import { slugToTitle } from "@/utils/formatters";

slugToTitle("hello-world-example")
// Returns: "Hello World Example"
```

### titleToSlug(title)
```jsx
import { titleToSlug } from "@/utils/formatters";

titleToSlug("Hello World Example!")
// Returns: "hello-world-example"
```

---

## 🔄 Migration Guide

### Before (Old Pattern)
```jsx
// Old: Inline button styling
<button className="px-4 py-2 rounded-lg font-semibold text-xs bg-blue-600 text-white hover:bg-blue-700 transition-colors">
    Click Me
</button>

// Old: Inline card styling
<div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
    {/* Content */}
</div>

// Old: Local utility functions
const stripHtml = (html) => { /* ... */ }
const getGoogleDriveImageUrl = (url) => { /* ... */ }
```

### After (New Pattern)
```jsx
// New: Button component with variant
<Button variant="primary" size="md">
    Click Me
</Button>

// New: Card component
<Card>
    <CardContent>
        {/* Content */}
    </CardContent>
</Card>

// New: Imported utilities
import { stripHtml, getGoogleDriveImageUrl } from "@/utils/formatters";
```

---

## ✅ Implementation Checklist

### When Creating New Components
- [ ] Import needed UI components instead of inline styling
- [ ] Use utilities from `utils/formatters.ts`
- [ ] Use Button component for all buttons
- [ ] Use Card component for card layouts
- [ ] Use Badge for tags/labels
- [ ] Use SectionHeader for section titles
- [ ] Add dark mode classes (already included in components)
- [ ] Test accessibility (keyboard nav, focus states)
- [ ] Test dark mode toggle
- [ ] Verify responsive design

### Common Patterns

**Blog Post Card:**
```jsx
<Card>
    <CardImage><Image ... /></CardImage>
    <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{truncateText(stripHtml(content))}</CardDescription>
    </CardContent>
    <CardFooter>
        <CardLink href={`/blog/${slug}`}>Read More →</CardLink>
    </CardFooter>
</Card>
```

**Project Card with Badges:**
```jsx
<Card>
    <CardImage><Image ... /></CardImage>
    <CardContent>
        <div className="flex gap-2 mb-3">
            <Badge variant="default">{role}</Badge>
            <Badge variant="secondary">{fundingSource}</Badge>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{stripHtml(description)}</CardDescription>
    </CardContent>
    <CardFooter>
        <CardLink href={`/project/${slug}`}>View Project →</CardLink>
    </CardFooter>
</Card>
```

**Action Section:**
```jsx
<div className="flex gap-4">
    <Button variant="primary" size="lg">Primary Action</Button>
    <Button variant="outline" size="lg">Secondary Action</Button>
    <Button variant="ghost">Link Action</Button>
</div>
```

---

## 🎨 Styling Customization

### Adding Custom Styles
```jsx
// Override default styles
<Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
    {/* Content */}
</Card>

// Add additional classes
<Button className="w-full" variant="primary">
    Full Width Button
</Button>

// Combine with Tailwind utilities
<Badge className="animate-pulse" variant="warning">
    Live
</Badge>
```

### Dark Mode
- All components automatically support dark mode
- Use `dark:` prefix for dark mode specific styles
- Already integrated: text colors, backgrounds, borders

---

## 📚 Additional Resources

- **Design System:** See [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- **Component Refactoring:** See [REFACTORING_PROGRESS.md](../REFACTORING_PROGRESS.md)
- **Full Documentation:** See [docs/](../docs/)

---

## 🐛 Troubleshooting

### Button not showing loader
- Ensure `isLoading` prop is true
- Check if button is disabled
- Verify browser CSS support for animations

### Card shadows not visible
- Check dark mode - shadows may be subtle
- Verify not using `shadow-none` class
- Ensure parent container isn't clipping overflow

### Badge text overlapping
- Use `whitespace-nowrap` for single-line badges
- Consider using `text-xs` instead of `text-[10px]`
- Add more padding for longer text

### Links in CardLink not working
- Verify `href` prop is set correctly
- Check route exists
- Test in both light and dark mode

---

**Document Version:** 1.0  
**Last Updated:** July 7, 2026  
**Components Total:** 4 new + 7 combined (Card sub-components)  
**Utilities Total:** 7 functions in single file
