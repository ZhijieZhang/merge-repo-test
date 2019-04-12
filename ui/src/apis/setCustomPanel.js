/**
 * Adds a custom panel in left panel
 * @method CoreControls.ReaderControl#setCustomPanel
 * @param {object} options
 * @param {object} options.tab Tab options.
 * @param {string} options.tab.dataElement data-element for tab.
 * @param {string} options.tab.title Tooltip for tab.
 * @param {string} options.tab.img Url for an image.
 * @param {object} options.panel Panel options.
 * @param {string} options.panel.dataElement data-element for panel.
 * @param {CoreControls.ReaderControl~renderCustomPanel} options.panel.render Function that returns panel element.
 * @example viewerElement.addEventListener('ready', () => {
  const instance = viewer.getInstance();
  instance.setCustomPanel({
    tab:{
      dataElement: 'customPanelTab',
      title: 'customPanelTab',
      img: 'https://www.pdftron.com/favicon-32x32.png',
    },
    panel: {
      dataElement: 'customPanel',
      render: () => {
        const div = document.createElement('div');
        div.innerHTML = 'Hello World';
        return div;
      }
    }
  });
});
 */
/**
 * Callback that gets passed to `options.panel.render` in {@link CoreControls.ReaderControl#setCustomPanel setCustomPanel}.
 * @callback CoreControls.ReaderControl~renderCustomPanel
 * @returns {HTMLElement} Panel element.
 */

import actions from 'actions';

export default store => customPanel => {
  store.dispatch(actions.setCustomPanel(customPanel));
};