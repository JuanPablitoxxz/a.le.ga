/**
 * audio.js - Motor de Música Celestial y Efectos Ambientales
 * Implementado enteramente con la Web Audio API nativa.
 * Genera acordes de pads espaciales, armónicos etéreos y chimes de estrellas
 * sin depender de archivos de audio externos (100% confiable y sin problemas de CORS).
 */

class CosmicAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.filter = null;
    this.delayNode = null;
    this.delayFeedback = null;
    
    // Progresión armónica celestial (Frecuencias en Hz)
    // Acordes: Fmaj9 -> Cmaj7 -> Am9 -> Gsus4/G
    this.chordProgressions = [
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
      [130.81, 196.00, 246.94, 329.63, 392.00], // Cmaj7
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
      [146.83, 196.00, 261.63, 293.66, 392.00]  // Gsus4 -> G
    ];
    
    // Escala pentatónica alta para destellos estelares (Star chimes)
    this.starlightNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    
    this.currentChordIndex = 0;
    this.activeOscillators = [];
    this.padTimer = null;
    this.chimeTimer = null;
  }

  init() {
    if (this.ctx) return;
    
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Ganancia Master con rampa suave
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    // Filtro pasa-bajas para un sonido cálido y etéreo
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // Simulación de Delay espacial / Eco
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.45, this.ctx.currentTime);

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.38, this.ctx.currentTime);

    const delayFilter = this.ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    // Conexiones de la red de efectos
    this.delayNode.connect(delayFilter);
    delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    // Rutas de audio
    this.filter.connect(this.masterGain);
    this.filter.connect(this.delayNode);
    this.delayNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;

    // Fade in del Master
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0.28, now + 3);

    // Iniciar ciclo de acordes
    this.playNextChord();
    this.padTimer = setInterval(() => {
      this.playNextChord();
    }, 7000);

    // Iniciar chimes de estrellas aleatorios
    this.scheduleStarChimes();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.padTimer) clearInterval(this.padTimer);
    if (this.chimeTimer) clearTimeout(this.chimeTimer);

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + 1.5);
      
      setTimeout(() => {
        this.stopAllOscillators();
      }, 1600);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  playNextChord() {
    if (!this.isPlaying || !this.ctx) return;

    const chord = this.chordProgressions[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chordProgressions.length;

    const now = this.ctx.currentTime;
    const chordDuration = 7.5;

    // Detener osciladores viejos progresivamente
    this.stopAllOscillators(now + 1.5);

    // Generar voces del pad
    chord.forEach((freq, idx) => {
      // Oscilador cálido (onda sinusoidal suave combinada con triángulo)
      const osc = this.ctx.createOscillator();
      const oscType = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.type = oscType;
      
      // Micro-desafinación (detune) para darle profundidad y anchura estéreo
      const detuneAmount = (idx - 2) * 4.5;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneAmount, now);

      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(0.0001, now);
      // Ataque suave (Attack)
      voiceGain.gain.linearRampToValueAtTime(0.065 / (idx + 1.2), now + 2.2);
      // Decaimiento y liberación (Sustain / Release)
      voiceGain.gain.linearRampToValueAtTime(0.0001, now + chordDuration);

      osc.connect(voiceGain);
      voiceGain.connect(this.filter);

      osc.start(now);
      osc.stop(now + chordDuration + 0.5);

      this.activeOscillators.push({ osc, gain: voiceGain });
    });

    // Modulación sutil del filtro (respiración cósmica)
    const targetFreq = 480 + Math.random() * 320;
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.linearRampToValueAtTime(targetFreq, now + 3.5);
  }

  scheduleStarChimes() {
    if (!this.isPlaying) return;

    const delay = 1200 + Math.random() * 2600;
    this.chimeTimer = setTimeout(() => {
      this.playSingleStarlightChime();
      this.scheduleStarChimes();
    }, delay);
  }

  playSingleStarlightChime() {
    if (!this.isPlaying || !this.ctx) return;

    const note = this.starlightNotes[Math.floor(Math.random() * this.starlightNotes.length)];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, now);

    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.linearRampToValueAtTime(0.045, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(chimeGain);
    chimeGain.connect(this.delayNode);
    chimeGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.0);
  }

  // Efecto especial de sonido para el botón de fuegos artificiales de graduación
  playCelebrationSound() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // Arpegio de triunfo C mayor brillante

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, now + i * 0.08);
      noteGain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 2.5);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 2.6);
    });
  }

  stopAllOscillators(time = 0) {
    const fadeTime = time || (this.ctx ? this.ctx.currentTime : 0);
    this.activeOscillators.forEach(({ osc, gain }) => {
      try {
        if (gain) {
          gain.gain.cancelScheduledValues(fadeTime);
          gain.gain.linearRampToValueAtTime(0.0001, fadeTime + 0.8);
        }
        if (osc) osc.stop(fadeTime + 0.9);
      } catch (e) {
        // Ignorar osciladores ya detenidos
      }
    });
    this.activeOscillators = [];
  }
}

// Instancia global del motor
window.cosmicAudio = new CosmicAudioEngine();
