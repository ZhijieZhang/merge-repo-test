/**
 * Return the current zoom level
 * @method WebViewer#getZoomLevel
 * @return {number} Zoom level (0 ~ 1)
 * @example // 5.1 and after
WebViewer(...)
  .then(function(instance) {
    var docViewer = instance.docViewer;

    // you must have a document loaded when calling this api
    docViewer.on('documentLoaded', function() {
      console.log(instance.getZoomLevel());
    });
  });
 * @example // 4.0 ~ 5.0
var viewerElement = document.getElementById('viewer');
var viewer = new PDFTron.WebViewer(...);

viewerElement.addEventListener('ready', function() {
  var instance = viewer.getInstance();
  var docViewer = instance.docViewer;

  // you must have a document loaded when calling this api
  docViewer.on('documentLoaded', function() {
    console.log(instance.getZoomLevel());
  });
});
 */

import core from 'core';

export default () => core.getZoom();
