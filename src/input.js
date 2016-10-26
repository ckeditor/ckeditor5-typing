/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import InputCommand from './inputcommand.js';

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

		editor.commands.set( 'inputKeydown', new InputCommand( editor, 'keydown' ) );
		editor.commands.set( 'inputMutation', new InputCommand( editor, 'mutation' ) );

		this.listenTo( editingView, 'keydown', ( evt, evtData ) => {
			editor.execute( 'inputKeydown', { evtData } );
		}, { priority: 'lowest' } );

		this.listenTo( editingView, 'mutations', ( evt, mutations, viewSelection ) => {
			editor.execute( 'inputMutation', { mutations, viewSelection } );
		} );
	}
}
