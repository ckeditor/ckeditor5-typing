/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DomEventObserver from '../engine/view/observer/domeventobserver.js';

/**
 * Input observer introduces the {@link engine.view.Document#input} event.
 *
 * @memberOf typing
 * @extends engine.view.observer.Observer
 */
export default class InputObserver extends DomEventObserver {
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
		const inputType = domEvt.inputType;

		if ( inputType != 'insertText' ) {
			return;
		}

		this.fire( 'input', domEvt, {
			text: domEvt.data
		} );
	}
}

/**
 * Event fired when the user tries to insert a content (e.g. types or uses a spell checker).
 *
 * Note: This event is fired by the {@link typing.InputObserver observer}
 * (usually registered by the {@link typing.Input input feature}).
 *
 * @event engine.view.Document#input
 * @param {engine.view.observer.DomEventData} data
 * @param {String} data.text The inserted text.
 */
