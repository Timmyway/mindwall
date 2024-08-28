    import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';

interface SpeechOptions {
    pitch: number;
    rate: number;
    volume: number;
}

export function useTextToSpeech(lang = 'en') {
    const speechSynthesis = ref(window.speechSynthesis);

    const voices = ref<SpeechSynthesisVoice[]>([]);
    const speechOptions = ref<SpeechOptions>({
        pitch: 1,
        rate: 1,
        volume: 1
    });
    const textToSpeak = ref<string>('');
    const isReading = ref<boolean>(false);
    const voiceLanguage = ref<string>(lang);

    const initializeVoices = () => {
        console.log('-- Voice selected: ', voiceLanguage.value);
        voices.value = speechSynthesis.value.getVoices();
    };

    const setVoiceLanguage = (newLanguage: string = 'en') => {
        voiceLanguage.value = newLanguage;
    }

    const selectedVoice = computed((): SpeechSynthesisVoice | null => {
        // Filter for voices that match the desired language
        const foundVoices = voices.value.filter(voice => voice.lang.startsWith(voiceLanguage.value));
        // Return the first matching voice or the first available voice if none match
        return foundVoices.length > 0 ? foundVoices[0] : voices.value[0] || null;
    });

    const speak = () => {
        if (!speechSynthesis || !selectedVoice.value || !textToSpeak.value) return;
        isReading.value = true;
        console.log(`-- 667 -> Going to speak in "${voiceLanguage.value }"`);
        console.log(`-- 668 -> Read text: "${ textToSpeak.value?.slice(0, 51) }"`);

        const utterance = new SpeechSynthesisUtterance(textToSpeak.value);
        utterance.voice = selectedVoice.value;
        utterance.pitch = speechOptions.value.pitch;
        utterance.rate = speechOptions.value.rate;
        utterance.volume = speechOptions.value.volume;

        isReading.value = true;

        // Handle the end of the speech
        utterance.onend = () => {
            isReading.value = false;
        };

        // Handle errors during speech
        utterance.onerror = () => {
            isReading.value = false;
        };

        speechSynthesis.value.speak(utterance);
        console.log('-------------> After speaking...')
        isReading.value = false;
    };

    onMounted(() => {
        initializeVoices();

        // Ensure voices are populated if they aren't loaded initially
        if (speechSynthesis.value.onvoiceschanged !== undefined) {
        speechSynthesis.value.onvoiceschanged = initializeVoices;
        }
    });

    onUnmounted(() => {
        if (speechSynthesis.value.speaking) {
            console.log('--> Stop speaking...');
            speechSynthesis.value.cancel(); // Cancel any ongoing speech synthesis
            isReading.value = false;
        }
    });

    return {
        voices,
        selectedVoice,
        speechOptions,
        textToSpeak,
        isReading,
        voiceLanguage,
        speak,
        initializeVoices,
        setVoiceLanguage,
    };
}
