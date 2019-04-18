/**
 * Enables notes panel feature, affecting any elements related to notes panel.
 * @method WebViewer#enableNotesPanel
 * @example const viewerElement = document.getElementById('viewer');
const instance = await WebViewer({ ... }, viewerElement);

instance.enableNotesPanel();
 */

import disableNotesPanel from './disableNotesPanel';
import { PRIORITY_TWO } from 'constants/actionPriority';
import actions from 'actions';

export default store => (enable = true) =>  {
  if (enable) {
    store.dispatch(actions.enableElements(['annotationCommentButton', 'notesPanelButton', 'notesPanel'], PRIORITY_TWO));
    store.dispatch(actions.setActiveLeftPanel('notesPanel'));
  } else {
  console.warn('enableNotesPanel(false) is deprecated, please use disableNotesPanel() instead');
    disableNotesPanel(store)();
  }
};