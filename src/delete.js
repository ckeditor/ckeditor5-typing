/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import DeleteCommand from './deletecommand.js';
import DeleteObserver from './deleteobserver.js';

/**
 * The delete and backspace feature. Handles the <kbd>Delete</kbd> and <kbd>Backspace</kbd> keys in the editor.
 *
 * @memberOf typing
 * @extends core.Feature
 */
export default class Delete extends Feature {
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.addObserver( DeleteObserver );

		editor.commands.set( 'forwardDelete', new DeleteCommand( editor, 'forward' ) );
		editor.commands.set( 'delete', new DeleteCommand( editor, 'backward' ) );

		this.listenTo( editingView, 'delete', ( evt, data ) => {
			// TODO Native beforeinput uses a different units than we do. Its 'content' means
			// our 'character' and there are many other types. Most likely, it will be reasonable to
			// align to the native types.

			// Also, currently the DeleteCommand can only delete a character. We need to be able to pass
			// to the command the target ranges (see DeleteObserver) as a support for other units than 'character'.
			// The command will be able to either calculate what should be removed itself, or use the ranges as a backup.

			editor.execute( data.direction == 'forward' ? 'forwardDelete' : 'delete', { unit: 'character' } );

			data.preventDefault();
		} );
	}
}
