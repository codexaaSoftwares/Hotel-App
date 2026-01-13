/**
 * Sound utility for POS notifications
 * Plays a simple "tic" sound for cart actions
 */

let audioContext = null
let soundEnabled = true

/**
 * Initialize audio context (required for Web Audio API)
 */
const initAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported:', e)
      return false
    }
  }
  return true
}

/**
 * Play a simple "tic" notification sound
 * Uses Web Audio API to generate a short beep sound
 */
export const playTicSound = () => {
  if (!soundEnabled) return

  if (!initAudioContext()) {
    // Fallback: Try using HTML5 Audio if Web Audio API fails
    playTicSoundFallback()
    return
  }

  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configure sound: short, pleasant "tic" sound
    oscillator.frequency.value = 800 // Higher pitch for "tic"
    oscillator.type = 'sine' // Smooth sine wave

    // Volume envelope: quick attack, quick decay
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01) // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1) // Quick decay

    oscillator.start(now)
    oscillator.stop(now + 0.1) // Very short duration (100ms)
  } catch (e) {
    console.warn('Error playing sound:', e)
    playTicSoundFallback()
  }
}

/**
 * Fallback: Play sound using HTML5 Audio (if audio file exists)
 */
const playTicSoundFallback = () => {
  try {
    // Try to load audio file from assets
    const audio = new Audio('/sounds/tic.mp3')
    audio.volume = 0.3
    audio.play().catch((e) => {
      console.warn('Could not play audio file:', e)
    })
  } catch (e) {
    console.warn('Audio fallback failed:', e)
  }
}

/**
 * Enable/disable sound notifications
 */
export const setSoundEnabled = (enabled) => {
  soundEnabled = enabled
}

/**
 * Check if sound is enabled
 */
export const isSoundEnabled = () => {
  return soundEnabled
}

