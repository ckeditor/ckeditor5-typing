/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, window, document */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import { getData } from '/tests/engine/_utils/model.js';

window.getData = getData;

window.setInterval( function() {
	console.log( getData( window.editor.document ) );
}, 3000 );

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [
		'enter',
		'typing',
		'typing/norenderduringcomposition',
		'paragraph',
		'undo',
		'basic-styles/bold',
		'basic-styles/italic',
		'headings'
	],
	toolbar: [ 'headings', 'bold', 'italic', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
