/**
 * @module GCA-1D-Model
 * @author Mehran Sharghi
 * @export GutAnatomy
 * This module conatins 4 classes that have been used to represent GCA one dimensional gut model. 
 */
import * as Util from '../GCA_Utilities.js';
export {GutAnatomy};

/** @class Gut representing GCA 1D gut model which consists of  a set of GutRegion objects */
class GutAnatomy {

	loadJsonAnatomy(url) {
		GutAnatomy.visibleIntstinalLayers = ['Serosa', 'Muscularis Propria', 'Submucosa', 'Mucosa', 'Lumen'];	
        if (typeof jsonAnatomy !== 'undefined') {
            GutAnatomy.anatomyData = jsonAnatomy; 
            GutAnatomy.flatAnatomy = (jsonAnatomy.children==undefined)
            return Promise.resolve();
        }
        else {
		    GutAnatomy.anatomyData = null;
	 		let anatomyFile = url
			if (url == undefined || url == null) {
				anatomyFile = Util.getCurrentScriptPath(2) + '/gca_anatomy_h_v1.json';
			}
		    return fetch(anatomyFile)
			        .then(response => response.json())
    			    .then(jsonAnatomy => {GutAnatomy.anatomyData = jsonAnatomy; GutAnatomy.flatAnatomy = (jsonAnatomy.children==undefined)})
	    		    .catch(err => console.log(`Error laoding anatomy data. ${err}`));
        }
	}
	
	getAnatomyData(id) {
//		let anatomyData = jsonPath(this.anatomyData, anatomyPath);
		let anatomyData = GutAnatomy.findAnatomyById(id);
//		console.log("******Anatomy Data: "+anatomyData)
		return anatomyData;
	}
	
	static findAnatomyById(id, anatomy=null) {
		anatomy = (anatomy==null)? GutAnatomy.anatomyData : anatomy;
		if (anatomy == null) {
			return null;
		}
		
		// new anatomy is a 1D array		
		if(this.flatAnatomy) {
			return anatomy.find(item => item.id.toUpperCase() == id.toUpperCase());
		}
		
		//old anatomy is hirarchical
		if(anatomy.doi == id) {
			return anatomy;
		}
		if(!anatomy.children) {
			return null;
		} 
		for(let child of anatomy.children) {
			let childAnatomy = GutAnatomy.findAnatomyById(id, child);
			if (childAnatomy) {
				return childAnatomy;
			}
		}
		return null;
	}	
	
	static findAnatomyByName(name, anatomy=null, exactMatch=true) {
		let anatomies  = [];
	 	GutAnatomy.findAnatomiesByName(name, anatomies, anatomy, exactMatch);
		return anatomies;
	}
		
	//Private worker method used by findAntoyByName method
	static findAnatomiesByName(name, anatomies, anatomy, exactMatch) {
		anatomy = (anatomy==null)? GutAnatomy.anatomyData : anatomy;
		if (anatomy == null) {
			return;
		}
		//flat anatomy (1D array)		
		if(this.flatAnatomy) {
//			if (exactMatch) { 
//				return anatomy.find(item => item.abbreviated_name.toUpperCase() == name.toUpperCase());
//			}
//			else {
//				return anatomy.find(item => item.abbreviated_name.toUpperCase().includes(name.toUpperCase()));
		for(let item of anatomy) {
				if (this.matchAnatomyName(item, name, exactMatch)) {
					anatomies.push(item);
				}
			}
		return;
		}
		
		//hirarchical anatomy
		if(this.matchAnatomyName(anatomy, name, exactMatch)) {
			anatomies.push(anatomy);
			return;
		}
		if(!anatomy.children) {
			return;
		} 
		for(let child of anatomy.children) {
			let childAnatomy = GutAnatomy.findAnatomiesByName(name, anatomies, child, exactMatch);
			if (childAnatomy && childAnatomy.length > 0) {
				anatomies.push(childAnatomy)
				return;
			}
		}
	}	

	static matchAnatomyName(anatomy, name, exactMatch=false) {
		if (exactMatch) {
			return  anatomy.abbreviated_name && anatomy.abbreviated_name.toUpperCase() == name.toUpperCase() ||
					anatomy.abbreviation && anatomy.abbreviation.toUpperCase() == name.toUpperCase() ||
					anatomy.displayname && anatomy.displayname.toUpperCase() == name.toUpperCase() ||
					anatomy.text && anatomy.text.toUpperCase() == name.toUpperCase() 
		}
		return  anatomy.abbreviated_name && anatomy.abbreviated_name.toUpperCase().includes(name.toUpperCase()) ||
				anatomy.abbreviation && anatomy.abbreviation.toUpperCase().includes(name.toUpperCase()) ||
				anatomy.displayname && anatomy.displayname.toUpperCase().includes(name.toUpperCase()) ||
				anatomy.text && anatomy.text.toUpperCase().includes(name.toUpperCase()); 
	}


	// returns a boolean array of existing intestine wall layers the item (e.g a region or landmark)
    static getIntestineLayers(item) {
        let anatomyNode = GutAnatomy.findAnatomyById(item.anatomy[0].id);
        let layers = [];
        for (let i = 0; i < GutAnatomy.visibleIntstinalLayers.length; i++) {
            let layer = GutAnatomy.visibleIntstinalLayers[i];
            let layerAnatomies = GutAnatomy.findAnatomyByName(layer, anatomyNode, false);
            layers[layer] = (layerAnatomies!=null && layerAnatomies.length > 0);
        }
        layers['Lumen'] = true;
		return layers;
    }


}
