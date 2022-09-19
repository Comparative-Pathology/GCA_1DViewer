/**
 * @module AnnotationPanel
 * @author Mehran Sharghi
 * @export AnnotationPanel
 * This module conatins a two classes Annotation and AnnotationPanel which conatins all the functionality required to display a 
 * annotation view for the region of interest in the GCA 1D model viewer.
 */

import { Utility } from '../GCA_Utilities/src/GCA_Utilities.js'

import { Theme } from './Theme.js';
import {DisplayPanel } from './DisplayPanel.js';

export { UberonPanel, openUberonLink, getUberonLink };

const UberonUrl = 'http://purl.obolibrary.org/obo/';

/** @class UberonItem encapsulate information associatd with a single UBERON ID */
class UberonItem {
	/**
	 * Creates an instance of UberonItem 
	 *
	 * @constructor
	 * @param {string} title title of the region  
	 * @param description
	 * @param {number} pos location of the annotation from the beginning of gut model
	 * @param {string} link reference to external source
	 */
	constructor(title, description, pos, link=null) {
		this.title = title;
		this.description = description;
		this.pos = pos;
		this.link = link;
		
	}	
	
	static compare(a, b) {
		if (a.title > b.title) 
			return 1;
		if (a.title < b.title) 
			return -1;
		return 0;
	}
}

function getUberonLink(uberonId) {
	let id = uberonId.replace(':', '_'); 
	return `${UberonUrl + id}`;
}

function openUberonLink(uberonId) {
		let url = UberonUrl + uberonId; 
		let popupFeatures = "toolbar=yes,resizable=yes,location=yes,scrollbars=yes,status=yes,titlebar=yes";
		let win = window.open(url, "_blank", popupFeatures);
//		console.log(url);		
}

/** @class AnnotationPanel representing annotation view for GCA 1D gut model */
class UberonPanel extends DisplayPanel {
	/**
	 * Creates an instance of Annotation panel.  
	 *
	 * @constructor
	 * @param {string} model gut 1D model  
	 * @param {number} width width of the annotation panel
	 * @param {number} height height of the annotation panel
	 * @param {object} roi represents the region of interest in the gut usually provided by the slider panel 
	 * @param {boolean} lr specifes the direction of the linear model display from left to right or right to left 
	 */
	constructor(container, parent) {
		super(container, parent, null, 'annotationBkgColor', false);
		this.populateUberonTable();
	}

	drawPanel() {
		let tableHead = `<thead><tr>
							<th style="background:${Theme.currentTheme.annotationBkgColor}">Uberon Id</th>
							<th style="background:${Theme.currentTheme.annotationBkgColor}">Description</th></tr></thead>`;
		let tableBody = '<tbody>';
		let f1 = Theme.currentTheme.annotationPosFont;
		let f2 = Theme.currentTheme.annotationFont;
		let idStyle = `color:${f1.fill};`;
		let descStyle = `color:${f2.fill}; font-weight:${f2.weight}`;
		for(let annotation of this.uberonTable) {
			let uberonId = annotation.description.replace(':', '_'); 
//			let link = `<a href="#" onclick= "openUberonLink(\'` + uberonId + `\')" >${uberonId}</a>`;
			let link = `<a style="${idStyle}" href="${UberonUrl + uberonId}" target="_blank">${annotation.description}</a>`;
//			let link = `<a href="${UberonUrl + uberonId}" target="_popup" onclick="window.open('${UberonUrl + uberonId}', '_blank')">${annotation.description}</a>`;
//			let link = `<a href="#" >${uberonId}</a>`;
			tableBody += '<tr>';
			tableBody += `<td style="${idStyle}">${link}</td>`;
			tableBody += `<td style="${descStyle}">${annotation.title}</td>`;
			tableBody += '</tr>';
		}
		tableBody += '</tbody>';

		this.uberonDisplayTable = Utility.htmlToElem(`<div class="tableFixHead"><table class="medium-text">${tableHead}${tableBody}</table></div>`);

		let wrapper = Utility.addElement(this.container, 'div');
		let gap = 2;
		wrapper.style.marginBottom = gap + 'px';
		wrapper.style.height = `calc(100% - ${gap}px)`;
		wrapper.appendChild(this.uberonDisplayTable);
//		this.container.appendChild(this.annotationTable);
		
		this.uberonDisplayTable.style.color = f2.fill;
//		this.uberonDisplayTable.style.font = `${f2.size}px ${f2.family}`;
	}
	
	

	populateUberonTable() {
		let uberonList =  [	{title: 'digestive system',				id: 'UBERON:0001007'},
							{title: 'intestine',					id: 'UBERON:0000160'},
							{title: 'anal canal',					id: 'UBERON:0000159'},
							{title: 'anus',							id: 'UBERON:0001245'},
							{title: 'ascending colon',				id: 'UBERON:0001156'},
							{title: 'caecum',						id: 'UBERON:0001153'},
							{title: 'colon',						id: 'UBERON:0001155'},
							{title: 'descending colon',				id: 'UBERON:0001158'},
							{title: 'descending sigmoid junction',	id: 'UBERON:8410001'},
							{title: 'duodeno-jejunal junction',		id: 'UBERON:8410000'},
							{title: 'duodenum',						id: 'UBERON:0002114'},
							{title: 'hepatic flexure of colon',		id: 'UBERON:0022277'},
							{title: 'ileocecal valve',				id: 'UBERON:0000569'},
							{title: 'ileocolic vein',				id: 'UBERON:0001219'},
							{title: 'ileum',						id: 'UBERON:0002116'},
							{title: 'inferior mesenteric artery',	id: 'UBERON:0001183'},
							{title: 'iliac artery',					id: 'UBERON:0005609'},
							{title: 'internal iliac vein',			id: 'UBERON:0005609'},
							{title: 'jejunum',						id: 'UBERON:0002115'},
							{title: 'left colic vein',				id: ''},
							{title: 'mesenteric lymph node',		id: 'UBERON:0002509'},
							{title: 'mesentery',					id: 'UBERON:0002095'},
							{title: 'rectum',						id: 'UBERON:0001052'},
							{title: 'right colic vein',				id: ''},
							{title: 'sigmoid colon',				id: 'UBERON:0001159'},
							{title: 'sigmoid junction',				id: ''},
							{title: 'splenic flexure of colon',		id: 'UBERON:0022276'},
							{title: 'superior mesenteric artery',	id: 'UBERON:0001182'},
							{title: 'terminal ileum',				id: 'EFO:0005185'},
							{title: 'transverse colon',				id: 'UBERON:0001157'},
							{title: 'vermiform appendix',			id: 'UBERON:0001154'},
							{title: 'rectosigmoid junction',		id: 'UBERON:0036214'},
							{title: 'hepatic vein',					id: 'UBERON:0001143'},
							{title: 'hepatic artery',				id: 'UBERON:0001193'},
							{title: 'jejuno-ileal junction',		id: 'UBERON:8410004'},
							{title: 'left colic artery',			id: 'UBERON:8410008'},
							{title: 'sigmoid artery',				id: 'UBERON:0035180'},
							{title: 'ileocolic artery',				id: 'UBERON:0001197'},
							{title: 'right colic artery',			id: 'UBERON:8410009'},
							{title: 'superior mesenteric vein',		id: 'UBERON_0001138'}];
		this.uberonTable = [];
		
		for(let uberon of uberonList) {
			let annotation = new UberonItem(uberon.title, uberon.id, 0);   
			this.uberonTable.push(annotation);
		}
		this.uberonTable.sort(UberonItem.compare);

//		for(let annotation of this.annotationList)
//			console.log(annotation.pos + "\t" + annotation.title);

	}



	
}
