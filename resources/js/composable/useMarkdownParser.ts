import { marked } from 'marked';

export default function useMarkdownParser() {
    const parseTextFromMarkDown = async (mdString: string | Promise<string>): Promise<string> => {
        // Resolve the input if it is a Promise
        const resolvedString: string = typeof mdString === 'string' ? mdString : await mdString;

        // Ensure resolvedString is a string
        if (typeof resolvedString !== 'string') {
            throw new Error('Expected a string input.');
        }

        const htmlString = await marked(resolvedString);
        console.log('=========> HTML before marked js: ', resolvedString);
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

        console.log('====> OUT: ', textList);
        // Join textList with newlines and then remove extra newlines
        const joinedText = textList.join('\n');
        // Replace multiple consecutive newlines with a single newline
        const prettifiedText = joinedText.replace(/\n\s{2,}\n/g, '\n').trim();

        return prettifiedText;
    }



    return { parseTextFromMarkDown }
}
