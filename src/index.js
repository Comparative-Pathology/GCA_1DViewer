
import './css/GCA_1DViewer.css'
import './modules/GCA_Utilities/external/jquery-ui/jquery-ui.min.css';
import './modules/GCA_Utilities/src/GCA_Utilities.css';
import './help/help.css';

import rawHelpContent from './help/help.md'

import anatomyData from './gca_anatomy_h_v1.json'

window.rawHelpContent = rawHelpContent;
window.viewer1dIcons = importAll(require.context('./Icons', false, /\.svg$/));
window.jsonAnatomy = anatomyData;
window.helpImages = importAll(require.context('./help/images', false, /\.png$/));
window.cssImported = true;

function importAll(r) {
  let images = {};
//  r.keys().forEach((key) => { images[key.replace('./', '')] = r(key); });
  r.keys().map((item) => { images[item.replace('./', '')] = r(item); });
  return images;
}

export { Viewer1D } from './Viewer1D.js'
