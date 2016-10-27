/*
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '/tests/core/_utils/virtualtesteditor.js';
import InputCommand from '/ckeditor5/typing/inputcommand.js';
import Paragraph from '/ckeditor5/paragraph/paragraph.js';

import Batch from '/ckeditor5/engine/model/batch.js';
import ModelRange from '/ckeditor5/engine/model/range.js';
import buildModelConverter from '/ckeditor5/engine/conversion/buildmodelconverter.js';
import buildViewConverter from '/ckeditor5/engine/conversion/buildviewconverter.js';

import ViewText from '/ckeditor5/engine/view/text.js';
import ViewElement from '/ckeditor5/engine/view/element.js';
import ViewSelection from '/ckeditor5/engine/view/selection.js';

import { getData as getModelData } from '/ckeditor5/engine/dev-utils/model.js';
import { getData as getViewData } from '/ckeditor5/engine/dev-utils/view.js';

describe( 'InputCommand', () => {
	let editor, doc, model, modelRoot, view, viewRoot;

	before( () => {
		return VirtualTestEditor.create( {
				features: [ Paragraph ]
			} )
			.then( newEditor => {
				// Mock image feature.
				newEditor.document.schema.registerItem( 'image', '$inline' );

				buildModelConverter().for( newEditor.data.modelToView, newEditor.editing.modelToView )
					.fromElement( 'image' )
					.toElement( 'img' );

				buildViewConverter().for( newEditor.data.viewToModel )
					.fromElement( 'img' )
					.toElement( 'image' );

				editor = newEditor;
				model = editor.editing.model;
				modelRoot = model.getRoot();
				view = editor.editing.view;
				viewRoot = view.getRoot();
				doc = editor.document;

				editor.commands.set( 'inputMutation', new InputCommand( editor ) );
			} );
	} );

	beforeEach( () => {
		editor.setData( '<p>foobar</p>' );

		model.enqueueChanges( () => {
			model.selection.setRanges( [
				ModelRange.createFromParentsAndOffsets( modelRoot.getChild( 0 ), 3, modelRoot.getChild( 0 ), 3 )
			] );
		} );
	} );

	describe( 'execute', () => {
		it( 'uses enqueueChanges', () => {
			const spy = sinon.spy( doc, 'enqueueChanges' );

			editor.execute( 'inputMutation', { mutations: [] } );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should handle mutations', () => {
			editor.setData( '<p>foo[]bar</p>' );

			const mutations = [ {
				type: 'text',
				oldText: 'foobar',
				newText: 'fooxbar',
				node: viewRoot.getChild( 0 ).getChild( 0 )
			} ];

			editor.execute( 'inputMutation', { mutations } );

			expect( editor.getData( { selection: true } ) ).to.equal( '<p>foox[]bar</p>' );
		} );
	} );

	describe( 'mutations handling', () => {
		it( 'should handle text mutation', () => {
			const mutations = [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'fooxbar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			];

			editor.execute( 'inputMutation', { mutations } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foox[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foox{}bar</p>' );
		} );

		it( 'should handle text mutation change', () => {
			const mutations = [
				{
					type: 'text',
					oldText: 'foobar',
					newText: 'foodar',
					node: viewRoot.getChild( 0 ).getChild( 0 )
				}
			];

			editor.execute( 'inputMutation', { mutations } );

			expect( getModelData( model ) ).to.equal( '<paragraph>food[]ar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>food{}ar</p>' );
		} );

		it( 'should handle text node insertion', () => {
			editor.setData( '<p></p>' );

			const mutations = [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ) ],
					node: viewRoot.getChild( 0 )
				}
			];

			editor.execute( 'inputMutation', { mutations } );

			expect( getModelData( model ) ).to.equal( '<paragraph>x[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>x{}</p>' );
		} );

		it( 'should do nothing when two nodes were inserted', () => {
			editor.setData( '<p></p>' );

			const mutations = [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewText( 'x' ), new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			];

			editor.execute( 'inputMutation', { mutations } );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>[]</p>' );
		} );

		it( 'should do nothing when two nodes were inserted and one removed', () => {
			const mutations = [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foobar' ) ],
					newChildren: [ new ViewText( 'x' ), new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			];

			editor.execute( 'inputMutation', { mutations } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo{}bar</p>' );
		} );

		it( 'should handle multiple children in the node', () => {
			editor.setData( '<p>foo<img></img></p>' );

			const mutations = [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foo' ), viewRoot.getChild( 0 ).getChild( 1 ) ],
					newChildren: [ new ViewText( 'foo' ), viewRoot.getChild( 0 ).getChild( 1 ), new ViewText( 'x' ) ],
					node: viewRoot.getChild( 0 )
				}
			];

			editor.execute( 'inputMutation', { mutations } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo<image></image>x[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo<img></img>x{}</p>' );
		} );

		it( 'should do nothing when node was removed', () => {
			const mutations = [
				{
					type: 'children',
					oldChildren: [ new ViewText( 'foobar' ) ],
					newChildren: [],
					node: viewRoot.getChild( 0 )
				}
			];

			editor.execute( 'inputMutation', { mutations } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foo[]bar</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foo{}bar</p>' );
		} );

		it( 'should do nothing when element was inserted', () => {
			editor.setData( '<p></p>' );

			const mutations = [
				{
					type: 'children',
					oldChildren: [],
					newChildren: [ new ViewElement( 'img' ) ],
					node: viewRoot.getChild( 0 )
				}
			];

			editor.execute( 'inputMutation', { mutations } );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>[]</p>' );
		} );

		it( 'should set model selection appropriately to view selection passed in mutations event', () => {
			// This test case emulates spellchecker correction.

			const viewSelection = new ViewSelection();
			viewSelection.collapse( viewRoot.getChild( 0 ).getChild( 0 ), 6 );

			const mutations = [ {
				type: 'text',
				oldText: 'foobar',
				newText: 'foodar',
				node: viewRoot.getChild( 0 ).getChild( 0 )
			} ];

			editor.execute( 'inputMutation', { mutations, viewSelection } );

			expect( getModelData( model ) ).to.equal( '<paragraph>foodar[]</paragraph>' );
			expect( getViewData( view ) ).to.equal( '<p>foodar{}</p>' );
		} );

		it( 'should use up to one insert and remove operations', () => {
			// This test case emulates spellchecker correction.

			const viewSelection = new ViewSelection();
			viewSelection.collapse( viewRoot.getChild( 0 ).getChild( 0 ), 6 );

			sinon.spy( Batch.prototype, 'weakInsert' );
			sinon.spy( Batch.prototype, 'remove' );

			const mutations = [ {
				type: 'text',
				oldText: 'foobar',
				newText: 'fxobxr',
				node: viewRoot.getChild( 0 ).getChild( 0 )
			} ];

			editor.execute( 'inputMutation', { mutations, viewSelection } );

			expect( Batch.prototype.weakInsert.calledOnce ).to.be.true;
			expect( Batch.prototype.remove.calledOnce ).to.be.true;
		} );
	} );
} );

