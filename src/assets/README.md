# Assets Structure - Aura Gaming Platform

This directory contains all static assets for the Aura Gaming Platform admin dashboard, organized into three main categories: images, fonts, and sounds.

## 📁 Directory Structure

```
src/assets/
├── images/                 # Image assets
│   ├── logos/             # Brand logos and variations
│   ├── backgrounds/       # Background images
│   ├── icons/             # UI and feature icons
│   │   ├── games/         # Game category icons
│   │   ├── payments/      # Payment method icons
│   │   ├── status/        # Status indicator icons
│   │   ├── vip/           # VIP level icons
│   │   ├── risk/          # Risk level icons
│   │   └── ui/            # General UI icons
│   ├── illustrations/     # SVG illustrations
│   ├── avatars/          # User avatar images
│   ├── flags/            # Country flag icons
│   └── providers/        # Game provider logos
├── fonts/                 # Font files and management
│   ├── inter/            # Primary font family
│   ├── roboto/           # Secondary font family
│   ├── poppins/          # Display font family
│   ├── jetbrains-mono/   # Monospace font family
│   ├── orbitron/         # Gaming font family
│   └── material-icons/   # Icon font files
├── sounds/               # Audio assets
│   ├── ui/               # UI sound effects
│   ├── gaming/           # Gaming sound effects
│   ├── notifications/    # Notification sounds
│   ├── ambient/          # Background ambient sounds
│   └── system/           # System sounds
└── index.js              # Main assets export
```

## 🖼️ Images

### Logos

- **Main Logo**: Primary brand logo for light backgrounds
- **White Logo**: Logo variant for dark backgrounds
- **Icon**: Standalone brand icon
- **Text**: Text-only logo variant

### Backgrounds

- **Login**: Login page background
- **Dashboard**: Dashboard background
- **Casino**: Casino section background
- **Sports**: Sports betting background
- **VIP**: VIP section background
- **Maintenance**: Maintenance mode background

### Icons

Comprehensive icon set covering:

- **Navigation**: Dashboard, members, payments, games, reports, settings
- **Game Categories**: Slots, table games, live casino, sports betting, poker
- **Payment Methods**: Credit card, bank transfer, e-wallet, cryptocurrency
- **Status Indicators**: Active, inactive, suspended, banned, pending, verified
- **VIP Levels**: Bronze, silver, gold, platinum, diamond
- **Risk Levels**: Low, medium, high, critical
- **UI Elements**: Search, filter, export, edit, delete, add, close

### Illustrations

- **Empty State**: No data available
- **Error**: Error page illustration
- **Maintenance**: System maintenance
- **Success**: Success confirmation
- **Loading**: Loading state
- **Unauthorized**: Access denied

### Avatars

- **Default**: Generic user avatar
- **Male/Female**: Gender-specific avatars
- **Admin/Support**: Role-specific avatars

### Flags

Country flags for internationalization:

- US, UK, CA, AU, DE, FR, ES, IT, PT, RU, CN, JP, KR

### Providers

Game provider logos:

- Evolution, NetEnt, Microgaming, Playtech, Pragmatic Play, Red Tiger, Quickspin, Yggdrasil

## 🔤 Fonts

### Font Families

#### Primary - Inter

- **Usage**: Body text, UI elements, general content
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
- **Characteristics**: Modern, clean, highly legible

#### Secondary - Roboto

- **Usage**: Fallback font, alternative body text
- **Weights**: Regular (400), Medium (500), Bold (700)
- **Characteristics**: Widely supported, reliable

#### Display - Poppins

- **Usage**: Headings, titles, emphasis
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
- **Characteristics**: Friendly, approachable, modern

#### Monospace - JetBrains Mono

- **Usage**: Code, numbers, data display, currency
- **Weights**: Regular (400), Medium (500), Bold (700)
- **Characteristics**: Excellent readability, tabular numbers

#### Gaming - Orbitron

- **Usage**: Gaming-specific elements, futuristic feel
- **Weights**: Regular (400), Medium (500), Bold (700), ExtraBold (800)
- **Characteristics**: Sci-fi aesthetic, gaming atmosphere

#### Icons - Material Icons

- **Usage**: Icon font for UI elements
- **Variants**: Filled, Outlined, Round, Sharp
- **Characteristics**: Consistent, scalable, accessible

### Typography Presets

Pre-configured typography styles for common use cases:

- **Headings**: H1-H4 with appropriate sizing and spacing
- **Body Text**: Regular, large, and small variants
- **UI Elements**: Buttons, labels, captions
- **Gaming**: Special gaming title styling
- **Data**: Monospace for numbers and currency

## 🔊 Sounds

### Sound Categories

#### UI Sounds

- **Click**: Button and link interactions
- **Hover**: Hover state feedback
- **Success**: Successful actions
- **Error**: Error notifications
- **Warning**: Warning alerts
- **Modal**: Modal open/close
- **Tab Switch**: Navigation feedback

#### Gaming Sounds

- **Spin**: Slot machine spin
- **Win**: Standard win sound
- **Big Win**: Large win celebration
- **Jackpot**: Jackpot win fanfare
- **Bonus**: Bonus round activation
- **Level Up**: Achievement sound
- **Coin**: Coin collection
- **Card Flip**: Card game sounds
- **Dice Roll**: Dice game sounds

#### Notifications

- **Message**: New message alert
- **Alert**: General alert sound
- **Urgent**: Critical alert
- **Reminder**: Gentle reminder
- **Achievement**: Achievement unlock
- **Deposit**: Deposit confirmation
- **Withdrawal**: Withdrawal notification
- **Bonus Awarded**: Bonus received

#### Ambient

- **Casino**: Casino floor atmosphere
- **Lobby**: Lobby background
- **VIP**: VIP lounge ambiance
- **Relaxing**: Calm background

#### System

- **Startup**: Application start
- **Shutdown**: Application close
- **Connection**: Network connection
- **Disconnection**: Network loss
- **Maintenance**: System maintenance

### Audio Management

- **Volume Control**: Per-category volume settings
- **Mute Options**: Individual category muting
- **Sound Presets**: Pre-configured sound sequences
- **Performance**: Lazy loading and caching
- **Accessibility**: Audio descriptions and alternatives

## 🚀 Usage

### Basic Import

```javascript
import { logos, icons, playSound } from '../assets';

// Use logo
<img src={logos.main} alt="Aura Gaming" />

// Use icon
<img src={icons.dashboard} alt="Dashboard" />

// Play sound
playSound('ui.click');
```

### Advanced Usage

```javascript
import { getVipIcon, getFontStack, audioManager, assetUtils } from "../assets";

// Get VIP-specific icon
const vipIcon = getVipIcon("platinum");

// Get font stack
const primaryFont = getFontStack("primary");

// Initialize audio with user gesture
await assetUtils.sounds.initializeWithUserGesture();

// Preload critical assets
await assetUtils.performance.preloadCriticalAssets();
```

### React Hooks

```javascript
import { useSounds, createFontLoadingHook } from "../assets";

// Sound management hook
const { playClick, setVolume, toggleMute } = useSounds();

// Font loading hook
const fontHook = createFontLoadingHook();
```

## 🎨 Asset Guidelines

### Images

- **Format**: SVG for icons and logos, JPG/WebP for photos
- **Optimization**: Compressed and optimized for web
- **Responsive**: Multiple sizes for different screen densities
- **Accessibility**: Meaningful alt text and descriptions

### Fonts

- **Format**: WOFF2 for modern browsers, WOFF fallback
- **Loading**: Progressive enhancement with font-display: swap
- **Performance**: Critical fonts preloaded, others lazy loaded
- **Fallbacks**: System fonts as fallbacks for each category

### Sounds

- **Format**: MP3 for broad compatibility
- **Quality**: Optimized for file size vs. quality
- **Volume**: Normalized levels across all sounds
- **User Control**: Respect user preferences and accessibility needs

## 🔧 Performance Optimization

### Image Optimization

- Lazy loading for non-critical images
- Responsive images with srcset
- WebP format with fallbacks
- Preloading for critical images

### Font Optimization

- Font subsetting for reduced file sizes
- Progressive font loading
- Font-display: swap for better performance
- Critical font preloading

### Audio Optimization

- Audio sprite creation for multiple sounds
- Lazy loading and caching
- User gesture requirement compliance
- Memory management for audio buffers

## ♿ Accessibility

### Visual Assets

- High contrast ratios for text over images
- Alternative text for all images
- Scalable vector graphics for crisp display
- Color-blind friendly color schemes

### Audio Assets

- Audio descriptions for sound effects
- Visual alternatives for audio feedback
- Respect for reduced motion preferences
- Volume controls and muting options

## 🔄 Asset Management

### Loading Strategy

1. **Critical Assets**: Loaded immediately (logos, primary fonts, essential sounds)
2. **Important Assets**: Loaded after critical assets
3. **Optional Assets**: Loaded on demand or in background

### Caching Strategy

- Browser caching with appropriate headers
- Service worker caching for offline support
- Memory caching for frequently used assets
- Versioning for cache invalidation

### Error Handling

- Graceful fallbacks for missing assets
- Retry mechanisms for failed loads
- User feedback for loading states
- Offline asset availability

## 📱 Responsive Considerations

### Image Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Font Scaling

- Fluid typography with clamp()
- Responsive font sizes
- Appropriate line heights
- Readable text at all sizes

### Audio Considerations

- Mobile data usage awareness
- Battery life considerations
- Touch interaction requirements
- Platform-specific limitations

## 🔐 Security

### Asset Integrity

- Subresource integrity for external assets
- Content Security Policy compliance
- Secure asset delivery (HTTPS)
- Asset validation and sanitization

### Privacy

- No tracking in asset requests
- Local asset storage when possible
- Minimal external dependencies
- User consent for audio features

---

For more information about specific asset categories, see the individual index files in each subdirectory.
