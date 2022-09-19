/**
 * @module GCA_1D_Model
 * @author Mehran Sharghi
 * @export Gut, GutRegion, Landmark, Marker
 * This module conatins 4 classes that have been used to represent GCA one dimensional gut model. 
 */
export {Gut, GutRegion, Landmark, Marker };

import { capitalizeFirst } from '../GCA_Utilities/src/GCA_Utilities.js'
import { GutAnatomy } from './Anatomy.js'

	
/** @class Gut representing GCA 1D gut model which consists of  a set of GutRegion objects */
class Gut {
	
	/**
	 * Creates an instance of the gut model.  
	 *
	 * @constructor
	 * @param id model ID
	 * @param {string} model name  
	 * @param {string} model species
	 * @param {number} level represent model's abstraction level (not in use)
\	 * @param {string} owner model's creator
	 * @param description
	 */
	constructor(id, name, species, level, owner, description = '', type='normal') {
		this.id = id;
		this.name = name;
		this.species = species;
		this.abstractionLevel = level;
		this.owner = owner;
		this.description = description;
		this.regions = [];
		this.landmarks = [];
		this.markersList = [];
		this.subModels = [];
		this.refModel3D = "";
		this.startPos = Number.MAX_SAFE_INTEGER;
		this.endPos = 0;
		this.branch = null;
		this.type = type;
	}

	static createGutModelFromJson(modelJson) {
		let gut = new Gut(modelJson.id,
							modelJson.name,
							modelJson.species,
							modelJson.level,
							modelJson.owner,
							modelJson.description,
							modelJson.model_type);
		gut.contact = modelJson.contact;
		gut.version = modelJson.version + (modelJson.sub_version? '.' + modelJson.sub_version : '');
		gut.formatVersion = modelJson.format_version||'';
		
		for(let item of modelJson.regions) {
			let id = item.id;
			let anatomy = item.anatomy? item.anatomy[0] : GutAnatomy.findAnatomyById(id);
			let name = anatomy.abbreviated_name; //capitalizeFirst(anatomy.abbreviated_name);
			let description = anatomy.text; //capitalizeFirst(anatomy.text);
			let color = (item.color == undefined || item.color == null)? anatomy.color : item.color;
			color = color.replace('0x', '#');

			let externalId = item.anatomy[0].external_id;
			if(externalId == undefined || externalId == null ) {
				 externalId = anatomy? anatomy.externalId : null;
			}

			let branch = (!item.paths)? 0 :
						 (item.paths.length > 1)? 2 : // 2:'both' 
						 (item.paths[0].toUpperCase() == 'GUT_ATLAS_PAT:20')? 1 : 0;  // 'ileum' : 'colon'
			let pos = item.position? item.position[0] : null;
			let start = (item.start_position == undefined || item.start_position == null)? pos : item.start_position;
			let end = (item.end_position == undefined || item.end_position == null)? pos : item.end_position;;
			let region = new GutRegion(id, name, description, start, end, color, externalId);
			region.setBranch(branch);					
			
			// add intestine wall layers that exist in this region
			region.layers = GutAnatomy.getIntestineLayers(item); 

			gut.addRegion(region);
		}

		for(let item of modelJson.landmarks) {
			let id = item.id;
			let anatomy = item.anatomy? item.anatomy[0] : GutAnatomy.findAnatomyByName(item.name|item.id);
			let name = anatomy.abbreviated_name; //capitalizeFirst(anatomy.abbreviated_name);
			let description = anatomy.text; //capitalizeFirst(anatomy.text);
			let color = (item.color == undefined || item.color == null)? anatomy.color : item.color;
			color = color.replace('0x', '#');

			let externalId = item.anatomy[0].external_id;
			if(externalId == undefined || externalId == null ) {
				 externalId = anatomy? anatomy.externalId : null;
			}

			let branch = (!item.paths)? 0 : // 'colon' :
						 (item.paths.length > 1)? 'both' : 
						 (item.paths[0].toUpperCase() == 'GUT_ATLAS_PAT:20')? 1 : 0;  // 'ileum' : 'colon';
			let pos = item.position? item.position[0] : null;
			let start = (item.start_position == undefined || item.start_position == null)? pos : item.start_position;
			let end = (item.end_position == undefined || item.end_position == null)? pos : item.end_position;;

			pos = (pos!=undefined || pos != null)? pos : (start+end)/2;
			let landmark = new Landmark(id, name, description, pos, start, end, color, item.anatomy, branch, externalId);
			if(name.toLowerCase() == 'pil') {
				landmark.setType('pseudo')
			}
			landmark.layers = GutAnatomy.getIntestineLayers(item); 
			gut.addLandmark(landmark);
		}

		gut.landmarks.sort((a, b) => (a.position == b.position)? ((a.branch==0)? ((b.branch==0)?0:1):-1): a.position - b.position);
		return gut;
	}

	static newMethod(item, region) {
		let anatomyNode = GutAnatomy.findAnatomyById(item.anatomy[0].id);
		region.layers = [];
		for (let i = 0; i < GutAnatomy.visibleIntstinalLayers.length; i++) {
			let layer = GutAnatomy.visibleIntstinalLayers[i];
			let layerAnatomies = GutAnatomy.findAnatomyByName(layer, anatomyNode, false);
			region.layers[layer] = (layerAnatomies && layerAnatomies.length > 0);
		}
		region.layers['Lumen'] = true;
	}

	static createGutModelFromXml(modelXmlText) {
		let parser = new DOMParser();
		let model = parser.parseFromString(modelXmlText, "text/xml");
		let gut = new Gut(model.documentElement.getAttribute('id'),
							model.documentElement.getAttribute('name'),
							model.documentElement.getAttribute('species'),
							model.documentElement.getAttribute('level'),
							model.documentElement.getAttribute('owner'),
							model.documentElement.getAttribute('description'));
	
		let regionPath = "/model/regions/region"
		let regions = model.evaluate(regionPath, model, null, XPathResult.ANY_TYPE, null);
		let regionElement = regions.iterateNext();
		while (regionElement) {
			let regionId = regionElement.getAttribute('id');
			let regionAnatomy = GutAnatomy.findAnatomyById(regionId);
			let regionName = regionElement.getAttribute('name') || capitalizeFirst(regionAnatomy.displayname);
			let regionDescription = regionElement.getAttribute('description') || capitalizeFirst(regionAnatomy.text);
			let regionUberonId = regionElement.getAttribute('uberon') || regionAnatomy.externalid;
			let regionColor = regionElement.getAttribute('color') || regionAnatomy.color;
			let regionStart = parseInt(regionElement.getAttribute('start'));
			let regionEnd = parseInt(regionElement.getAttribute('end'));
  
			let region = new GutRegion(regionId, regionName, regionDescription, regionStart, regionEnd, regionColor, regionUberonId);

			let branch = regionElement.getAttribute('branch');
			if (branch != undefined && branch != null)
				region.setBranch(branch);	
			gut.addRegion(region);
			regionElement = regions.iterateNext();
		}
	
		let landmarkPath = "/model/landmarks/landmark"
		let landmarks = model.evaluate(landmarkPath, model, null, XPathResult.ANY_TYPE, null);
		let landmarkElement = landmarks.iterateNext();
		while (landmarkElement) {
			let pos = landmarkElement.getAttribute('pos');
			let start = landmarkElement.getAttribute('start');
			let end = landmarkElement.getAttribute('end');
			let color = landmarkElement.getAttribute('color');
			if (pos) {
				pos = parseInt(pos);
			}
			start = start? parseInt(start) : pos;
			end = end? parseInt(end) : pos;
			pos = pos? pos : (start+end)/2;
			let landmark = new Landmark(landmarkElement.getAttribute('id'),
										landmarkElement.getAttribute('title'),
										landmarkElement.getAttribute('description'),
										pos, start, end, color,
										landmarkElement.getAttribute('branch'),
										landmarkElement.getAttribute('uberon'));
			let type = landmarkElement.getAttribute('type');
			if (type != undefined && type != null)
				landmark.setType(type);	
			gut.addLandmark(landmark);
			landmarkElement = landmarks.iterateNext();
		}
		return gut;
	}

	CreateGutModelRandom() {
		let gut = new Gut();
		let n = Math.floor(Math.random() * 8) + 2;
		let p = 1;
		let lm = 1;
		for (let i = 1; i <= n; i++) {
			let s = 50 + Math.floor(Math.random() * 151);
			let r = new GutRegion('11' + i, 'R' + i, '', p, p + s);
			gut.addRegion(r);
			if ((Math.floor(Math.random() * n) + 2) % round(.4 * n) == 1 && s > 80) {
				let mp = p + Math.round(0.25 * s + 0.5 * Math.random(2) * s);
				m = new Landmark('22' + lm, 'LM' + lm, 'Landmark' + lm, mp);
				gut.addLandmark(m);
				lm++;
			}
			if (i < n) {
				let m = new Landmark('22' + lm, 'LM' + lm, 'Landmark' + lm, p + s);
				gut.addLandmark(m);
				lm++
			}
			p += s;
		}
		return gut;
	}	

	getSubModel(branch, startPos=null) {
		if(this.subModels[branch] != undefined && this.subModels[branch] != null)
			return this.subModels[branch]; 

		let branchName = (branch == 0)? 'colon' : (branch == 1)? 'small intestine' : 'intestine'; 
		let subModel = new Gut(this.id+'_'+branchName, this.name+'_'+branchName, this.species, this.level, 
								this.owner, 'Submodel for the' + branchName + 'of' + this.description);
		subModel.parent = this;
		subModel.branch = branch;
		for(let originalRegion of this.regions) {
			if (originalRegion.branch !== branch) {
				continue;
			}	
			let region = Object.assign({}, originalRegion);
			Object.setPrototypeOf(region, GutRegion.prototype);
			subModel.addRegion(region);
		}
		if(subModel.regions.length == 0) {
			return null;	
		}
		
		let posOffset = 0
		
		if (startPos != null) {
			posOffset = startPos - subModel.startPos; 
		}
		
		for(let region of subModel.regions) {
			region.startPos += posOffset;
			region.endPos += posOffset;	
		}
		
		for(let originalLandmark of this.landmarks) {
			if (originalLandmark.branch === branch || originalLandmark.branch === 2) {
				let landmark = Object.assign({}, originalLandmark);
				Object.setPrototypeOf(landmark, Landmark.prototype);
//				landmark.branch = 0;
//				landmark.type = null;
				landmark.position += posOffset;
				landmark.startPos += posOffset;
				landmark.endPos += posOffset;
				subModel.addLandmark(landmark);
			}
		}
/*		
		for(let originalMarker of this.markersList) {
			if (originalMarker.branch === branch) {
				let marker = Object.assign({}, originalMarker);
				Object.setPrototypeOf(marker, Marker.prototype);
				marker.branch = 0;
				marker.pos += posOffset;
				subModel.addMarker(marker);
			}
		}
*/
		this.subModels[branch] = subModel;		
		return subModel;
	}

	addRegion(region) {
		let i = 0; 
		while(i < this.regions.length && GutRegion.compare(this.regions[i], region) < 0) {
			i++;
		}
		this.regions.splice(i, 0, region);
		if(region.startPos < this.startPos)
			this.startPos = region.startPos;
		if(region.endPos > this.endPos)
			this.endPos = region.endPos;
		this.length = Math.abs(this.endPos - this.startPos);
	}

	addLandmark(landmark) {
		this.landmarks.push(landmark);
	}

	addMarker(marker) {
		let model = this.parent? this.parent : this;
		let markerIndex = model.getMarker(marker.pos);
		if (markerIndex == -1){
			model.markersList.push(marker);
			model.markersList.sort(Marker.compare);
		} 
		else {
			marker[markerIndex] = marker;
		}
	}
	
	removeMarker(marker) {
		let model = this.parent? this.parent : this;
		let markerIndex = model.markersList.indexOf(marker);
		if (markerIndex == -1){
			return
		} 
		model.markersList.splice(markerIndex, markerIndex + 1);
	}
	
	getRegion(i) {
		return this.regions[i];
	}

	getStartPos() {
		return this.regions[0].startPos;
	}

	getEndPos() {
		return this.regions[this.regions.length-1].endPos;
	}

	getLength(branch=null) {
		if (branch == 0) {
			let len = 0;
			for(let region of this.regions) {
				if(region.branch === 0 && region.endPos > len)
					len = region.endPos;
			}
			return len;
		}

		return this.length;
	}

	getClosestRegionPos(pos) {
		let distance = this.length;
		let closest = this.getStartPos();
		for (let region of this.regions) {
			let d = Math.abs(region.startPos - pos);
//			if (d >= distance)
//				return closest;
			distance = d;
			closest = region.startPos;
		}
		if (this.length - pos < distance)
			return this.length;
		return closest;
	}
	
	findRegionIndex(pos, branch=0) {
		let r = {main:null, extension:null};
		for (let i=0; i<this.regions.length; i++) {
			if (pos>=this.regions[i].startPos && pos<=this.regions[i].endPos) {
				if (this.regions[i].branch === 0) {
					if (branch === 0)
						return i;
					r.main = i;	
				} else {
					if (branch === 1)
						return i;
					r.extension = i;	
				}
			}
		}
		if (branch === 2)  //'both'
			return r;
		if (branch === 0)  //'colon'
			return r.extension;
		return r.main;
	}

	clearMarkers() {
		this.markersList = [];
		if(this.parent) {
			this.parent.markersList = [];
		}
	}

	getMarker(pos) {
		let model = this;
		if(this.parent) {
			model = this.parent;
		}
		for(let i=0; i<model.markersList; i++) {
			if (model.markersList[pos] === pos)
				return i;
			if (marker.pos > pos)
				return -1;
		}
		return -1; 
	}
	
	get	markers() {
		return this.parent? this.parent.markersList : this.markersList;
	}
	
	getId = () => this.id;

	getName = () => this.name;

	getSpecies = () => this.species;

	getAbstractionLevel = () => this.abstractionLevel;

	getOwner = () => this.owner;

}

//*******************************************************************************************
/** @class GutRegion representing a single region of gut in the GCA 1D gut model */
class GutRegion {
	/**
	 * Creates an instance of the gut region.  
	 *
	 * @constructor
	 * @param id region ID
	 * @param {string} name name of the region  
	 * @param {string} description
	 * @param {number} start start posion of the region from the beginning of gut model
	 * @param {end} end end posion of the region from the beginning of gut model
	 * @param {string} color color associated to the region in hex string format
	 * @param {string} uberonid represents regions uberon id if it exists
	 */
	constructor(id, name, description, start, end, color, uberonId = '') {
		this.id = id;
		this.uberonId = uberonId;
		this.name = name;
		this.description = description;
		this.startPos = start;
		this.endPos = end;
		this.color = color;
		this.branch = 0;
		this.ontologies = null;
		this.subRegions = null;
		this.associatedData = null;
	}

	setBranch(branch) {
		this.branch = branch;
	}
	
	get size() {
		let len = this.endPos - this.startPos;
		return Math.abs(len);
	}
	
	static compare(a, b) {
		if(a.branch == b.branch) {
			return a.startPos - b.startPos;
		}
		if(a.branch == 1) { //'ileum'
			return 1;
		} 
		if(b.branch == 1) { //'ileum'
			return -1;
		}
		return (a.branch == 2)? 1 : -1;  // 2:'both'
	}	

}

//*******************************************************************************************
/** @class Landmark representing a single landmark in the GCA 1D gut model */
class Landmark extends GutRegion{
	/**
	 * Creates an instance of a landmark.  
	 *
	 * @constructor
	 * @param id landmark ID
	 * @param {string} title name of the landmark  
	 * @param {string} description
	 * @param {number} pos posion of the landmark from the beginning of gut model
	 * @param {number} start specifies the start position of the the landmark region;  posion of the landmark is assumed to be at the middle of the region
	 * @param {number} end specifies the end position of the the landmark region;  posion of the landmark is assumed to be at the middle of the region
	 * @param {string} color color associated to the region in hex string format
	 * @param {string} branch represents the branch of model where the landmark reside (default value is 0 for the "colon" branch)
	 * @param {string} uberon represents landmark's uberon id if it exists
	 */
	constructor(id, title, description, pos, start, end, color, anatomy, branch=0, uberon='') {
		super(id, description, description, start, end, color, uberon);
		this.title = title;
		this.position = pos;
		this.startPos = start? start : pos;
		this.endPos = end? end : pos;
		this.color = color;
		this.branch = branch;
		this.type = 'normal';
		if (! anatomy) {
			anatomy = GutAnatomy.findAnatomyByName(title);
		}
		this.anatomy = Array.isArray(anatomy)? anatomy : [anatomy];	 
	}

	setType(type) {
		this.type = type.toLowerCase();
	}

	static compare(a, b) {
		return a.position - b.posision; 
	}	
	
}

//*******************************************************************************************
/** @class Mark representing a single marker added to the GCA 1D gut model */
class Marker {
	/**
	 * Creates an instance of a marker.  
	 *
	 * @constructor
	 * @param {number} pos posion of the marker from the beginning of gut model
	 * @param {string} description
	 * @param {string} branch represents the branch of model where the landmark reside (default value is 0 for the "colon" branch)
	 */
	constructor(pos, description='', branch=0) {
		this.pos = pos;
		this.description = description;
		this.branch = branch;
	}
	
	static compare(a, b) {
		return a.pos - b.pos; 
	}	
	
}

