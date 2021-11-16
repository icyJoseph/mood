/**
 * Takes in a host Document, cleans up all nodes, and parses
 * an html string. The result is appended to the host Document.
 */
export function injectHTML(host: Document, html: string) {
	/**
	 * This is a slight optimization.
	 *
	 * Assumptions: it is faster to check if there's elements at the beginning
	 * of the document, but it slower to remove them from the beginning,
	 * instead, removing from the end is faster.
	 */
	// while there's a first child
	while (host.body?.firstChild) {
		const last = host.body.lastChild;
		// remove from the last child
		if (last) host.body.removeChild(last);
	}

	/**
	 * Initially used the foreing, top level, document, but to keep
	 * isolation of the parsed html the host document is used instead.
	 */
	const fragment = host.createRange().createContextualFragment(html);

	host.body.appendChild(fragment);
}
