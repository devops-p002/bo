// Sound Assets Index - Centralized audio management for Aura Gaming Platform
import React from 'react';

// UI Sound Effects
import clickSound from './ui/click.mp3';
import hoverSound from './ui/hover.mp3';
import successSound from './ui/success.mp3';
import errorSound from './ui/error.mp3';
import warningSound from './ui/warning.mp3';
import notificationSound from './ui/notification.mp3';
import modalOpenSound from './ui/modal-open.mp3';
import modalCloseSound from './ui/modal-close.mp3';
import tabSwitchSound from './ui/tab-switch.mp3';
import buttonPressSound from './ui/button-press.mp3';

// Gaming Sound Effects
import spinSound from './gaming/spin.mp3';
import winSound from './gaming/win.mp3';
import bigWinSound from './gaming/big-win.mp3';
import jackpotSound from './gaming/jackpot.mp3';
import bonusSound from './gaming/bonus.mp3';
import levelUpSound from './gaming/level-up.mp3';
import coinSound from './gaming/coin.mp3';
import cardFlipSound from './gaming/card-flip.mp3';
import diceRollSound from './gaming/dice-roll.mp3';
import slotReelSound from './gaming/slot-reel.mp3';

// Notification Sounds
import messageSound from './notifications/message.mp3';
import alertSound from './notifications/alert.mp3';
import urgentSound from './notifications/urgent.mp3';
import reminderSound from './notifications/reminder.mp3';
import achievementSound from './notifications/achievement.mp3';
import depositSound from './notifications/deposit.mp3';
import withdrawalSound from './notifications/withdrawal.mp3';
import bonusAwardedSound from './notifications/bonus-awarded.mp3';

// Ambient Sounds
import casinoAmbientSound from './ambient/casino-ambient.mp3';
import lobbyAmbientSound from './ambient/lobby-ambient.mp3';
import vipAmbientSound from './ambient/vip-ambient.mp3';
import relaxingAmbientSound from './ambient/relaxing-ambient.mp3';

// System Sounds
import startupSound from './system/startup.mp3';
import shutdownSound from './system/shutdown.mp3';
import connectionSound from './system/connection.mp3';
import disconnectionSound from './system/disconnection.mp3';
import maintenanceSound from './system/maintenance.mp3';

// Sound categories
export const soundCategories = {
  ui: {
    click: clickSound,
    hover: hoverSound,
    success: successSound,
    error: errorSound,
    warning: warningSound,
    notification: notificationSound,
    modalOpen: modalOpenSound,
    modalClose: modalCloseSound,
    tabSwitch: tabSwitchSound,
    buttonPress: buttonPressSound,
  },
  
  gaming: {
    spin: spinSound,
    win: winSound,
    bigWin: bigWinSound,
    jackpot: jackpotSound,
    bonus: bonusSound,
    levelUp: levelUpSound,
    coin: coinSound,
    cardFlip: cardFlipSound,
    diceRoll: diceRollSound,
    slotReel: slotReelSound,
  },
  
  notifications: {
    message: messageSound,
    alert: alertSound,
    urgent: urgentSound,
    reminder: reminderSound,
    achievement: achievementSound,
    deposit: depositSound,
    withdrawal: withdrawalSound,
    bonusAwarded: bonusAwardedSound,
  },
  
  ambient: {
    casino: casinoAmbientSound,
    lobby: lobbyAmbientSound,
    vip: vipAmbientSound,
    relaxing: relaxingAmbientSound,
  },
  
  system: {
    startup: startupSound,
    shutdown: shutdownSound,
    connection: connectionSound,
    disconnection: disconnectionSound,
    maintenance: maintenanceSound,
  },
};

// Audio context and management
class AudioManager {
  audioContext: any;
  sounds: Map<string, any>;
  volumes: Record<string, number>;
  muted: Record<string, boolean>;
  initialized: boolean;

  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.volumes = {
      master: 1.0,
      ui: 0.7,
      gaming: 0.8,
      notifications: 0.9,
      ambient: 0.5,
      system: 0.6,
    };
    this.muted = {
      master: false,
      ui: false,
      gaming: false,
      notifications: false,
      ambient: false,
      system: false,
    };
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create audio context
      this.audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      
      // Preload critical sounds
      await this.preloadSounds([
        'ui.click',
        'ui.success',
        'ui.error',
        'notifications.message',
        'gaming.win',
      ]);

      this.initialized = true;
      console.log('Audio Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Audio Manager:', error);
    }
  }

  async preloadSounds(soundPaths) {
    const promises = soundPaths.map(path => this.loadSound(path));
    await Promise.all(promises);
  }

  async loadSound(soundPath) {
    if (this.sounds.has(soundPath)) {
      return this.sounds.get(soundPath);
    }

    const [category, name] = soundPath.split('.');
    const soundFile = soundCategories[category]?.[name];

    if (!soundFile) {
      console.warn(`Sound not found: ${soundPath}`);
      return null;
    }

    try {
      const response = await fetch(soundFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.sounds.set(soundPath, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound: ${soundPath}`, error);
      return null;
    }
  }

  async playSound(soundPath, options: any = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const [category] = soundPath.split('.');
    
    // Check if category or master is muted
    if (this.muted.master || this.muted[category]) {
      return;
    }

    let audioBuffer = this.sounds.get(soundPath);
    
    if (!audioBuffer) {
      audioBuffer = await this.loadSound(soundPath);
    }

    if (!audioBuffer) {
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      
      // Calculate volume
      const categoryVolume = this.volumes[category] || 1.0;
      const masterVolume = this.volumes.master;
      const optionsVolume = options.volume || 1.0;
      
      gainNode.gain.value = masterVolume * categoryVolume * optionsVolume;

      // Apply options
      if (options.loop) {
        source.loop = true;
      }

      if (options.playbackRate) {
        source.playbackRate.value = options.playbackRate;
      }

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play sound
      source.start(0);

      // Return source for control
      return source;
    } catch (error) {
      console.error(`Failed to play sound: ${soundPath}`, error);
    }
  }

  setVolume(category, volume) {
    this.volumes[category] = Math.max(0, Math.min(1, volume));
  }

  getVolume(category) {
    return this.volumes[category];
  }

  mute(category) {
    this.muted[category] = true;
  }

  unmute(category) {
    this.muted[category] = false;
  }

  toggleMute(category) {
    this.muted[category] = !this.muted[category];
  }

  isMuted(category) {
    return this.muted[category];
  }

  // Convenience methods for common sounds
  playClick() {
    return this.playSound('ui.click');
  }

  playSuccess() {
    return this.playSound('ui.success');
  }

  playError() {
    return this.playSound('ui.error');
  }

  playNotification() {
    return this.playSound('notifications.message');
  }

  playWin(amount = 0) {
    // Play different win sounds based on amount
    if (amount > 1000) {
      return this.playSound('gaming.jackpot');
    } else if (amount > 100) {
      return this.playSound('gaming.bigWin');
    } else {
      return this.playSound('gaming.win');
    }
  }

  playAmbient(type = 'lobby', loop = true) {
    return this.playSound(`ambient.${type}`, { loop, volume: 0.3 });
  }

  stopAllSounds() {
    // This would require keeping track of all playing sources
    // For now, we'll just reset the audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.initialized = false;
    }
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Sound utility functions
export const playSound = (soundPath, options?: any) => {
  return audioManager.playSound(soundPath, options);
};

export const setVolume = (category, volume) => {
  audioManager.setVolume(category, volume);
};

export const mute = (category) => {
  audioManager.mute(category);
};

export const unmute = (category) => {
  audioManager.unmute(category);
};

export const toggleMute = (category) => {
  audioManager.toggleMute(category);
};

// React hook for sound management
export const useSounds = () => {
  const [initialized, setInitialized] = React.useState(audioManager.initialized);
  const [volumes, setVolumes] = React.useState({ ...audioManager.volumes });
  const [muted, setMuted] = React.useState({ ...audioManager.muted });

  React.useEffect(() => {
    const initializeAudio = async () => {
      if (!audioManager.initialized) {
        await audioManager.initialize();
        setInitialized(true);
      }
    };

    initializeAudio();
  }, []);

  const updateVolume = (category, volume) => {
    audioManager.setVolume(category, volume);
    setVolumes({ ...audioManager.volumes });
  };

  const updateMute = (category) => {
    audioManager.toggleMute(category);
    setMuted({ ...audioManager.muted });
  };

  return {
    initialized,
    volumes,
    muted,
    playSound: audioManager.playSound.bind(audioManager),
    setVolume: updateVolume,
    toggleMute: updateMute,
    playClick: audioManager.playClick.bind(audioManager),
    playSuccess: audioManager.playSuccess.bind(audioManager),
    playError: audioManager.playError.bind(audioManager),
    playNotification: audioManager.playNotification.bind(audioManager),
    playWin: audioManager.playWin.bind(audioManager),
    playAmbient: audioManager.playAmbient.bind(audioManager),
  };
};

// Sound presets for common gaming scenarios
export const soundPresets = {
  // Login sequence
  login: [
    { sound: 'system.connection', delay: 0 },
    { sound: 'ui.success', delay: 500 },
  ],

  // Logout sequence
  logout: [
    { sound: 'ui.click', delay: 0 },
    { sound: 'system.disconnection', delay: 300 },
  ],

  // Win sequence
  bigWin: [
    { sound: 'gaming.win', delay: 0 },
    { sound: 'gaming.coin', delay: 200 },
    { sound: 'gaming.coin', delay: 400 },
    { sound: 'gaming.levelUp', delay: 800 },
  ],

  // Bonus sequence
  bonusAwarded: [
    { sound: 'gaming.bonus', delay: 0 },
    { sound: 'notifications.bonusAwarded', delay: 500 },
    { sound: 'gaming.coin', delay: 1000 },
  ],

  // Error sequence
  criticalError: [
    { sound: 'ui.error', delay: 0 },
    { sound: 'notifications.urgent', delay: 300 },
  ],
};

// Play sound sequence
export const playSoundSequence = async (presetName) => {
  const preset = soundPresets[presetName];
  if (!preset) {
    console.warn(`Sound preset not found: ${presetName}`);
    return;
  }

  for (const { sound, delay } of preset) {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    await playSound(sound);
  }
};

// Sound settings for localStorage persistence
export const soundSettings = {
  save: () => {
    const settings = {
      volumes: audioManager.volumes,
      muted: audioManager.muted,
    };
    localStorage.setItem('soundSettings', JSON.stringify(settings));
  },

  load: () => {
    try {
      const settings = JSON.parse(localStorage.getItem('soundSettings') || '{}');
      
      if (settings.volumes) {
        Object.assign(audioManager.volumes, settings.volumes);
      }
      
      if (settings.muted) {
        Object.assign(audioManager.muted, settings.muted);
      }
    } catch (error) {
      console.error('Failed to load sound settings:', error);
    }
  },

  reset: () => {
    audioManager.volumes = {
      master: 1.0,
      ui: 0.7,
      gaming: 0.8,
      notifications: 0.9,
      ambient: 0.5,
      system: 0.6,
    };
    audioManager.muted = {
      master: false,
      ui: false,
      gaming: false,
      notifications: false,
      ambient: false,
      system: false,
    };
    soundSettings.save();
  },
};

// Load settings on module initialization
soundSettings.load();

// Default export
export default {
  categories: soundCategories,
  manager: audioManager,
  utils: {
    playSound,
    setVolume,
    mute,
    unmute,
    toggleMute,
    playSoundSequence,
  },
  presets: soundPresets,
  settings: soundSettings,
}; 