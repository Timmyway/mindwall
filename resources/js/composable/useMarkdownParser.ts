import { marked } from 'marked';
import MarkdownIt from 'markdown-it';
import { ref } from 'vue';

export default function useMarkdownParser(usePrettify = false) {
    const md = new MarkdownIt({
        html: true, // Enable HTML tags in source
        linkify: true, // Autoconvert URL-like text to links
        typographer: true // Enable smartypants and other typographic replacements
    });
    const markdown = ref(md);
    const htmlRendered = ref();

    const parseTextFromMarkDown = async (mdString: string | Promise<string>): Promise<string> => {
        // Resolve the input if it is a Promise
        const resolvedString: string = typeof mdString === 'string' ? mdString : await mdString;

        // Ensure resolvedString is a string
        if (typeof resolvedString !== 'string') {
            throw new Error('Expected a string input.');
        }

        const htmlString = await marked(resolvedString);

        if (usePrettify) {
            const prettifiedText = prettify(htmlString);
            return prettifiedText;
        }

        return htmlString;
    }

    const mdToHtml = (mdString: string) => {
        htmlRendered.value = markdown.value.render(mdString);
    }

    const resetHtml = () => {
        htmlRendered.value = '';
    }

    const prettify = (htmlString: string) => {
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

    return { htmlRendered, parseTextFromMarkDown, mdToHtml, resetHtml }
}
