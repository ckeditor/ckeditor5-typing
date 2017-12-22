/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/inputobserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';

export default class InputObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = [ 'beforeinput', 'input' ];
	}

	onDomEvent( domEvent ) {
		const domConverter = this.document.domConverter;

		this.fire( domEvent.type, domEvent, {
			inputType: domEvent.inputType,
			getTargetRanges() {
				const domRanges = Array.from( domEvent.getTargetRanges() );

				return domRanges.map( domRange => domConverter.domRangeToView( domRange ) );
			}
		} );
	}
}
