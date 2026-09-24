// Assets Index - Centralized asset management for Aura Gaming Platform

// Import all asset categories
import imageAssets, {
  logos,
  backgrounds,
  icons,
  illustrations,
  avatars,
  flags,
  providers,
  getImageUrl,
  getVipIcon,
  getRiskIcon,
  getStatusIcon,
  getPaymentIcon,
  getGameCategoryIcon,
  getProviderLogo,
  getCountryFlag,
} from './images';

import fontAssets, {
  fontFamilies,
  fontSizes,
  lineHeights,
  letterSpacing,
  typographyPresets,
  loadFont,
  loadAllFonts,
  generateFontFaceCSS,
  getFontStack,
  getFontWeight,
  createFontLoadingHook,
} from './fonts';

import soundAssets, {
  soundCategories,
  audioManager,
  playSound,
  setVolume,
  mute,
  unmute,
  toggleMute,
  useSounds,
  soundPresets,
  playSoundSequence,
  soundSettings,
} from './sounds';

// Re-export all image assets
export {
  logos,
  backgrounds,
  icons,
  illustrations,
  avatars,
  flags,
  providers,
  getImageUrl,
  getVipIcon,
  getRiskIcon,
  getStatusIcon,
  getPaymentIcon,
  getGameCategoryIcon,
  getProviderLogo,
  getCountryFlag,
};

// Re-export all font assets
export {
  fontFamilies,
  fontSizes,
  lineHeights,
  letterSpacing,
  typographyPresets,
  loadFont,
  loadAllFonts,
  generateFontFaceCSS,
  getFontStack,
  getFontWeight,
  createFontLoadingHook,
};

// Re-export all sound assets
export {
  soundCategories,
  audioManager,
  playSound,
  setVolume,
  mute,
  unmute,
  toggleMute,
  useSounds,
  soundPresets,
  playSoundSequence,
  soundSettings,
};

// Asset management utilities
export const assetUtils = {
  // Image utilities
  images: {
    getUrl: getImageUrl,
    getVipIcon,
    getRiskIcon,
    getStatusIcon,
    getPaymentIcon,
    getGameCategoryIcon,
    getProviderLogo,
    getCountryFlag,
    
    // Preload critical images
    preloadImages: async (imagePaths) => {
      const promises = imagePaths.map(path => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = path;
        });
      });
      
      try {
        await Promise.all(promises);
        console.log('Images preloaded successfully');
        return true;
      } catch (error) {
        console.error('Failed to preload images:', error);
        return false;
      }
    },
    
    // Get responsive image URL
    getResponsiveImage: (basePath, size = 'medium') => {
      const sizes = {
        small: '@1x',
        medium: '@2x',
        large: '@3x',
      };
      
      const suffix = sizes[size] || sizes.medium;
      const extension = basePath.split('.').pop();
      const nameWithoutExt = basePath.replace(`.${extension}`, '');
      
      return `${nameWithoutExt}${suffix}.${extension}`;
    },
    
    // Check if image exists
    imageExists: async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    },
  },
  
  // Font utilities
  fonts: {
    loadFont,
    loadAllFonts,
    generateCSS: generateFontFaceCSS,
    getStack: getFontStack,
    getWeight: getFontWeight,
    createHook: createFontLoadingHook,
    
    // Apply typography preset
    applyPreset: (element, presetName) => {
      const preset = typographyPresets[presetName];
      if (!preset || !element) return;
      
      Object.assign(element.style, preset);
    },
    
    // Get font display value for performance
    getFontDisplay: (strategy = 'swap') => {
      const strategies = ['auto', 'block', 'swap', 'fallback', 'optional'];
      return strategies.includes(strategy) ? strategy : 'swap';
    },
    
    // Calculate optimal font size for container
    calculateOptimalFontSize: (text, containerWidth, fontFamily = 'Inter') => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      let fontSize = 16;
      context.font = `${fontSize}px ${fontFamily}`;
      
      while (context.measureText(text).width < containerWidth && fontSize < 72) {
        fontSize++;
        context.font = `${fontSize}px ${fontFamily}`;
      }
      
      return Math.max(12, fontSize - 1);
    },
  },
  
  // Sound utilities
  sounds: {
    play: playSound,
    setVolume,
    mute,
    unmute,
    toggleMute,
    playSequence: playSoundSequence,
    settings: soundSettings,
    
    // Initialize audio with user interaction
    initializeWithUserGesture: async () => {
      if (audioManager.initialized) return true;
      
      try {
        await audioManager.initialize();
        return true;
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        return false;
      }
    },
    
    // Check audio support
    isAudioSupported: () => {
      return !!((window as any).AudioContext || (window as any).webkitAudioContext);
    },
    
    // Get audio format support
    getAudioFormatSupport: () => {
      const audio = document.createElement('audio');
      return {
        mp3: audio.canPlayType('audio/mpeg') !== '',
        ogg: audio.canPlayType('audio/ogg') !== '',
        wav: audio.canPlayType('audio/wav') !== '',
        aac: audio.canPlayType('audio/aac') !== '',
        webm: audio.canPlayType('audio/webm') !== '',
      };
    },
    
    // Create audio sprite for performance
    createAudioSprite: (sounds, onLoad) => {
      // This would combine multiple sounds into a single file
      // For now, return a placeholder implementation
      console.log('Audio sprite creation not implemented yet');
      return null;
    },
  },
  
  // Performance utilities
  performance: {
    // Preload all critical assets
    preloadCriticalAssets: async () => {
      const criticalImages = [
        logos.main,
        logos.icon,
        backgrounds.login,
        backgrounds.dashboard,
      ];
      
      const criticalSounds = [
        'ui.click',
        'ui.success',
        'ui.error',
        'notifications.message',
      ];
      
      try {
        // Preload images
        await assetUtils.images.preloadImages(criticalImages);
        
        // Initialize audio
        await audioManager.initialize();
        
        // Preload critical sounds
        await audioManager.preloadSounds(criticalSounds);
        
        // Load critical fonts
        await loadFont('primary', 'regular');
        await loadFont('primary', 'medium');
        await loadFont('primary', 'bold');
        
        console.log('Critical assets preloaded successfully');
        return true;
      } catch (error) {
        console.error('Failed to preload critical assets:', error);
        return false;
      }
    },
    
    // Lazy load non-critical assets
    lazyLoadAssets: async () => {
      try {
        // Load remaining fonts
        await loadAllFonts();
        
        // Load remaining sounds
        const allSounds = Object.values(soundCategories).flatMap(category =>
          Object.keys(category).map(sound => `${Object.keys(soundCategories).find(key => soundCategories[key] === category)}.${sound}`)
        );
        
        await audioManager.preloadSounds(allSounds);
        
        console.log('Non-critical assets loaded successfully');
        return true;
      } catch (error) {
        console.error('Failed to load non-critical assets:', error);
        return false;
      }
    },
    
    // Monitor asset loading performance
    monitorAssetPerformance: () => {
      if (!window.performance) return undefined;

      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.initiatorType === 'img' || entry.initiatorType === 'font') {
            console.log(`Asset loaded: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      
      return observer;
    },
  },
  
  // Theme utilities
  theme: {
    // Get theme-appropriate assets
    getThemedAsset: (assetName, theme = 'light') => {
      const themedAssets = {
        logo: theme === 'dark' ? logos.white : logos.main,
        logoIcon: theme === 'dark' ? logos.iconWhite : logos.icon,
        logoText: theme === 'dark' ? logos.textWhite : logos.text,
      };
      
      return themedAssets[assetName] || null;
    },
    
    // Apply theme-specific styles
    applyThemeAssets: (theme = 'light') => {
      const root = document.documentElement;
      
      // Update CSS custom properties for themed assets
      root.style.setProperty('--logo-main', `url(${assetUtils.theme.getThemedAsset('logo', theme)})`);
      root.style.setProperty('--logo-icon', `url(${assetUtils.theme.getThemedAsset('logoIcon', theme)})`);
      root.style.setProperty('--logo-text', `url(${assetUtils.theme.getThemedAsset('logoText', theme)})`);
    },
  },
  
  // Accessibility utilities
  accessibility: {
    // Generate alt text for images
    generateAltText: (imagePath, context = '') => {
      const filename = imagePath.split('/').pop().split('.')[0];
      const readable = filename.replace(/[-_]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
      
      return context ? `${readable} ${context}` : readable;
    },
    
    // Check color contrast for text over images
    checkImageContrast: async (imageUrl, textColor = '#000000') => {
      // This would analyze the image and calculate contrast
      // For now, return a placeholder implementation
      console.log('Image contrast checking not implemented yet');
      return { ratio: 4.5, passes: true };
    },
    
    // Provide audio descriptions
    getAudioDescription: (soundPath) => {
      const descriptions = {
        'ui.click': 'Button click sound',
        'ui.success': 'Success notification sound',
        'ui.error': 'Error alert sound',
        'gaming.win': 'Winning sound effect',
        'gaming.jackpot': 'Jackpot celebration sound',
        'notifications.message': 'New message notification',
      };
      
      return descriptions[soundPath] || 'Audio effect';
    },
  },
};

// Asset loading status
export const assetLoadingStatus = {
  images: 'pending',
  fonts: 'pending',
  sounds: 'pending',
  critical: 'pending',
};

// Initialize assets
export const initializeAssets = async (options: any = {}) => {
  const {
    preloadCritical = true,
    lazyLoadNonCritical = true,
    enablePerformanceMonitoring = false,
  } = options;
  
  try {
    if (enablePerformanceMonitoring) {
      assetUtils.performance.monitorAssetPerformance();
    }
    
    if (preloadCritical) {
      assetLoadingStatus.critical = 'loading';
      await assetUtils.performance.preloadCriticalAssets();
      assetLoadingStatus.critical = 'loaded';
    }
    
    if (lazyLoadNonCritical) {
      // Load non-critical assets in the background
      setTimeout(async () => {
        await assetUtils.performance.lazyLoadAssets();
        assetLoadingStatus.images = 'loaded';
        assetLoadingStatus.fonts = 'loaded';
        assetLoadingStatus.sounds = 'loaded';
      }, 1000);
    }
    
    console.log('Asset initialization completed');
    return true;
  } catch (error) {
    console.error('Asset initialization failed:', error);
    assetLoadingStatus.critical = 'error';
    return false;
  }
};

// Default export with all assets and utilities
export default {
  images: imageAssets,
  fonts: fontAssets,
  sounds: soundAssets,
  utils: assetUtils,
  status: assetLoadingStatus,
  initialize: initializeAssets,
}; 