/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import DeleteCommand from './deletecommand.js';
import DeleteObserver from './deleteobserver.js';
import Selection from '../engine/model/selection.js';

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
		const editingController = this.editor.editing;

		editingView.addObserver( DeleteObserver );

		editor.commands.set( 'forwardDelete', new DeleteCommand( editor, 'forward' ) );
		editor.commands.set( 'delete', new DeleteCommand( editor, 'backward' ) );

		this.listenTo( editingView, 'delete', ( evt, data ) => {
			// TODO Native beforeinput uses a different set units than we do. Its 'content' means
			// our 'character' and there are many other types. Most likely, it will be reasonable to
			// align to the native types.

			// Also, currently the DeleteCommand can only delete a character. We need to be able to pass
			// to the command the target ranges (see DeleteObserver) as a support for other units than 'character'.
			// The command will be able to either calculate what should be removed itself, or use the ranges as a backup.

			// ----------------------------------------------------------------

			// A very hacky implementation which uses the target ranges to solve the problem described above.
			// It's hard to say now in what kinds of situations we'll want to use the native algorithm for
			// calculating what should be removed. This would need to be researched, but I assume that we'd like
			// to use the browser for the below listed ones, and handle the rest on our own.
			//
			// OTOH, while in some case the browser can help us to understand what
			// piece of the content must be deleted, it also can be misleading. It can mark a weird piece of DOM
			// which then `composer.deleteContents()` would need to handle gracefully.
			const viewRange = data.getTargetRanges()[ 0 ];
			const considerTargetRange = [ 'word', 'softLine', 'entireSoftLine', 'hardLine', 'composedCharacter' ];
			let selection;

			if ( considerTargetRange.includes( data.unit ) && viewRange ) {
				selection = new Selection();
				selection.addRange( editingController.mapper.toModelRange( viewRange ) );
			}

			editor.execute( data.direction == 'forward' ? 'forwardDelete' : 'delete', {
				unit: data.unit,
				selection
			} );

			data.preventDefault();
		} );
	}
}
