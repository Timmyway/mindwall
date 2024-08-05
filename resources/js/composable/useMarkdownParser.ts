import { marked } from 'marked';

export default function useMarkdownParser() {
    const parseTextFromMarkDown = async (mdString: string | Promise<string>): Promise<string> => {
        // Resolve the input if it is a Promise
        const resolvedString = typeof mdString === 'string' ? mdString : await mdString;

        // Ensure resolvedString is a string
        if (typeof resolvedString !== 'string') {
            throw new Error('Expected a string input.');
        }

        const htmlString = marked(resolvedString);
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT);

        const textList: string[] = [];
        let currentNode: Node | null = walker.currentNode;

        while (currentNode) {
            if (currentNode.nodeType === Node.TEXT_NODE) {
                textList.push(currentNode.textContent || '');
            }
            currentNode = walker.nextNode();
        }

        return textList.join('\n');
    }

    return { parseTextFromMarkDown }
}
