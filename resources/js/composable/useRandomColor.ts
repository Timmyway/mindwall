import { ref } from "vue";

export default function useRandomColor(ui = 'tailwind') {
    const uiEngine = ref(ui);

    const colors = [
        "#FADADD",  // Soft Pastel Pink
        "#E6E6FA",  // Pale Lavender
        "#BDFCC9",  // Mint Green
        "#87CEFA",  // Light Sky Blue
        "#FFFDD0",  // Creamy Beige
        "#B3DFFF",  // Baby Blue
        "#FFDAB9",  // Peach Puff
        "#F08080",  // Light Coral
        "#FFFACD",  // Lemon Chiffon
        "#FFF0F5"   // Lavender Blush
      ];

    const getRandomColor = () => {
        const randomIndex = Math.floor(Math.random() * colors.length)
        switch (uiEngine.value) {
            case 'tailwind':
                return colors[randomIndex];
                break;
            default:
                return colors[randomIndex];
                break;
        }
    }

    return { getRandomColor }
}
