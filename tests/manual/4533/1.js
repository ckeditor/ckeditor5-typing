/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class HighlightTyping extends Plugin {
	init() {
		const editor = this.editor;
		let marker = null;

		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'highlight',
			view: () => {
				return {
					classes: [ 'foo' ]
				};
			}
		} );

		editor.model.on( 'insertContent', ( evt, args ) => {
			const options = args[ args.length - 1 ];

			if ( options && options.forceDefaultExecution ) {
				return;
			}

			editor.model.change( writer => {
				const affectedRange = editor.model.insertContent(
					args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ],
					{ forceDefaultExecution: true }
				);

				if ( !marker ) {
					marker = writer.addMarker( 'highlight:bar', { range: affectedRange, usingOperation: false } );
				} else {
					writer.updateMarker( 'highlight:bar', { range: affectedRange, usingOperation: false } );
				}
			} );

			evt.stop();
		}, { priority: 'high' } );
	}
}

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			Essentials,
			Paragraph,
			HighlightTyping
		],
	} )
	.then( editor => {
		window.editor = editor;

		editor.model.change( writer => {
			const pos = writer.createPositionFromPath( editor.model.document.getRoot(), [ 0, 35 ] );
			const range = writer.createRange( pos, pos.getShiftedBy( 4 ) );

			writer.addMarker( 'highlight:foo', { range, usingOperation: false } );
		} );
	} )
	.catch( error => console.error( error ) );
