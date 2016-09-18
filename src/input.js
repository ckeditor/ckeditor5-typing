/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ChangeBuffer from './changebuffer.js';
import InputObserver from './inputobserver.js';
import Text from '../engine/model/text.js';

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
			this._inputText( data.text );

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
	_inputText( text ) {
		const doc = this.editor.document;

		doc.enqueueChanges( () => {
			if ( !doc.selection.isCollapsed ) {
				this.editor.execute( 'delete' );
			}

			const textNode = new Text( text, doc.selection.getAttributes() );

			this._buffer.batch.insert( doc.selection.anchor, textNode );
			this._buffer.input( text.length );
		} );
	}
}
