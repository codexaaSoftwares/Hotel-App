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
 * Play a success notification sound
 * Uses Web Audio API to generate a pleasant success chime
 */
export const playSuccessSound = () => {
  if (!soundEnabled) return

  if (!initAudioContext()) {
    playSuccessSoundFallback()
    return
  }

  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configure sound: pleasant success chime (two-tone)
    oscillator.frequency.value = 600 // Starting frequency
    oscillator.type = 'sine'

    // Volume envelope: smooth attack and decay
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05) // Smooth attack
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.15) // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3) // Smooth decay

    // Frequency sweep for pleasant chime effect
    oscillator.frequency.setValueAtTime(600, now)
    oscillator.frequency.linearRampToValueAtTime(800, now + 0.15)
    oscillator.frequency.linearRampToValueAtTime(1000, now + 0.3)

    oscillator.start(now)
    oscillator.stop(now + 0.3) // 300ms duration
  } catch (e) {
    console.warn('Error playing success sound:', e)
    playSuccessSoundFallback()
  }
}

/**
 * Fallback: Play success sound using HTML5 Audio
 */
const playSuccessSoundFallback = () => {
  try {
    const audio = new Audio('/sounds/success.mp3')
    audio.volume = 0.4
    audio.play().catch((e) => {
      console.warn('Could not play success audio file:', e)
    })
  } catch (e) {
    console.warn('Success audio fallback failed:', e)
  }
}

/**
 * Play an error notification sound
 * Uses Web Audio API to generate a distinct error beep
 */
export const playErrorSound = () => {
  if (!soundEnabled) return

  if (!initAudioContext()) {
    playErrorSoundFallback()
    return
  }

  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configure sound: distinct error beep (lower pitch, harsher)
    oscillator.frequency.value = 300 // Lower frequency for error
    oscillator.type = 'sawtooth' // Harsher waveform

    // Volume envelope: quick attack, quick decay
    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01) // Quick attack
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1) // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2) // Quick decay

    // Frequency drop for error effect
    oscillator.frequency.setValueAtTime(300, now)
    oscillator.frequency.linearRampToValueAtTime(200, now + 0.2)

    oscillator.start(now)
    oscillator.stop(now + 0.2) // 200ms duration
  } catch (e) {
    console.warn('Error playing error sound:', e)
    playErrorSoundFallback()
  }
}

/**
 * Fallback: Play error sound using HTML5 Audio
 */
const playErrorSoundFallback = () => {
  try {
    const audio = new Audio('/sounds/error.mp3')
    audio.volume = 0.4
    audio.play().catch((e) => {
      console.warn('Could not play error audio file:', e)
    })
  } catch (e) {
    console.warn('Error audio fallback failed:', e)
  }
}

/**
 * Check if sound is enabled
 */
export const isSoundEnabled = () => {
  return soundEnabled
}

