/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/deleteobserver
 */

/* global setTimeout */

import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * Delete observer introduces the {@link module:engine/view/document~Document#event:delete} event.
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class DeleteObserver extends Observer {
	constructor( document ) {
		super( document );

		let sequence = 0;

		// This will block selection change after `input` event with `deleteContentBackward` type.
		// Selection change after this event is fired in async manner on android devices. We need to skip those events
		// to have correct selection state after removing the content.
		this.blockSelectionChange = false;
		this.listenTo( document, 'selectionChange', evt => {
			if ( this.blockSelectionChange ) {
				evt.stop();
			}
		}, { priority: 'high' } );

		document.on( 'input', ( evt, data ) => {
			const inputType = data.inputType;
			if ( inputType !== 'deleteContentBackward' ) {
				return;
			}

			this.blockSelectionChange = true;

			// Block async selectionChange events fired after input event.
			setTimeout( () => {
				this.blockSelectionChange = false;
				document.render();
			}, 1 );

			document.fire( 'delete', new DomEventData( document, data.domEvent, {
				direction: 'backward',
				unit: 'character',
				sequence: ++sequence
			} ) );
		} );

		document.on( 'keyup', ( evt, data ) => {
			if ( data.keyCode == keyCodes.delete || data.keyCode == keyCodes.backspace ) {
				sequence = 0;
			}
		} );

		document.on( 'keydown', ( evt, data ) => {
			const deleteData = {};

			if ( data.keyCode == keyCodes.delete ) {
				deleteData.direction = 'forward';
				deleteData.unit = 'character';
			} else if ( data.keyCode == keyCodes.backspace ) {
				deleteData.direction = 'backward';
				deleteData.unit = 'codePoint';
			} else {
				return;
			}

			deleteData.unit = data.altKey ? 'word' : deleteData.unit;
			deleteData.sequence = ++sequence;

			document.fire( 'delete', new DomEventData( document, data.domEvent, deleteData ) );

			// Delete key is handled here - do not pass it to the input.
			evt.stop();
			data.preventDefault();
		} );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}

/**
 * Event fired when the user tries to delete content (e.g. presses <kbd>Delete</kbd> or <kbd>Backspace</kbd>).
 *
 * Note: This event is fired by the {@link module:typing/deleteobserver~DeleteObserver observer}
 * (usually registered by the {@link module:typing/delete~Delete delete feature}).
 *
 * @event module:engine/view/document~Document#event:delete
 * @param {module:engine/view/observer/domeventdata~DomEventData} data
 * @param {'forward'|'delete'} data.direction The direction in which the deletion should happen.
 * @param {'character'|'word'} data.unit The "amount" of content that should be deleted.
 * @param {Number} data.sequence A number describing which subsequent delete event it is without the key being released.
 * If it's 2 or more it means that the key was pressed and hold.
 */
