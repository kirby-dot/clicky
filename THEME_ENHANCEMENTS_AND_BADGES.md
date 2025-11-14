# Theme Enhancements & Profile Badges

This document describes the new theme enhancement features and profile badge system added to Clicky.

## 🎨 Theme Enhancements

### Features Added

#### 1. Theme Import/Export

**Location:** `/dashboard/appearance`

**Functionality:**
- Export any selected theme as a JSON file
- Import theme configurations from JSON files
- Share custom themes between profiles or users

**Usage:**
1. Select a theme you want to export
2. Click the "Export" button in the Themes section
3. Save the JSON file to your computer
4. To import: Click "Import" button and select a theme JSON file
5. The theme will load in the custom theme creator for editing

**Example Theme JSON:**
```json
{
  "name": "My Custom Theme",
  "config": {
    "colors": {
      "primary": "#8B5CF6",
      "secondary": "#A78BFA",
      "background": "#FFFFFF",
      "text": "#1F2937",
      "linkBackground": "#F3F4F6",
      "linkText": "#1F2937"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": "normal",
    "animations": {
      "entrance": true,
      "hover": "lift"
    },
    "borderRadius": "md",
    "linkStyle": "filled",
    "gradient": {
      "enabled": false,
      "type": "linear",
      "direction": "135deg",
      "colors": ["#8B5CF6", "#A78BFA"]
    }
  }
}
```

#### 2. Google Fonts Selector

**Location:** Custom Theme Creator modal

**Features:**
- 15 popular Google Fonts pre-loaded
- Separate font selection for headings and body text
- Real-time preview in live theme preview

**Available Fonts:**
- Inter
- Roboto
- Open Sans
- Lato
- Montserrat
- Poppins
- Raleway
- Nunito
- Playfair Display
- Merriweather
- PT Sans
- Ubuntu
- Work Sans
- Quicksand
- DM Sans

**How to Use:**
1. Open the Custom Theme Creator
2. Scroll to the "Fonts" section
3. Select a font for headings from the dropdown
4. Select a font for body text from the dropdown
5. Preview updates in real-time

#### 3. Gradient Backgrounds

**Location:** Custom Theme Creator modal

**Features:**
- Enable/disable gradient backgrounds
- Two-color gradient support
- Customizable gradient direction
- Supports linear and radial gradients

**How to Use:**
1. Open the Custom Theme Creator
2. Find the "Background Gradient" section
3. Check the "Enable Gradient Background" checkbox
4. Select two colors using the color pickers
5. Gradient applies to profile background

**Theme Config Structure:**
```typescript
interface ThemeConfig {
  // ... other properties
  gradient?: {
    enabled: boolean
    type: 'linear' | 'radial'
    direction?: string // e.g., '135deg', 'to-br'
    colors: string[]   // array of hex colors
  }
}
```

#### 4. Enhanced Color Picker

**Features:**
- Visual color picker with hex input
- Color preview squares
- Six customizable color options:
  - Primary
  - Secondary
  - Background
  - Text
  - Link Background
  - Link Text

---

## 🏆 Profile Badges

### Overview

Profile badges allow users to showcase their identity, achievements, or tier status on their profiles. Badges appear next to the profile title with a custom icon and color.

### Database Schema

**Migration File:** `migrations/012_profile_badges.sql`

**Badges Table:**
- `id` - UUID primary key
- `name` - Unique identifier (e.g., 'verified', 'pro')
- `display_name` - Display text (e.g., 'Verified', 'Pro')
- `description` - Optional description
- `icon` - Lucide React icon name
- `color` - Hex color code
- `type` - Badge category (verification, tier, industry, custom)
- `required_tier` - Required subscription tier (optional)
- `is_active` - Whether badge is available
- `position` - Sort order

**Profiles Table Update:**
- Added `badge_id` column (nullable, references badges table)

### Default Badges

#### Verification Badges
- **Verified** - Blue checkmark (BadgeCheck icon)
- **Official** - Purple shield (ShieldCheck icon)

#### Tier Badges
- **Pro** - Gold star (requires Pro tier)
- **Business** - Red crown (requires Business tier)

#### Industry Badges (15 total)
- Creator (Pink, Video icon)
- Artist (Purple, Palette icon)
- Developer (Green, Code2 icon)
- Musician (Orange, Music icon)
- Photographer (Cyan, Camera icon)
- Writer (Indigo, PenTool icon)
- Podcaster (Red, Mic2 icon)
- Streamer (Purple, Radio icon)
- Entrepreneur (Amber, Briefcase icon)
- Educator (Blue, GraduationCap icon)
- Coach (Teal, Award icon)

### Badge Selector UI

**Location:** `/dashboard/appearance`

**Features:**
- Visual grid of available badges
- Icon and color preview
- Tooltip with badge description
- "No Badge" option
- Selected badge highlighted with ring

**How to Use:**
1. Go to Dashboard → Appearance
2. Scroll to "Profile Badge" section
3. Click on any badge to select it
4. Click "No Badge" to remove badge
5. Click "Save changes" at the top

### Badge Display

**Locations:**
- Public profile pages (`/[username]`)
- Profile with modules
- Profile with links (legacy)

**Visual Style:**
- Appears next to profile title
- Icon + badge name
- Colored border and background
- Shadow effect
- Responsive sizing

**Example:**
```tsx
<div className="flex items-center gap-3">
  <h1>John Doe</h1>
  <Badge icon="BadgeCheck" color="#3B82F6">Verified</Badge>
</div>
```

### TypeScript Types

```typescript
export type BadgeType = 'verification' | 'tier' | 'industry' | 'custom'

export interface Badge {
  id: string
  name: string
  display_name: string
  description?: string
  icon: string      // Lucide icon name
  color: string     // Hex color
  type: BadgeType
  required_tier?: 'free' | 'pro' | 'enterprise'
  is_active: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface ProfileWithBadge extends Profile {
  badge?: Badge | null
}
```

---

## 🚀 Implementation Details

### Files Modified

**Theme Enhancements:**
- `src/app/dashboard/appearance/page.tsx` - Added import/export, fonts, gradients
- `src/types/index.ts` - Extended ThemeConfig interface
- `src/types/database.ts` - Updated profiles table type

**Badge System:**
- `migrations/012_profile_badges.sql` - Database schema
- `src/types/index.ts` - Badge types
- `src/types/database.ts` - Badges table & profile badge_id
- `src/app/dashboard/appearance/page.tsx` - Badge selector UI
- `src/components/profile/profile-view.tsx` - Badge display
- `src/components/profile/profile-modules-view.tsx` - Badge display
- `src/app/[username]/page.tsx` - Badge query & props

### Migration Instructions

1. **Apply Database Migration:**
   ```sql
   -- Run in Supabase SQL Editor
   -- Copy and paste content from migrations/012_profile_badges.sql
   ```

2. **Verify Installation:**
   ```sql
   -- Check badges table exists
   SELECT * FROM badges ORDER BY position;

   -- Check profile column added
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'profiles' AND column_name = 'badge_id';
   ```

3. **Test Features:**
   - Go to Dashboard → Appearance
   - Try selecting different badges
   - Create a custom theme with gradient
   - Export and import a theme
   - View profile to see badge displayed

---

## 🎯 Future Enhancements

### Theme Marketplace (Planned)
- Public theme gallery
- User-submitted themes
- Theme ratings and reviews
- One-click theme installation
- Premium themes with advanced features

### Additional Badge Features (Planned)
- Custom badge creation for users
- Badge verification system
- Multiple badges per profile
- Badge achievements/progression
- Animated badges
- Badge marketplace

### Advanced Gradient Options (Planned)
- Three+ color gradients
- Gradient angle picker
- Gradient presets
- Animated gradients
- Gradient patterns (stripes, dots, etc.)

---

## 📚 Related Documentation

- [PRICING.md](./PRICING.md) - Badge tier requirements
- [INTEGRATIONS_AND_AB_TESTING.md](./INTEGRATIONS_AND_AB_TESTING.md) - Integration features
- [README.md](./README.md) - Main project documentation

---

## 🐛 Troubleshooting

### Badge Not Appearing
1. Ensure migration was run successfully
2. Check badge_id is set in profiles table
3. Verify badge exists in badges table
4. Clear browser cache
5. Check if badge is marked as active

### Theme Import Failing
1. Verify JSON format is correct
2. Ensure all required fields are present
3. Check color values are valid hex codes
4. Confirm gradient colors array has 2 elements

### Gradient Not Showing
1. Ensure gradient.enabled is true
2. Check colors array has valid values
3. Verify direction property is set
4. Refresh the page

---

## ✨ Benefits

### For Users
- ✅ Personalized profiles with custom themes
- ✅ Professional appearance with badges
- ✅ Easy theme sharing with import/export
- ✅ Beautiful gradient backgrounds
- ✅ Google Fonts integration

### For Developers
- ✅ Type-safe theme system
- ✅ Extensible badge framework
- ✅ Clean database schema
- ✅ Reusable components
- ✅ Well-documented code

---

Built with ❤️ for Clicky
