/**
 * Contains string enums for all features for WebViewer UI
 * @name WebViewerInstance#Feature
 * @property {string} Measurement Measurement tools that can create annotations to measure distance, perimeter and area.
 * @property {string} Annotations Render annotations in the document and be able to edit them.
 * @property {string} Download A download button to download the current document.
 * @property {string} FilePicker Ctrl/Cmd + O hotkey and a open file button that can be clicked to load local files.
 * @property {string} LocalStorage Store and retrieve tool styles from window.localStorage.
 * @property {string} NotesPanel A panel that displays information of listable annotations.
 * @property {string} Print Ctrl/Cmd + P hotkey and a print button that can be clicked to print the current document.
 * @property {string} Redaction Redaction tools that can redact text or areas. Need fullAPI to be on to use this feature.
 * @property {string} TextSelection Ability to select text in a document.
 * @property {string} TouchScrollLock Lock document scrolling in one direction in mobile devices.
 * @property {string} Copy Ability to copy text or annotations use Ctrl/Cmd + C hotkeys or the copy button.
 * @property {string} MultipleViewerMerging Ability to drag and drop pages from one instance of WebViewer into another
 * @property {string} ThumbnailMerging Ability to drag and drop a file into the thumbnail panel to merge
 * @property {string} ThumbnailReordering Ability to reorder pages using the thumbnail panel
 * @property {string} PageNavigation Ability to navigate through pages using mouse wheel, arrow up/down keys and the swipe gesture.
 * @property {string} MouseWheelZoom Ability to zoom when holding ctrl/cmd + mouse wheel.
 * @example
WebViewer(...)
  .then(function(instance) {
    var Feature = instance.Feature;
    instance.enableFeatures([Feature.Measurement]);
    instance.disableFeatures([Feature.Copy]);
  });
 */

export default {
  Measurement: 'Measurement',
  Annotations: 'Annotations',
  Download: 'Download',
  FilePicker: 'FilePicker',
  LocalStorage: 'LocalStorage',
  NotesPanel: 'NotesPanel',
  Print: 'Print',
  Redaction: 'Redaction',
  TextSelection: 'TextSelection',
  TouchScrollLock: 'TouchScrollLock',
  Copy: 'Copy',
  MultipleViewerMerging: 'MultipleViewerMerging',
  ThumbnailMerging: 'ThumbnailMerging',
  ThumbnailReordering: 'ThumbnailReordering',
  ThumbnailMultiselect: 'ThumbnailMultiselect',
  PageNavigation: 'PageNavigation',
  MouseWheelZoom: 'MouseWheelZoom',
};