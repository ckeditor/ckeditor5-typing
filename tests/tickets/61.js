/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import Typing from '../../src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'Bug ckeditor5-typing#61', () => {
	let editor, doc, viewDocument, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Typing, Paragraph, Undo, Bold, Italic, Enter, Heading ],
			typing: { undoStep: 3 }
		} )
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;
			viewDocument = editor.editing.view;
		} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	function expectOutput( modelOutput, viewOutput ) {
		expect( getModelData( editor.document ) ).to.equal( modelOutput );
		expect( getViewData( viewDocument ) ).to.equal( viewOutput );
	}

	function simulateTyping( text ) {
		// While typing, every character is an atomic change.
		text.split( '' ).forEach( character => {
			editor.execute( 'input', {
				text: character
			} );
		} );
	}

	it( 'leaves an empty paragraph after removing the whole content from editor #1', () => {
		setModelData( doc, '[<heading1>Header 1</heading1><paragraph>Some text.</paragraph>]' );

		editor.execute( 'delete' );

		expectOutput( '<paragraph>[]</paragraph>', '<p>[]</p>' );
	} );

	it( 'leaves an empty paragraph after removing the whole content from editor #2', () => {
		setModelData( doc, '<heading1>[Header 1</heading1><paragraph>Some text.]</paragraph>' );

		editor.execute( 'delete' );

		expectOutput( '<paragraph>[]</paragraph>', '<p>[]</p>' );
	} );

	it( 'wraps inserted text in a paragraph after typing in editor with selected the whole content #1', () => {
		setModelData( doc, '[<heading1>Header 1</heading1><paragraph>Some text.</paragraph>]' );

		editor.execute( 'delete' );

		simulateTyping( '123' );

		expectOutput( '<paragraph>123[]</paragraph>', '<p>123{}</p>' );
	} );

	it( 'wraps inserted text in a paragraph after typing in editor with selected the whole content #2', () => {
		setModelData( doc, '<heading1>[Header 1</heading1><paragraph>Some text.]</paragraph>' );

		editor.execute( 'delete' );

		simulateTyping( '123' );

		expectOutput( '<paragraph>123[]</paragraph>', '<p>123{}</p>' );
	} );

	it( 'paragraph created after removing the whole content should not have any attribute', () => {
		setModelData( doc, '<paragraph><$text bold="true">[Some text.]</$text></paragraph>' );

		editor.execute( 'delete' );

		simulateTyping( '123' );

		expectOutput( '<paragraph>123[]</paragraph>', '<p>123{}</p>' );
	} );
} );
