/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ChangeBuffer from './changebuffer.js';
import InputObserver from './inputobserver.js';
import Text from '../engine/model/text.js';
import Selection from '../engine/model/selection.js';

/**
 * Handles text input coming from the keyboard or other input methods.
 *
 * @memberOf typing
 * @extends core.Feature
 */
export default class Input extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		/**
		 * Typing's change buffer used to group subsequent changes into batches.
		 *
		 * @protected
		 * @member {typing.ChangeBuffer} typing.Input#_buffer
		 */
		this._buffer = new ChangeBuffer( editor.document, editor.config.get( 'typing.undoStep' ) || 20 );

		// TODO The above default configuration value should be defined using editor.config.define() once it's fixed.

		editingView.addObserver( InputObserver );

		this.listenTo( editingView, 'input', ( evt, data ) => {
			this._handleInput( data );

			// TODO
			// * Handle target ranges so we can work with replacements.
			// * What if I press ctrl+b, accent and then "a"? the result should be bolded, but will it be?
			// * Check IME..

			data.preventDefault();
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this._buffer.destroy();
		this._buffer = null;
	}

	/**
	 * TODO This should be implemented in form of a command.
	 *
	 * @param {String} text
	 */
	_handleInput( evtData ) {
		const editingController = this.editor.editing;
		const doc = this.editor.document;
		const text = evtData.text;

		doc.enqueueChanges( () => {
			// Use target ranges, because they will contain more information than the selection
			// (plus, there might've been no selectionchange event yet).
			// E.g. when typing accent + "a" (Spanish-ISO, they should compose into "á"), when pressing
			// "a" in the target ranges we'll find the accent character which needs to be replaced.
			// The same with all other types of composition.

			const viewRange = evtData.getTargetRanges()[ 0 ];

			if ( viewRange ) {
				const sel = new Selection();
				sel.addRange( editingController.mapper.toModelRange( viewRange ) );

				if ( !sel.isCollapsed ) {
					doc.composer.deleteContents( this._buffer.batch, sel );
				}
			}

			this._buffer.batch.insert( doc.selection.anchor, new Text( text, doc.selection.getAttributes() ) );
			this._buffer.input( text.length );
		} );
	}
}
