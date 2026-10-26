import React from 'react';

/** Keep Kuroshiro's ruby annotations without rendering arbitrary name markup. */
export function conversionContent(
    value: string,
    mode: string,
): React.ReactNode {
    if (mode !== 'furigana') return value;
    const body = new DOMParser().parseFromString(value, 'text/html').body;
    function render(node: Node, key: number): React.ReactNode {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent;
        if (!(node instanceof Element)) return null;
        const tag = node.tagName.toLowerCase();
        if (tag !== 'ruby' && tag !== 'rt' && tag !== 'rp')
            return node.textContent;
        return React.createElement(
            tag,
            { key },
            [...node.childNodes].map(render),
        );
    }
    return [...body.childNodes].map(render);
}
