/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/bidi
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getTextDirection } from './utils/bidi';
import '../theme/bidi.css';

const RTL_CLASS = 'ck-bidi_rtl';
const LTR_CLASS = 'ck-bidi_ltr';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class BiDi extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'BiDi';
	}

	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const model = editor.model;
		const modelDocument = model.document;
		const viewDocument = view.document;
		const modelSelection = modelDocument.selection;

		this.listenTo( modelDocument, 'change', () => {
			view.change( writer => {
				const elements = [ ...model.createRangeIn( modelDocument.getRoot() ).getItems() ]
					.filter( item => item.is( 'element' ) );

				elements.forEach( element => {
					const elementTextDirection = getModelElementTextDirection( model, element );
					const viewElement = editor.editing.mapper.toViewElement( element );

					setViewElementTextDirection( writer, viewElement, elementTextDirection );
				} );
			} );
		}, { priority: 'low' } );

		let lastTextDirection;

		// Save the text direction of the element the user is "entering from".
		this.listenTo( viewDocument, 'enter', () => {
			const modelElement = modelSelection.getFirstPosition().parent;
			lastTextDirection = getModelElementTextDirection( model, modelElement );
		} );

		// Update the text direction of the element the user "entered to".
		this.listenTo( viewDocument, 'enter', () => {
			const modelElement = modelSelection.getFirstPosition().parent;
			const viewElement = editor.editing.mapper.toViewElement( modelElement );

			view.change( writer => {
				setViewElementTextDirection( writer, viewElement, lastTextDirection );
			} );
		}, { priority: 'low' } );
	}
}

function getModelElementTextDirection( model, element ) {
	const elementRange = model.createRangeIn( element );
	const elementText = [ ...elementRange.getItems() ].map( item => item.data ).join( '' );

	return getTextDirection( elementText );
}

function setViewElementTextDirection( writer, element, direction ) {
	if ( direction === 'rtl' ) {
		writer.addClass( RTL_CLASS, element );
		writer.removeClass( LTR_CLASS, element );
	} else if ( direction == 'ltr' ) {
		writer.addClass( LTR_CLASS, element );
		writer.removeClass( RTL_CLASS, element );
	} else {
		writer.removeClass( LTR_CLASS, element );
		writer.removeClass( RTL_CLASS, element );
	}
}
