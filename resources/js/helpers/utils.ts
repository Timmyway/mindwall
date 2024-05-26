function safeJsonParse(jsonString: string): any {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null; // or any other default value you prefer
    }
}

export { safeJsonParse }
