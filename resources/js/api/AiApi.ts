import { TextGeneratorOption, InfinideaParams } from "@/types/infinidea.types";
import axios from "axios";
import { Api } from './Api';

export default {
    async aiGenerateText(thematic: string, iaFeeling = 'cold', options: TextGeneratorOption = {
        base64Image: null,
        engine: 'descriptor',
        language: 'Français',
    }) {
        const { base64Image, engine, language } = options;
        const setting: InfinideaParams = {
            "thematic": thematic,
            "count": 5,
            "tones": [],
            "segments": [],
            "language": language ?? 'English',
            "engine": engine ?? "descriptor",
            "preheader": true,
            "examples": "",
            "temperature": 0.4,
            "topK": 1,
            "topP": 0.3,
            "restrictionLevel": "unrestricted",
        }

        if (base64Image) {
            setting.base64Image = base64Image;
        }

        if (iaFeeling === 'hot') {
            setting.temperature = 2;
            setting.topK = 3;
            setting.topP = 0.9;
        }

        try {
            return await Api.post('api/ai/freestyle', setting);
        } catch (error) {
            throw error;
        }
    }
}
