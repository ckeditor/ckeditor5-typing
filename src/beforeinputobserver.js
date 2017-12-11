/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/beforeinputobserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';

export default class BeforeInputObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = 'input';
	}

	onDomEvent( domEvent ) {
		const inputType = domEvent.inputType;

		if ( inputType !== 'deleteContentBackward' ) {
			return;
		}

		const direction = inputType.endsWith( 'Forward' ) ? 'forward' : 'backward';
		const unit = getUnit( inputType );
	}
}

const unitRegexp = /^delete(Word|SoftLine|EntireSoftLine|HardLine|ComposedCharacter|ByCut|ByDrag|Content)/;

function getUnit( inputType ) {
	const unit = inputType.match( unitRegexp )[ 1 ];

	// Doesn't make any difference for us.
	if ( unit == 'ByCut' || unit == 'ByDrag' ) {
		return 'content';
	}

	// Lower camel case.
	return unit[ 0 ].toLowerCase() + unit.slice( 1 );
}
