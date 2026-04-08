// ─────────────────────────────────────────────────────────────────────────────
// SoundManager — All sounds synthesized via Web Audio API.  Zero audio files.
// ─────────────────────────────────────────────────────────────────────────────
export class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterGain = null;
        this.musicGain = null;
        this.musicNodes = [];
        this._musicTimer = null;
        this._musicPlaying = false;
        this.sfxVolume = 1.0;
        this.baseMasterVol = 0.30;
        this._voices = [];
        this._initOnGesture();
    }

    // ── Bootstrap (autoplay-policy safe) ───────────────────────────
    _initOnGesture() {
        const init = () => {
            if (this.ctx) return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.baseMasterVol * this.sfxVolume;
            this.masterGain.connect(this.ctx.destination);
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.06; // Very quiet background
            this.musicGain.connect(this.masterGain);
            this._loadSpeechVoices();
            console.log('🔊 SoundManager initialised');
        };
        ['click', 'keydown', 'touchstart'].forEach(ev =>
            window.addEventListener(ev, init, { once: false })
        );
    }

    _ok() { return this.ctx && !this.muted; }

    _loadSpeechVoices() {
        if (!('speechSynthesis' in window)) return;
        const load = () => {
            this._voices = window.speechSynthesis.getVoices();
        };
        load();
        window.speechSynthesis.onvoiceschanged = load;
    }

    _pickVoice(preferred = 'default') {
        if (!this._voices || this._voices.length === 0) return null;
        const englishVoices = this._voices.filter(voice => /en/i.test(voice.lang || ''));
        const pool = englishVoices.length > 0 ? englishVoices : this._voices;
        const naturalVoices = pool.filter(voice => voice.localService || /natural|neural|premium|enhanced|google|microsoft/i.test(voice.name));
        const preferredPool = naturalVoices.length > 0 ? naturalVoices : pool;
        const findMatch = (patterns, sourcePool = preferredPool) => sourcePool.find(voice => patterns.some(pattern => pattern.test(`${voice.name} ${voice.lang || ''}`)));

        if (preferred === 'old_woman') {
            return findMatch([/female/i, /woman/i, /zira/i, /samantha/i, /victoria/i, /karen/i, /aria/i]) || preferredPool[0];
        }
        if (preferred === 'child') {
            return findMatch([/child/i, /junior/i, /kid/i]) || findMatch([/female/i, /zira/i, /samantha/i, /aria/i]) || preferredPool[0];
        }
        if (preferred === 'old_man' || preferred === 'mature_man') {
            return findMatch([/male/i, /david/i, /mark/i, /george/i, /daniel/i, /guy/i, /tony/i]) || preferredPool[0];
        }
        return preferredPool[0];
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.baseMasterVol * this.sfxVolume;
        if (this.muted && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        return this.muted;
    }

    setMusicVolume(vol) {
        if (this.musicGain) this.musicGain.gain.value = vol * 0.12; 
    }

    setSfxVolume(vol) {
        this.sfxVolume = vol;
        if (this.masterGain && !this.muted) {
            this.masterGain.gain.value = this.baseMasterVol * this.sfxVolume;
        }
    }

    // ── Utility helpers ───────────────────────────────────────────
    _osc(type, freq, start, dur, gainVal = 0.3, dest = null) {
        if (!this._ok()) return null;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.value = gainVal;
        o.connect(g);
        g.connect(dest || this.masterGain);
        o.start(start);
        o.stop(start + dur);
        o.onended = () => { try { g.disconnect(); } catch(e) {} };
        return { osc: o, gain: g };
    }

    _noise(start, dur, gainVal = 0.15, dest = null) {
        if (!this._ok()) return;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const g = this.ctx.createGain();
        g.gain.value = gainVal;
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        src.connect(g);
        g.connect(dest || this.masterGain);
        src.start(start);
        src.stop(start + dur);
    }

    // Filtered noise for more organic sounds
    _filteredNoise(start, dur, filterFreq, filterType, gainVal = 0.1) {
        if (!this._ok()) return;
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;
        filter.Q.value = 5;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(gainVal, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        src.connect(filter);
        filter.connect(g);
        g.connect(this.masterGain);
        src.start(start);
        src.stop(start + dur);
    }

    // ═════════════════════════════════════════════════════════════════
    //  SOUND EFFECTS
    // ═════════════════════════════════════════════════════════════════

    // 1 ── Jump ────────────────────────────────────────────────────
    jump() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(300, t);
        o.frequency.exponentialRampToValueAtTime(600, t + 0.12);
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + 0.15);
    }

    // 2 ── Stomp Enemy ─────────────────────────────────────────────
    stomp() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(200, t);
        o.frequency.exponentialRampToValueAtTime(80, t + 0.1);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + 0.15);
        this._noise(t, 0.05, 0.08);
    }

    // 3 ── Hit Mystery Box ─────────────────────────────────────────
    hitBox() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        this._osc('square', 988, t, 0.06, 0.15);
        this._osc('square', 1319, t + 0.06, 0.08, 0.15);
    }

    // 4 ── Collect Item (ascending arpeggio) ───────────────────────
    collectItem() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
            this._osc('square', f, t + i * 0.08, 0.1, 0.15);
        });
    }

    // 5 ── Ground Pound Impact ─────────────────────────────────────
    groundPound() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(120, t);
        o.frequency.exponentialRampToValueAtTime(30, t + 0.4);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + 0.5);
        this._noise(t, 0.12, 0.2);
    }

    // 6 ── Fireball Shoot ──────────────────────────────────────────
    fireball(power = 1) {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const baseFreq = 400 + power * 100;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(baseFreq, t);
        o.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, t + 0.2);
        g.gain.setValueAtTime(0.12 + power * 0.03, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + 0.25);
        this._noise(t, 0.06, 0.06);
    }

    // 7 ── Fireball Hit ────────────────────────────────────────────
    fireballHit() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        this._noise(t, 0.15, 0.1);
        this._osc('sawtooth', 250, t, 0.06, 0.08);
    }

    // 8 ── Lava Sizzle ─────────────────────────────────────────────
    lavaSizzle() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        this._filteredNoise(t, 0.3, 3000, 'highpass', 0.03);
        this._osc('sawtooth', 80, t, 0.3, 0.02);
    }

    // 9 ── Boss Entrance ───────────────────────────────────────────
    //      Multi-layered organic roar — NOT speech synthesis.
    //      Uses detuned oscillators + FM synthesis + filtered noise
    //      to create living, breathing demonic entrance.
    bossEntrance(bossName = 'GOOMBABA') {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;

        // Phase 1: Earthquake rumble (0.0s – 1.5s)
        // Two detuned sub-bass oscillators for organic rumble
        for (let detune of [-15, 15]) {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(40, t);
            o.frequency.linearRampToValueAtTime(25, t + 1.5);
            o.detune.value = detune;
            g.gain.setValueAtTime(0.2, t);
            g.gain.linearRampToValueAtTime(0.3, t + 0.5);
            g.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
            o.connect(g); g.connect(this.masterGain);
            o.start(t); o.stop(t + 1.8);
        }

        // Phase 2: Demonic "roar" (0.3s – 1.2s)
        // FM synthesis: carrier modulated by LFO for growling texture
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const carrierGain = this.ctx.createGain();

        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(90, t + 0.3);
        carrier.frequency.linearRampToValueAtTime(55, t + 0.8);
        carrier.frequency.linearRampToValueAtTime(70, t + 1.0);
        carrier.frequency.exponentialRampToValueAtTime(35, t + 1.2);

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(8, t + 0.3);  // growl speed
        modulator.frequency.linearRampToValueAtTime(15, t + 0.7);
        modulator.frequency.linearRampToValueAtTime(5, t + 1.2);

        modGain.gain.value = 30; // modulation depth
        carrierGain.gain.setValueAtTime(0.0, t);
        carrierGain.gain.linearRampToValueAtTime(0.25, t + 0.4);
        carrierGain.gain.setValueAtTime(0.25, t + 0.8);
        carrierGain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(carrierGain);
        carrierGain.connect(this.masterGain);

        modulator.start(t + 0.3); modulator.stop(t + 1.3);
        carrier.start(t + 0.3); carrier.stop(t + 1.3);

        // Phase 3: "Syllable" bursts — simulates shouting the name
        // Each burst = short noise + pitched tone, like vocal syllables
        const syllables = bossName.split('');
        const syllableCount = Math.min(syllables.length, 8);
        const burstStart = t + 0.4;
        const burstSpacing = 0.12;

        for (let i = 0; i < syllableCount; i++) {
            const bt = burstStart + i * burstSpacing;
            const pitch = 100 + (i % 3) * 25; // varying pitch per syllable

            // Voiced component
            const so = this.ctx.createOscillator();
            const sg = this.ctx.createGain();
            so.type = 'sawtooth';
            so.frequency.setValueAtTime(pitch, bt);
            so.frequency.exponentialRampToValueAtTime(pitch * 0.7, bt + 0.08);
            sg.gain.setValueAtTime(0.12, bt);
            sg.gain.exponentialRampToValueAtTime(0.001, bt + 0.1);
            so.connect(sg); sg.connect(this.masterGain);
            so.start(bt); so.stop(bt + 0.1);

            // Breath component
            this._filteredNoise(bt, 0.06, 800 + i * 100, 'bandpass', 0.06);
        }

        // Phase 4: "HA HA HA" — deeper laughing bursts
        const laughStart = burstStart + syllableCount * burstSpacing + 0.15;
        for (let i = 0; i < 4; i++) {
            const lt = laughStart + i * 0.18;
            // Each "HA" is a descending pitch burst
            const lo = this.ctx.createOscillator();
            const lg = this.ctx.createGain();
            lo.type = 'sawtooth';
            lo.frequency.setValueAtTime(130 - i * 8, lt);
            lo.frequency.exponentialRampToValueAtTime(60, lt + 0.12);
            lg.gain.setValueAtTime(0.15, lt);
            lg.gain.exponentialRampToValueAtTime(0.001, lt + 0.15);
            lo.connect(lg); lg.connect(this.masterGain);
            lo.start(lt); lo.stop(lt + 0.15);

            // Aspirated noise for the "H" sound
            this._filteredNoise(lt, 0.04, 1500, 'highpass', 0.08);
        }

        // Phase 5: Reverb-like tail (echoing decay)
        for (let i = 1; i <= 3; i++) {
            const echoT = laughStart + 0.8 + i * 0.2;
            const echoVol = 0.06 / i;
            this._osc('sawtooth', 50 + i * 5, echoT, 0.15, echoVol);
        }
    }

    bossVoiceLine(bossName = 'GOOMBABA') {
        if (this.muted || !('speechSynthesis' in window)) return;

        const presets = {
            GOOMBABA: {
                text: 'Goombaba-hahaha, you are in my hell, kid!',
                voice: 'old_woman',
                rate: 0.9,
                pitch: 0.92,
                volume: 0.95
            },
            BOMBA: {
                text: 'Bom-bom-bom, you are done!',
                voice: 'child',
                rate: 1.02,
                pitch: 1.28,
                volume: 0.98
            },
            TURTUMBA: {
                text: 'Turrrr, this is danger, boy. Be wise!',
                voice: 'old_man',
                rate: 0.88,
                pitch: 0.78,
                volume: 0.95
            },
            GOMROG: {
                text: 'Grog-grog, be careful. You will be swallowed!',
                voice: 'mature_man',
                rate: 0.9,
                pitch: 0.74,
                volume: 1.0
            },
            GOMBOTO: {
                text: 'Bzzzt... You will be assimilated! Bzzzt!',
                voice: 'mature_man',
                rate: 0.7,
                pitch: 0.2,
                volume: 1.0
            }
        };

        const preset = presets[bossName];
        if (!preset) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(preset.text);
        utterance.lang = 'en-US';
        utterance.rate = preset.rate;
        utterance.pitch = preset.pitch;
        utterance.volume = preset.volume;
        const voice = this._pickVoice(preset.voice);
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    }

    // 10 ── Boss Hit ───────────────────────────────────────────────
    bossHit() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        // Meaty impact with organic texture
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + 0.2);
        this._noise(t, 0.06, 0.12);
        // Pain grunt — short FM burst
        const po = this.ctx.createOscillator();
        const pg = this.ctx.createGain();
        po.type = 'sawtooth';
        po.frequency.setValueAtTime(120, t + 0.02);
        po.frequency.exponentialRampToValueAtTime(70, t + 0.1);
        pg.gain.setValueAtTime(0.08, t + 0.02);
        pg.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        po.connect(pg); pg.connect(this.masterGain);
        po.start(t + 0.02); po.stop(t + 0.12);
    }

    // 11 ── Boss Defeated ──────────────────────────────────────────
    bossDefeated() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        // Agonized death roar (descending growl)
        const dro = this.ctx.createOscillator();
        const drg = this.ctx.createGain();
        dro.type = 'sawtooth';
        dro.frequency.setValueAtTime(120, t);
        dro.frequency.exponentialRampToValueAtTime(20, t + 1.0);
        drg.gain.setValueAtTime(0.2, t);
        drg.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        dro.connect(drg); drg.connect(this.masterGain);
        dro.start(t); dro.stop(t + 1.0);
        this._filteredNoise(t, 0.5, 400, 'lowpass', 0.1);

        // Then victory fanfare after the death
        const fanfare = [523, 659, 784, 1047, 1319, 1568];
        fanfare.forEach((f, i) => {
            this._osc('square', f, t + 1.1 + i * 0.12, 0.15, 0.15);
        });
        this._osc('triangle', 1047, t + 1.85, 0.6, 0.1);
        this._osc('triangle', 1319, t + 1.85, 0.6, 0.08);
        this._osc('triangle', 1568, t + 1.85, 0.6, 0.06);
    }

    // 12 ── Death ──────────────────────────────────────────────────
    death() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const notes = [494, 440, 370, 330, 262, 196];
        notes.forEach((f, i) => {
            this._osc('square', f, t + i * 0.15, 0.18, 0.15);
        });
    }

    // 13 ── Level Complete ─────────────────────────────────────────
    levelComplete() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const melody = [
            [392, 0.1], [392, 0.1], [392, 0.1], [523, 0.3],
            [494, 0.1], [523, 0.1], [494, 0.1], [523, 0.5],
        ];
        let offset = 0;
        melody.forEach(([f, dur]) => {
            this._osc('square', f, t + offset, dur * 0.9, 0.15);
            offset += dur;
        });
    }

    // 14 ── Transform ──────────────────────────────────────────────
    transform() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(100, t);
        o.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
        o.frequency.exponentialRampToValueAtTime(800, t + 0.7);
        g.gain.setValueAtTime(0.1, t);
        g.gain.setValueAtTime(0.2, t + 0.4);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + 0.8);
        this._noise(t + 0.4, 0.12, 0.08);
        this._osc('square', 1047, t + 0.45, 0.08, 0.1);
    }

    // 15 ── Watch Acquired ─────────────────────────────────────────
    watchAcquired() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        const notes = [440, 554, 659, 880, 1109, 1319];
        notes.forEach((f, i) => {
            this._osc('sine', f, t + i * 0.07, 0.15, 0.15);
            this._osc('triangle', f * 2, t + i * 0.07, 0.08, 0.05);
        });
        this._osc('sine', 1319, t + 0.5, 0.5, 0.08);
    }

    // 16 ── Omnitrix Panel Open ────────────────────────────────────
    //      Faithful to the original Ben 10 rhythm:
    //      - "ka-CHUNK" mechanical pop (faceplate rising)
    //      - Quick ascending "WHEEE" electronic whine
    //      - Two-tone confirmation "BEE-doop"
    //      - Sustained green energy hum
    omnitrixOpen() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;

        // ── Phase 1 (0.00s): Mechanical "ka-CHUNK" ──
        // Sharp transient click — faceplate popping up
        this._noise(t, 0.025, 0.3);
        // The "chunk" — low thud right after
        const chunk = this.ctx.createOscillator();
        const chunkG = this.ctx.createGain();
        chunk.type = 'sine';
        chunk.frequency.setValueAtTime(200, t + 0.02);
        chunk.frequency.exponentialRampToValueAtTime(80, t + 0.08);
        chunkG.gain.setValueAtTime(0.2, t + 0.02);
        chunkG.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        chunk.connect(chunkG); chunkG.connect(this.masterGain);
        chunk.start(t + 0.02); chunk.stop(t + 0.1);

        // ── Phase 2 (0.08s): Fast ascending electronic whine "WHEEEEE" ──
        const whine = this.ctx.createOscillator();
        const whineG = this.ctx.createGain();
        whine.type = 'sawtooth';
        whine.frequency.setValueAtTime(200, t + 0.08);
        whine.frequency.exponentialRampToValueAtTime(1400, t + 0.22); // fast rise
        whine.frequency.setValueAtTime(1400, t + 0.22);
        whine.frequency.exponentialRampToValueAtTime(900, t + 0.30); // slight dip
        whineG.gain.setValueAtTime(0.0, t + 0.08);
        whineG.gain.linearRampToValueAtTime(0.12, t + 0.12);
        whineG.gain.setValueAtTime(0.12, t + 0.22);
        whineG.gain.exponentialRampToValueAtTime(0.02, t + 0.32);
        whineG.gain.exponentialRampToValueAtTime(0.001, t + 0.40);
        whine.connect(whineG); whineG.connect(this.masterGain);
        whine.start(t + 0.08); whine.stop(t + 0.40);

        // ── Phase 3 (0.30s): Two-tone confirmation "BEE-doop" ──
        // High beep
        this._osc('square', 1200, t + 0.30, 0.07, 0.12);
        // Lower "doop"
        this._osc('square', 880, t + 0.38, 0.09, 0.10);

        // ── Phase 4 (0.45s): Green energy sustain hum ──
        const hum = this.ctx.createOscillator();
        const humG = this.ctx.createGain();
        hum.type = 'sine';
        hum.frequency.value = 440;
        humG.gain.setValueAtTime(0, t + 0.45);
        humG.gain.linearRampToValueAtTime(0.06, t + 0.50);
        humG.gain.setValueAtTime(0.06, t + 0.70);
        humG.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        hum.connect(humG); humG.connect(this.masterGain);
        hum.start(t + 0.45); hum.stop(t + 1.0);
        // Harmonic shimmer
        this._osc('triangle', 880, t + 0.50, 0.35, 0.02);
    }

    // 17 ── Omnitrix Panel Close ───────────────────────────────────
    omnitrixClose() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        // Quick descending chirp + click
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(800, t);
        o.frequency.exponentialRampToValueAtTime(200, t + 0.12);
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + 0.15);
        this._noise(t + 0.08, 0.02, 0.15);
    }

    // 18 ── Omnitrix Timeout / Empty Charge ────────────────────────
    omnitrixTimeout() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        // 3 descending warning beeps
        this._osc('square', 880, t, 0.12, 0.15);
        this._osc('square', 660, t + 0.18, 0.12, 0.15);
        this._osc('square', 440, t + 0.36, 0.12, 0.15);
        // Flat power-down buzz
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'square';
        o.frequency.value = 220;
        g.gain.setValueAtTime(0.1, t + 0.55);
        g.gain.linearRampToValueAtTime(0.06, t + 0.8);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        o.connect(g); g.connect(this.masterGain);
        o.start(t + 0.55); o.stop(t + 1.2);
        this._osc('sawtooth', 110, t + 0.6, 0.4, 0.04);
    }

    // 19 ── Goombaba Spawns Baby ───────────────────────────────────
    bossSpawn() {
        if (!this._ok()) return;
        const t = this.ctx.currentTime;
        this._osc('sawtooth', 80, t, 0.12, 0.1);
        this._osc('square', 120, t + 0.04, 0.08, 0.06);
        this._filteredNoise(t, 0.06, 300, 'lowpass', 0.05);
    }

    // ═════════════════════════════════════════════════════════════════
    //  BACKGROUND MUSIC — truly unique per level, properly isolated
    // ═════════════════════════════════════════════════════════════════

    stopMusic() {
        this._musicPlaying = false;
        if (this._musicTimer) {
            clearTimeout(this._musicTimer);
            this._musicTimer = null;
        }
        this.musicNodes.forEach(n => {
            try { n.stop(); } catch (e) {}
        });
        this.musicNodes = [];
    }

    startMusic(levelIndex) {
        this.stopMusic();
        if (!this._ok()) return;
        this._musicPlaying = true;

        if (levelIndex === 1) this._musicLevel1();
        else if (levelIndex === 2) this._musicLevel2();
        else if (levelIndex === 3) this._musicLevel3();
        else if (levelIndex === 4) this._musicLevel4();
        else if (levelIndex === 5) this._musicLevel3(); // Re-use Hell drone for sludge
        else if (levelIndex === 6) this._musicLevel4(); // Re-use Cyberpunk for tech world
    }

    //── Level 1: Bright, bouncy C-major chiptune ──────────────────
    _musicLevel1() {
        const bpm = 150;
        const beat = 60 / bpm;
        // Classic happy Mario-like melody
        const melody = [
            523, 523, 0, 523, 0, 392, 523, 0,   // C C . C . G C .
            659, 0, 0, 330, 0, 0, 0, 0,          // E . . E3 . . . .
            392, 0, 0, 330, 0, 262, 0, 0,         // G . . E3 . C . .
            349, 392, 0, 440, 0, 392, 0, 0,       // F G . A . G . .
        ];
        const bass = [
            131, 0, 131, 0, 165, 0, 165, 0,  // C2 bass pattern
            175, 0, 175, 0, 131, 0, 131, 0,
            131, 0, 131, 0, 165, 0, 165, 0,
            175, 0, 196, 0, 175, 0, 131, 0,
        ];
        const loopDur = melody.length * beat;

        const playLoop = () => {
            if (!this._ok() || !this._musicPlaying) return;
            const now = this.ctx.currentTime;
            // Melody — square wave
            melody.forEach((f, i) => {
                if (f === 0) return;
                const node = this._osc('square', f, now + i * beat, beat * 0.6, 0.04, this.musicGain);
                if (node) this.musicNodes.push(node.osc);
            });
            // Bass — triangle wave
            bass.forEach((f, i) => {
                if (f === 0) return;
                const node = this._osc('triangle', f, now + i * beat, beat * 0.8, 0.06, this.musicGain);
                if (node) this.musicNodes.push(node.osc);
            });
            this._musicTimer = setTimeout(() => playLoop(), loopDur * 1000 - 50);
        };
        playLoop();
    }

    // ── Level 2: Dark, heavy minor-key beat ──────────────────────
    _musicLevel2() {
        const bpm = 110;
        const beat = 60 / bpm;
        // Ominous A minor with chromatic tension
        const melody = [
            220, 0, 262, 0, 247, 0, 220, 0,      // A . C . B . A .
            208, 0, 196, 0, 175, 0, 165, 0,       // Ab . G . F . E .
            220, 262, 330, 262, 220, 0, 0, 0,      // A C E C A . . .
            175, 208, 175, 165, 131, 0, 0, 0,      // F Ab F E C . . .
        ];
        const bass = [
            55, 0, 55, 0, 55, 0, 73, 73,     // A1 deep bass
            65, 0, 65, 0, 58, 0, 55, 0,
            55, 0, 55, 0, 55, 0, 73, 73,
            58, 0, 52, 0, 55, 55, 55, 0,
        ];
        const loopDur = melody.length * beat;

        const playLoop = () => {
            if (!this._ok() || !this._musicPlaying) return;
            const now = this.ctx.currentTime;
            melody.forEach((f, i) => {
                if (f === 0) return;
                const node = this._osc('square', f, now + i * beat, beat * 0.5, 0.04, this.musicGain);
                if (node) this.musicNodes.push(node.osc);
            });
            bass.forEach((f, i) => {
                if (f === 0) return;
                const node = this._osc('sawtooth', f, now + i * beat, beat * 0.7, 0.05, this.musicGain);
                if (node) this.musicNodes.push(node.osc);
            });
            // Percussion hits on beats 0, 4, 8... (kick simulation)
            for (let i = 0; i < melody.length; i += 4) {
                const kickO = this.ctx.createOscillator();
                const kickG = this.ctx.createGain();
                kickO.type = 'sine';
                kickO.frequency.setValueAtTime(100, now + i * beat);
                kickO.frequency.exponentialRampToValueAtTime(30, now + i * beat + 0.1);
                kickG.gain.setValueAtTime(0.06, now + i * beat);
                kickG.gain.exponentialRampToValueAtTime(0.001, now + i * beat + 0.15);
                kickO.connect(kickG); kickG.connect(this.musicGain);
                kickO.start(now + i * beat); kickO.stop(now + i * beat + 0.15);
                this.musicNodes.push(kickO);
            }
            this._musicTimer = setTimeout(() => playLoop(), loopDur * 1000 - 50);
        };
        playLoop();
    }

    // ── Level 3: HELL — slow doom drone, completely different ────
    _musicLevel3() {
        const bpm = 60;
        const beat = 60 / bpm;
        // Low doom metal drone — nothing like levels 1 or 2
        // Whole notes, sub-bass, dissonant intervals
        const drone = [
            41, 41, 41, 41,   // E1 — 4 beats sustain
            39, 39, 39, 39,   // Eb1
            37, 37, 37, 37,   // D1
            35, 35, 37, 39,   // B0 sliding up
        ];
        // Shrieking tritone stabs
        const stab = [
            0, 0, 0, 0, 0, 0, 293, 0,    // (silence) then D4
            0, 0, 0, 0, 0, 0, 277, 0,    // then Db4
            0, 0, 0, 0, 311, 0, 0, 0,    // Eb4
            0, 0, 0, 0, 0, 0, 0, 0,      // silence
        ];
        // We use double-length because slower
        const loopLen = drone.length;
        const loopDur = loopLen * beat;

        const playLoop = () => {
            if (!this._ok() || !this._musicPlaying) return;
            const now = this.ctx.currentTime;
            // Sub-bass drone
            drone.forEach((f, i) => {
                const node = this._osc('sawtooth', f, now + i * beat, beat * 0.95, 0.07, this.musicGain);
                if (node) this.musicNodes.push(node.osc);
                // Second detuned layer for thickness
                const node2 = this._osc('sawtooth', f * 1.005, now + i * beat, beat * 0.95, 0.04, this.musicGain);
                if (node2) this.musicNodes.push(node2.osc);
            });
            // Occasional tritone stabs
            stab.forEach((f, i) => {
                if (f === 0) return;
                const node = this._osc('square', f, now + i * (beat / 2), beat * 0.3, 0.03, this.musicGain);
                if (node) this.musicNodes.push(node.osc);
            });
            // Deep fire crackle noise
            if (this._ok()) {
                const nBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * (loopDur * 0.8), this.ctx.sampleRate);
                const nData = nBuf.getChannelData(0);
                for (let i = 0; i < nData.length; i++) nData[i] = Math.random() * 2 - 1;
                const nSrc = this.ctx.createBufferSource();
                nSrc.buffer = nBuf;
                const nFilter = this.ctx.createBiquadFilter();
                nFilter.type = 'lowpass';
                nFilter.frequency.value = 200;
                const nG = this.ctx.createGain();
                nG.gain.value = 0.015;
                nSrc.connect(nFilter);
                nFilter.connect(nG);
                nG.connect(this.musicGain);
                nSrc.start(now);
                nSrc.stop(now + loopDur * 0.8);
                this.musicNodes.push(nSrc);
            }
            this._musicTimer = setTimeout(() => playLoop(), loopDur * 1000 - 50);
        };
        playLoop();
    }

    // ── Level 4: Cyberpunk / futuristic fast arpeggios ────────────
    _musicLevel4() {
        const bpm = 170;
        const beat = 60 / bpm;
        // Fast electronic arpeggios — E minor, synth wave feel
        const melody = [
            330, 440, 494, 659, 494, 440, 330, 247,   // E A B E5 B A E B3
            330, 392, 494, 587, 494, 392, 330, 294,    // E G B D5 B G E D
            370, 440, 554, 659, 554, 440, 370, 330,    // F# A C# E5 ...
            294, 392, 494, 587, 494, 392, 294, 247,    // D G B D5 ...
        ];
        const bass = [
            82, 0, 82, 0, 110, 0, 110, 0,
            82, 0, 82, 0, 98, 0, 98, 0,
            93, 0, 93, 0, 110, 0, 110, 0,
            73, 0, 73, 0, 98, 0, 82, 0,
        ];
        const loopDur = melody.length * beat;

        const playLoop = () => {
            if (!this._ok() || !this._musicPlaying) return;
            const now = this.ctx.currentTime;
            melody.forEach((f, i) => {
                if (f === 0) return;
                const node = this._osc('square', f, now + i * beat, beat * 0.4, 0.03, this.musicGain);
                if (node) this.musicNodes.push(node.osc);
            });
            bass.forEach((f, i) => {
                if (f === 0) return;
                const node = this._osc('triangle', f, now + i * beat, beat * 0.7, 0.05, this.musicGain);
                if (node) this.musicNodes.push(node.osc);
            });
            // Hi-hat simulation on every beat
            for (let i = 0; i < melody.length; i += 2) {
                this._noise(now + i * beat, 0.03, 0.01);
            }
            this._musicTimer = setTimeout(() => playLoop(), loopDur * 1000 - 50);
        };
        playLoop();
    }
}
