/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import DomEventObserver from '../engine/view/observer/domeventobserver.js';

/**
 * A hack to disable rendering when composition takes place.
 *
 * @memberOf typing
 * @extends core.Feature
 */
export default class NoRenderDuringComposition extends Feature {
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( CompositionObserver );

		const originalRender = editingView.renderer.render;

		editingView.renderer.render = function() {
			if ( editingView.isComposing ) {
				console.log( 'Rendering aborted...' ); // jshint ignore:line

				return;
			}

			console.log( 'Rendering...' ); // jshint ignore:line

			originalRender.call( this );
		};
	}
}

class CompositionObserver extends DomEventObserver {
	/**
	 * @inheritDoc
	 */
	get domEventType() {
		return [ 'compositionstart', 'compositionend' ];
	}

	/**
	 * @inheritDoc
	 */
	onDomEvent( domEvt ) {
		const doc = this.document;

		this.fire( domEvt.type, domEvt );

		doc.isComposing = ( domEvt.type == 'compositionstart' );

		console.log( 'isComposing: ', doc.isComposing ); // jshint ignore:line

		// Re-render content right after we finished composition.
		if ( !doc.isComposing ) {
			doc.renderer.render();
		}
	}
}
