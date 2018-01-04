/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/deleteobserver
 */

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

		document.on( 'keyup', ( evt, data ) => {
			if ( data.keyCode == keyCodes.delete || data.keyCode == keyCodes.backspace ) {
				sequence = 0;
			}
		} );

		document.on( 'keydown', ( evt, data ) => {
			const deleteData = {};

			// Do not handle if specific event like `keydown:delete` is fired.
			// https://github.com/ckeditor/ckeditor5/issues/753
			if ( evt.name !== 'keydown' ) {
				return;
			}

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

			// Stop generic `keydown` event and fire specific `keydown:delete` event.
			evt.stop();
			document.fire( 'keydown:delete', data );
		}, { priority: 'highest' } );
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
