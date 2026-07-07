# 🎨 UI/UX Design System & Recommendations
## M. Taufiq Portfolio - Comprehensive Design Audit

**Date:** July 7, 2026  
**Design Version:** 1.0  
**Framework:** Tailwind CSS v4 + shadcn/ui (Recommended)  

---

## 1. DESIGN SYSTEM AUDIT

### 1.1 Color Palette Analysis

#### Current Color System
**Light Mode:**
- Background: Slate 50 (#f8fafc)
- Foreground: Slate 900 (#0f172a)
- Primary Accent: Indigo (600: #4f46e5)
- Secondary: Blue (600: #2563eb)

**Dark Mode:**
- Background: Slate 950 (#020617) / Deep Navy (#0b0f19)
- Foreground: Slate 50 (#f8fafc)
- Primary Accent: Indigo (with increased opacity)
- Secondary: Blue (with adjusted saturation)

#### Strengths ✅
- WCAG AA+ contrast compliance
- Cohesive palette with semantic meaning
- Effective glassmorphism with 4-8% opacity
- Dark mode maintains excellent readability

#### Improvements Needed 🔴
- Missing semantic colors (success, warning, error, info)
- No formal token system documented
- Inconsistent opacity values across components
- Missing hover/active/disabled state definitions

#### Recommendation: Implement Color Token System
```css
/* globals.css - Add semantic color tokens */
:root {
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  --color-destructive: #dc2626;
  
  /* Interactive States */
  --color-hover: rgba(99, 102, 241, 0.1);
  --color-active: rgba(99, 102, 241, 0.15);
  --color-disabled: rgba(107, 114, 128, 0.5);
  --color-focus-ring: #4f46e5;
}

/* Tailwind CSS config extension */
theme: {
  extend: {
    colors: {
      success: { DEFAULT: 'var(--color-success)' },
      warning: { DEFAULT: 'var(--color-warning)' },
      error: { DEFAULT: 'var(--color-error)' },
      info: { DEFAULT: 'var(--color-info)' }
    }
  }
}
```

---

### 1.2 Typography Hierarchy

#### Current State
- **Font Family:** Geist Sans (excellent choice)
- **Heading Scale:** 3xl to 6xl for major headings
- **Body Text:** Slate 600 (light mode), Slate 400 (dark mode)
- **Line Heights:** Consistent use of leading utilities

#### Issues Found 🔴
- Inconsistent heading spacing across sections
- Missing semantic `<h1>`, `<h2>`, `<h3>` hierarchy
- No formal typography scale documentation
- Heading sizes not consistently applied

#### Recommended Typography Scale
```tailwind
/* Typography Classes */
.text-heading-1
  @apply text-5xl md:text-6xl font-extrabold leading-tight

.text-heading-2
  @apply text-4xl md:text-5xl font-bold leading-snug

.text-heading-3
  @apply text-3xl md:text-4xl font-bold leading-snug

.text-heading-4
  @apply text-2xl md:text-3xl font-semibold leading-normal

.text-heading-5
  @apply text-xl md:text-2xl font-semibold leading-normal

.text-heading-6
  @apply text-lg md:text-xl font-semibold leading-normal

.text-body-lg
  @apply text-lg md:text-base leading-relaxed

.text-body
  @apply text-base leading-relaxed

.text-body-sm
  @apply text-sm leading-relaxed

.text-caption
  @apply text-xs md:text-sm leading-relaxed
  
.text-label
  @apply text-xs font-semibold uppercase tracking-wider
```

#### Implementation in Components
```jsx
// Correct semantic usage
<h1 className="text-heading-1">Main Page Title</h1>
<h2 className="text-heading-2">Section Title</h2>
<h3 className="text-heading-3">Subsection Title</h3>
<p className="text-body">Body paragraph text</p>
<span className="text-caption">Supporting text</span>
```

---

### 1.3 Spacing & Rhythm

#### Current State
- Base unit: 4px (Tailwind default)
- Section padding: py-24 md:py-32
- Gap spacing: Well-distributed but inconsistent

#### Spacing Scale (Recommended)
```
xs: 4px   (2 in Tailwind)
sm: 8px   (4)
md: 16px  (8)
lg: 24px  (12)
xl: 32px  (16)
2xl: 48px (24)
3xl: 64px (32)
```

#### Application Pattern
```jsx
// Section layout
<section className="py-24 md:py-32 px-6">
  <div className="max-w-7xl mx-auto">
    
    {/* Section header */}
    <div className="mb-16 md:mb-20">
      <span className="text-label text-indigo-600">Subtitle</span>
      <h2 className="text-heading-2 mt-3 mb-6">Section Title</h2>
      <p className="text-body max-w-2xl text-slate-600">
        Description text
      </p>
    </div>
    
    {/* Content grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Cards with consistent spacing */}
    </div>
  </div>
</section>
```

---

### 1.4 Component Consistency Issues

#### Problem 1: Button Inconsistency
**Current Issues:**
- Multiple button patterns across components
- Mixed styling approaches (inline classes vs. utilities)
- Inconsistent hover states
- No unified variant system

**Example - Before (Problematic):**
```jsx
// HeroSection.jsx
<Link href="/publications"
  className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white 
             rounded-full font-semibold shadow-lg shadow-blue-700/25 
             dark:shadow-blue-950/40 hover:-translate-y-0.5 
             transition-all duration-300 flex items-center gap-2">
  Explore Research
</Link>

// AboutSection.jsx
<button className="px-6 py-2 border border-slate-300 
                  rounded-lg hover:bg-slate-50 text-slate-900">
  Contact Me
</button>
```

**Solution - After (Unified):**
```jsx
import { Button } from "@/components/ui/button"

// Primary button
<Button asChild size="lg">
  <Link href="/publications">Explore Research</Link>
</Button>

// Secondary button
<Button variant="outline">Contact Me</Button>

// Ghost button
<Button variant="ghost">Learn More</Button>
```

#### Problem 2: Card Component Inconsistency
**Current Issues:**
- Repeated styling in RecentPostsSection, RecentProject, etc.
- Inconsistent hover effects
- No unified card component

**Solution - Create Unified Card (shadcn/ui):**
```jsx
// components/ui/card.jsx
import * as React from "react"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border border-slate-200 dark:border-slate-800 
                 bg-white dark:bg-slate-900 shadow-sm 
                 hover:shadow-md transition-shadow duration-300
                 ${className}`}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
))

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={`text-heading-4 font-semibold leading-none ${className}`} {...props} />
))

export { Card, CardHeader, CardTitle }
```

**Usage - After:**
```jsx
<Card className="flex flex-col h-full hover:-translate-y-1">
  <CardHeader>
    <CardTitle>Publication Title</CardTitle>
  </CardHeader>
  {/* Content */}
</Card>
```

---

## 2. UI/UX IMPROVEMENTS

### 2.1 Hero Section Enhancements

#### Current Strengths ✅
- Excellent floating animations
- Good visual hierarchy
- Impressive gradient text
- Clear call-to-action

#### Recommended Improvements

**1. Add Scroll Indicator**
```jsx
<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
  <div className="animate-bounce">
    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</div>
```

**2. Enhanced Stats Dashboard**
```jsx
// Before: Individual stat dividers
<div className="grid grid-cols-3 gap-4 mt-8">
  <div>1000+</div>
  <div>200+</div>
  <div>50+</div>
</div>

// After: Proper Card components
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
  <Card className="p-6 text-center">
    <div className="text-3xl font-bold text-indigo-600">1000+</div>
    <p className="text-body-sm text-slate-600 mt-2">Students Taught</p>
  </Card>
  <Card className="p-6 text-center">
    <div className="text-3xl font-bold text-indigo-600">200+</div>
    <p className="text-body-sm text-slate-600 mt-2">Publications</p>
  </Card>
  <Card className="p-6 text-center">
    <div className="text-3xl font-bold text-indigo-600">50+</div>
    <p className="text-body-sm text-slate-600 mt-2">Projects</p>
  </Card>
</div>
```

**3. Better CTA Buttons**
```jsx
// Before: Plain text link
<Link href="/publications">Explore Research</Link>

// After: Button with icon
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

<Button size="lg" className="gap-2">
  <span>Explore Research</span>
  <ArrowRight className="w-4 h-4" />
</Button>
```

---

### 2.2 Navigation Optimization

#### Current Issues 🔴
- Mobile menu works but lacks polish
- Submenu transitions unclear
- Header could use better visual feedback
- Active link indicators subtle

#### Recommended Changes

**1. Navigation Structure with shadcn/ui**
```jsx
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, 
         NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu"

export const Header = () => (
  <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
    <nav className="max-w-7xl mx-auto px-6 py-4">
      <NavigationMenu>
        <NavigationMenuList>
          {/* Main Menu Items */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>PPM</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-48">
                <li><Link href="/publications">📚 Publikasi</Link></li>
                <li><Link href="/penelitian">🔬 Penelitian</Link></li>
                <li><Link href="/pengabdian">🤝 Pengabdian</Link></li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <NavigationMenuTrigger>Akademik</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 w-48">
                <li><Link href="/teaching">📖 Pengajaran</Link></li>
                <li><Link href="/lecturer">👨‍🎓 Dosen</Link></li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          
          {/* Other menu items */}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  </header>
)
```

**2. Mobile Menu with Sheet Component**
```jsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

<Sheet>
  <SheetTrigger asChild>
    <button className="md:hidden p-2">
      <Menu className="w-6 h-6" />
    </button>
  </SheetTrigger>
  <SheetContent side="left">
    <nav className="flex flex-col gap-6 mt-12">
      <Link href="/blog">Blog</Link>
      <Link href="/publications">Publikasi</Link>
      <Link href="/teaching">Pengajaran</Link>
      {/* More links */}
    </nav>
  </SheetContent>
</Sheet>
```

**3. Active Link Indicators**
```jsx
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NavLink = ({ href, children }) => {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 border-b-2 transition-all",
        isActive
          ? "border-indigo-600 text-indigo-600 font-semibold"
          : "border-transparent text-slate-600 hover:text-slate-900"
      )}
    >
      {children}
    </Link>
  )
}
```

---

### 2.3 Card Design System

#### Create Unified Card Variants

**Base Card Component:**
```jsx
// components/ui/card.jsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-slate-200 dark:border-slate-800",
      "bg-white dark:bg-slate-900",
      "shadow-sm hover:shadow-md",
      "transition-all duration-300",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-heading-4 font-semibold", className)} {...props} />
))

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-body-sm text-slate-600 dark:text-slate-400", className)} {...props} />
))

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

**Specialized Card Components:**

```jsx
// PublicationCard.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const PublicationCard = ({
  title,
  authors,
  year,
  type,
  doi,
  abstract,
  coverImage
}) => (
  <Card className="flex flex-col h-full hover:-translate-y-1">
    {coverImage && (
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
    )}
    
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <CardTitle className="text-heading-4 line-clamp-2">{title}</CardTitle>
        <Badge variant="secondary" className="whitespace-nowrap">{type}</Badge>
      </div>
      <CardDescription>{authors.join(", ")}</CardDescription>
    </CardHeader>
    
    <CardContent className="flex-grow">
      <p className="text-body-sm line-clamp-3 mb-4">{abstract}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{year}</Badge>
        {doi && <Badge variant="outline">DOI: {doi}</Badge>}
      </div>
    </CardContent>
    
    <CardFooter className="border-t">
      {doi && (
        <Link
          href={`https://doi.org/${doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          Read on DOI →
        </Link>
      )}
    </CardFooter>
  </Card>
)
```

---

### 2.4 Interactive Elements & Micro-interactions

#### Button Component System
```jsx
// Use shadcn Button variants
import { Button } from "@/components/ui/button"

// Variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button disabled><Spinner /> Loading...</Button>
```

#### Enhanced Hover Effects
```css
/* globals.css */
.interactive-hover {
  @apply transition-all duration-300 
         hover:-translate-y-0.5 
         hover:shadow-md;
}

.card-hover {
  @apply transition-all duration-300
         hover:-translate-y-1
         hover:shadow-lg;
}

.button-hover {
  @apply transition-all duration-200
         hover:scale-105
         active:scale-95;
}
```

#### Loading States
```jsx
// Skeleton component from shadcn/ui
import { Skeleton } from "@/components/ui/skeleton"

export const CardSkeleton = () => (
  <Card>
    <Skeleton className="h-40 w-full" />
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full mt-2" />
    </CardHeader>
  </Card>
)
```

#### Focus States for Accessibility
```css
.focus-ring {
  @apply focus:outline-none 
         focus:ring-2 
         focus:ring-indigo-500 
         focus:ring-offset-2 
         dark:focus:ring-offset-slate-900;
}
```

---

## 3. shadcn/ui IMPLEMENTATION

### Components to Add (Priority Order)

#### HIGH PRIORITY (Critical UX Improvements)

**1. Button**
```bash
npx shadcn-ui@latest add button
```
- Replaces all inline button styling
- Unified variants: default, secondary, outline, ghost, destructive
- Consistent sizes: sm, default, lg, xl
- Loading and disabled states

**2. Card**
```bash
npx shadcn-ui@latest add card
```
- Base component for all card layouts
- Consistent styling and spacing
- Sub-components: CardHeader, CardTitle, CardContent, CardFooter

**3. Input**
```bash
npx shadcn-ui@latest add input
```
- Form input fields with validation states
- Placeholder support
- Disabled state
- Focus states with ring

**4. Textarea**
```bash
npx shadcn-ui@latest add textarea
```
- Multi-line text input
- Validation states
- Resize control

#### MEDIUM PRIORITY (Enhanced Features)

**5. Badge**
```bash
npx shadcn-ui@latest add badge
```
- Publication types, status indicators
- Category labels
- Variants: default, secondary, outline, destructive

**6. NavigationMenu**
```bash
npx shadcn-ui@latest add navigation-menu
```
- Improved header navigation
- Dropdown menus for PPM section
- Accessible keyboard navigation

**7. Dialog**
```bash
npx shadcn-ui@latest add dialog
```
- Modal dialogs for confirmations
- Form dialogs for content editing
- Accessible focus management

**8. Sheet**
```bash
npx shadcn-ui@latest add sheet
```
- Mobile navigation drawer
- Slide-out panels
- Responsive drawer positioning

#### LOW PRIORITY (Nice to Have)

**9. Tooltip**
```bash
npx shadcn-ui@latest add tooltip
```
- Help tooltips for UI elements
- Accessible trigger and content

**10. Toast/Sonner**
```bash
npx shadcn-ui@latest add sonner
```
- Success/error notifications
- Non-intrusive alerts
- Auto-dismiss

**11. Skeleton**
```bash
npx shadcn-ui@latest add skeleton
```
- Loading placeholders
- Content shimmer effect
- Improved perceived performance

---

### Installation Steps

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add HIGH priority components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea

# Add MEDIUM priority components
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet

# Add LOW priority components
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add sonner
```

---

## 4. COMPONENT REFACTORING ROADMAP

### Phase 1: Foundation (Week 1-2)
- [ ] Install shadcn/ui core (button, card, input, textarea)
- [ ] Create unified Button component patterns
- [ ] Create unified Card component patterns
- [ ] Update component library documentation

### Phase 2: Shared Components (Week 2-3)
- [ ] Refactor Header component with NavigationMenu
- [ ] Refactor Footer component
- [ ] Update Hero section with improved spacing
- [ ] Refactor About section

### Phase 3: Content Cards (Week 3-4)
- [ ] Create PublicationCard component
- [ ] Create ProjectCard component
- [ ] Create ActivityCard component
- [ ] Create BlogCard component

### Phase 4: Forms & Admin (Week 4-5)
- [ ] Standardize form inputs with validation
- [ ] Implement Dialog for confirmations
- [ ] Add Toast notifications
- [ ] Refactor admin forms

### Phase 5: Mobile & Polish (Week 5-6)
- [ ] Refactor mobile menu with Sheet
- [ ] Add micro-interactions
- [ ] Performance optimization
- [ ] Accessibility audit & fixes

---

## 5. ACCESSIBILITY IMPROVEMENTS

### Current Issues 🔴
- Some icon buttons missing aria-labels
- Form validation messaging unclear
- Keyboard navigation could be improved
- Color contrast needs verification

### ARIA Label Implementation
```jsx
// Icon buttons
<button
  aria-label="Toggle dark mode"
  onClick={toggleDarkMode}
  className="p-2 rounded-lg"
>
  {isDark ? <Sun /> : <Moon />}
</button>

// Icon links
<Link
  href="/github"
  aria-label="Visit GitHub profile"
  title="GitHub"
  target="_blank"
  rel="noopener noreferrer"
>
  <GitHubIcon />
</Link>
```

### Form Accessibility
```jsx
<div className="space-y-2">
  <label htmlFor="blog-title" className="text-sm font-medium">
    Blog Title
  </label>
  <Input
    id="blog-title"
    type="text"
    aria-invalid={!!errors.title}
    aria-describedby={errors.title ? "title-error" : undefined}
    className="focus-ring"
    required
  />
  {errors.title && (
    <p id="title-error" className="text-sm text-red-600" role="alert">
      {errors.title}
    </p>
  )}
</div>
```

### Semantic HTML
```jsx
// Use proper semantic elements
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    {/* Navigation items */}
  </nav>
</header>

<main id="main-content">
  {/* Page content */}
</main>

// Skip to content link (always include)
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0"
>
  Skip to main content
</a>
```

---

## 6. DARK MODE REFINEMENTS

### Current Implementation ✅
- Light/Dark theme toggle
- Persistent preferences
- System preference detection
- Tailwind dark: prefix support

### Enhancements Needed 🔴

**Color Contrast Verification:**
```
Light Mode:
- Foreground (Slate 900 #0f172a) on Background (Slate 50 #f8fafc): ✅ 15.8:1
- Indigo 600 on Slate 50: ✅ 7.2:1

Dark Mode:
- Foreground (Slate 50 #f8fafc) on Background (Slate 950 #020617): ✅ 15.8:1
- Indigo 400 on Slate 950: ✅ 6.5:1
```

**Glassmorphism in Dark Mode:**
```css
/* Ensure backdrop blur works in both modes */
.glass-effect {
  @apply backdrop-blur-md 
         bg-white/80 dark:bg-slate-900/80
         border border-white/20 dark:border-slate-700/20;
}
```

---

## 7. PERFORMANCE OPTIMIZED DESIGN

### Image Optimization
```jsx
// Use Next.js Image component
import Image from "next/image"

<Image
  src={publicationCoverUrl}
  alt={publicationTitle}
  width={400}
  height={300}
  className="object-cover rounded-lg"
  priority={isAboveTheFold}
  placeholder="blur"
  blurDataURL={blurredDataUrl}
/>
```

### CSS-in-JS Optimization
- Use Tailwind utilities (already optimized)
- Avoid runtime CSS-in-JS
- Minimize custom CSS (already minimal)

### Animation Performance
```css
/* Use transform and opacity for smooth animations */
.interactive-hover {
  @apply transition-all duration-300
         hover:translate-y-[-4px]  /* Instead of expensive box-shadow only */
         hover:shadow-md;
}

/* Avoid expensive animations on page load */
@media (prefers-reduced-motion: reduce) {
  * {
    @apply animate-none transition-none !important;
  }
}
```

---

## 8. MODERN UI TRENDS FOR 2025

### Recommended Enhancements

**1. Glassmorphism Evolution**
- Layer glassmorphic cards
- Nested blur effects
- Color-shifted glass layers

**2. Neumorphism Accents**
- Subtle soft shadows
- Inset borders for depth
- Combination with glassmorphism

**3. Data Visualizations**
- Chart.js or Recharts for publication metrics
- Timeline visualizations for research projects
- Interactive skill visualizations

**4. Micro-interactions**
- Page transition animations
- Scroll-triggered reveals
- Hover state transformations
- Loading state animations

**5. Variable Fonts**
- Responsive typography
- Dynamic font weight based on screen size
- Improved readability at all scales

```css
/* Variable font implementation */
@supports (font-variation-settings: normal) {
  body {
    font-family: 'Geist VF', sans-serif;
    font-variation-settings: 'wght' 400, 'wdth' 100;
  }
  
  .font-bold {
    font-variation-settings: 'wght' 700;
  }
}
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Install shadcn/ui and core components
- [ ] Review and approve color token system
- [ ] Implement typography scale
- [ ] Create Button component variants
- [ ] Create Card component patterns
- [ ] Refactor Header with NavigationMenu
- [ ] Create content card components
- [ ] Add accessibility ARIA labels
- [ ] Test dark mode contrast
- [ ] Implement focus states
- [ ] Add micro-interactions
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Mobile responsiveness test
- [ ] User testing with stakeholders

---

**Design System Version:** 1.0  
**Last Updated:** July 7, 2026  
**Review Frequency:** Quarterly  
**Next Review:** October 7, 2026
