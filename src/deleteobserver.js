/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DomEventObserver from '../engine/view/observer/domeventobserver.js';

/**
 * Delete observer introduces the {@link engine.view.Document#delete} event.
 *
 * @memberOf typing
 * @extends engine.view.observer.Observer
 */
export default class DeleteObserver extends DomEventObserver {
	/**
	 * @inheritDoc
	 */
	get domEventType() {
		return 'beforeinput';
	}

	/**
	 * @inheritDoc
	 */
	onDomEvent( domEvt ) {
		const doc = this.document;
		const inputType = domEvt.inputType;

		if ( !inputType.startsWith( 'delete' ) ) {
			return;
		}

		const cancelable = domEvt.cancelable;
		const direction = inputType.endsWith( 'Forward' ) ? 'forward' : 'backward';
		const unit = getUnit( inputType );

		// Useful for debugging:
		// const r = window.document.getSelection().getRangeAt( 0 );
		// const r = domEvt.getTargetRanges()[ 0 ];
		// console.log( r.startContainer, r.startOffset, r.endOffset );

		this.fire( 'delete', domEvt, {
			cancelable,
			direction,
			unit,

			getTargetRanges() {
				return Array.from( domEvt.getTargetRanges() )
					.map( domRange => doc.domConverter.domRangeToView( domRange ) );
			}
		} );
	}
}

const unitRegexp = /^delete(Word|SoftLine|EntireSoftLine|HardLine|ComposedCharacter|ByCut|ByDrag|Content)/;

// @returns {engine.view.Document.DeleteUnit}
function getUnit( inputType ) {
	const unit = inputType.match( unitRegexp )[ 1 ];

	// Doesn't make any difference for us.
	if ( unit == 'ByCut' || unit == 'ByDrag' ) {
		return 'content';
	}

	// Lower camel case.
	return unit[ 0 ].toLowerCase() + unit.slice( 1 );
}

/**
 * Event fired when the user tries to delete content (e.g. presses <kbd>Delete</kbd> or <kbd>Backspace</kbd>).
 *
 * Note: This event is fired by the {@link typing.DeleteObserver observer}
 * (usually registered by the {@link typing.Delete delete feature}).
 *
 * @event engine.view.Document#delete
 * @param {engine.view.observer.DomEventData} data
 * @param {'forward'|'delete'} data.direction The direction in which the deletion should happen.
 * @param {engine.view.Document.DeleteUnit} data.unit The "amount" of content that should be deleted.
 */

/**
 * Expresses a deleted amount of content.
 *
 * @typedef {'content'|'word'|'softLine'|'entireSoftLine'|'hardLine'|'composedCharacter'}
 * engine.view.Document.DeleteUnit
 */
