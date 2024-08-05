import { InfinideaParams } from "@/types/infinidea.types";
import axios from "axios";

export default {
    async aiGenerateText(thematic: string) {
        const setting: InfinideaParams = {
            "thematic": thematic,
            "count": 1,
            "tones": [],
            "segments": [],
            "language": "English",
            "engine": "descriptor",
            "preheader": false,
            "examples": "",
            "temperature": 0.85,
            "topK": 0.8,
            "topP": 0.75,
            "restrictionLevel": "unrestricted"
        }

        try {
            return await axios.post('http://budgetdevis.local/kmailing/api/ai/freestyle', setting);
        } catch (error) {
            throw error;
        }
    }
}
