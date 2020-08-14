import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';

import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import Input from 'components/Input';

import core from 'core';
import getClassName from 'helpers/getClassName';
import defaultTool from 'constants/defaultTool';
import actions from 'actions';
import selectors from 'selectors';
import debounce from 'lodash/debounce';

import './SearchOverlay.scss';

class SearchOverlay extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isSearchPanelOpen: PropTypes.bool,
    isSearchPanelDisabled: PropTypes.bool,
    isWildCardSearchDisabled: PropTypes.bool,
    searchValue: PropTypes.string,
    isCaseSensitive: PropTypes.bool,
    isWholeWord: PropTypes.bool,
    isSearchUp: PropTypes.bool,
    isAmbientString: PropTypes.bool,
    isWildcard: PropTypes.bool,
    isRegex: PropTypes.bool,
    results: PropTypes.arrayOf(PropTypes.object),
    activeResult: PropTypes.object,
    activeResultIndex: PropTypes.number,
    isProgrammaticSearch: PropTypes.bool,
    isProgrammaticSearchFull: PropTypes.bool,
    searchListeners: PropTypes.arrayOf(PropTypes.func),
    openElement: PropTypes.func.isRequired,
    openElements: PropTypes.func.isRequired,
    closeElement: PropTypes.func.isRequired,
    closeElements: PropTypes.func.isRequired,
    setSearchValue: PropTypes.func.isRequired,
    setActiveResult: PropTypes.func.isRequired,
    setActiveResultIndex: PropTypes.func.isRequired,
    setIsSearching: PropTypes.func.isRequired,
    resetSearch: PropTypes.func.isRequired,
    addResult: PropTypes.func.isRequired,
    setCaseSensitive: PropTypes.func.isRequired,
    setWholeWord: PropTypes.func.isRequired,
    setWildcard: PropTypes.func.isRequired,
    setNoResult: PropTypes.func.isRequired,
    setIsProgrammaticSearch: PropTypes.func.isRequired,
    setIsProgrammaticSearchFull: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    setSearchError: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.searchTextInput = React.createRef();
    this.wholeWordInput = React.createRef();
    this.caseSensitiveInput = React.createRef();
    this.wildcardInput = React.createRef();
    this.executeDebouncedSingleSearch = debounce(this.executeSingleSearch, 300);
    this.executeDebouncedFullSearch = debounce(this.executeFullSearch, 300);
    this.currentSingleSearchTerm = '';
    this.foundSingleSearchResult = false;
    this.state = {
      noResultSingleSearch: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.isProgrammaticSearch) {
      if (this.props.isSearchPanelOpen) {
        this.props.closeElement('searchPanel');
      }
      this.props.openElement('searchOverlay');
      this.clearSearchResults();
      this.executeSingleSearch();
      this.props.setIsProgrammaticSearch(false);
    } else if (this.props.isProgrammaticSearchFull) {
      this.props.openElements(['searchOverlay', 'searchPanel']);
      this.caseSensitiveInput.current.checked = this.props.isCaseSensitive;
      this.wholeWordInput.current.checked = this.props.isWholeWord;
      this.wildcardInput.current.checked = this.props.isWildcard;
      this.clearSearchResults();
      this.executeFullSearch();
      this.props.setIsProgrammaticSearchFull(false);
    }

    const searchOverlayOpened = !prevProps.isOpen && this.props.isOpen;
    if (searchOverlayOpened) {
      this.props.closeElements([
        'toolsOverlay',
        'viewControlsOverlay',
        'menuOverlay',
        'toolStylePopup',
        'signatureOverlay',
        'zoomOverlay',
        'redactionOverlay',
      ]);
      this.searchTextInput.current.focus();
      core.setToolMode(defaultTool);
    }

    const searchOverlayClosed = prevProps.isOpen && !this.props.isOpen;
    if (searchOverlayClosed) {
      this.props.closeElement('searchPanel');
      this.clearSearchResults();
    }
  }

  handleSearchError = error => {
    const { setIsSearching, setSearchError } = this.props;
    setIsSearching(false);
    if (error && error.message) {
      setSearchError(error.message);
    }
  };

  handleClickOutside = e => {
    const { closeElements, isSearchPanelOpen } = this.props;
    const clickedSearchButton = e.target.getAttribute('data-element') === 'searchButton';

    if (!isSearchPanelOpen && !clickedSearchButton) {
      closeElements(['searchOverlay']);
    }
  };

  clearSearchResults = () => {
    core.clearSearchResults();
    this.props.resetSearch();
  };

  executeFullSearch = () => {
    const {
      searchValue,
      addResult,
      setIsSearching,
      setNoResult,
      setActiveResultIndex,
    } = this.props;
    const isFullSearch = true;
    const searchMode = this.getSearchMode(isFullSearch);
    let resultIndex = -1;
    let noActiveResultIndex = true;
    let noResult = true;
    const handleSearchResult = result => {
      const foundResult =
        result.resultCode === window.CoreControls.Search.ResultCode.FOUND;
      const isSearchDone =
        result.resultCode === window.CoreControls.Search.ResultCode.DONE;

      if (foundResult) {
        resultIndex++;
        noResult = false;
        addResult(result);
        core.displayAdditionalSearchResult(result);
        if (noActiveResultIndex && this.isActiveResult(result)) {
          noActiveResultIndex = false;
          setActiveResultIndex(resultIndex);
          core.setActiveSearchResult(result);
        }
      }
      if (isSearchDone) {
        setIsSearching(false);
        setNoResult(noResult);
        this.runSearchListeners();
      }
    };

    setIsSearching(true);

    const options = {
      'fullSearch': isFullSearch,
      'onResult': handleSearchResult,
      'onPageEnd': handleSearchResult,
      'onDocumentEnd': handleSearchResult,
      'onError': this.handleSearchError.bind(this),
    };

    core.textSearchInit(searchValue, searchMode, options);
  };

  getSearchMode = (isFull = false) => {
    const {
      isCaseSensitive,
      isWholeWord,
      isWildcard,
      isRegex,
      isSearchUp,
      isAmbientString,
    } = this.props;
    const {
      CASE_SENSITIVE,
      WHOLE_WORLD,
      WILD_CARD,
      REGEX,
      PAGE_STOP,
      HIGHLIGHT,
      SEARCH_UP,
      AMBIENT_STRING,
    } = core.getSearchMode();
    let searchMode = PAGE_STOP | HIGHLIGHT;

    if (isCaseSensitive) {
      searchMode |= CASE_SENSITIVE;
    }
    if (isWholeWord) {
      searchMode |= WHOLE_WORLD;
    }
    if (isWildcard) {
      searchMode |= WILD_CARD;
    }
    if (isRegex) {
      searchMode |= REGEX;
    }
    if (isSearchUp && !isFull) {
      searchMode |= SEARCH_UP;
    }
    if (isAmbientString || isFull) {
      searchMode |= AMBIENT_STRING;
    }

    return searchMode;
  };

  isActiveResult = result => {
    const { activeResult } = this.props;

    if (!activeResult) {
      return true;
    }

    const inSamePage = activeResult.pageNum === result.pageNum;
    const hasSameCoordinates =
      Object.values(activeResult.quads[0]).toString() === Object.values(result.quads[0]).toString();

    return inSamePage && hasSameCoordinates;
  };

  executeSingleSearch = (isSearchUp = false) => {
    const { searchValue, setActiveResult, setIsSearching, addResult, resetSearch } = this.props;
    const searchMode = isSearchUp
      ? this.getSearchMode() | core.getSearchMode().SEARCH_UP
      : this.getSearchMode();
    const isFullSearch = false;

    if (this.currentSingleSearchTerm !== searchValue) {
      this.currentSingleSearchTerm = searchValue;
      this.foundSingleSearchResult = false;
      this.setState({ noResultSingleSearch: false });
      core.clearSearchResults();
    }

    resetSearch();
    const handleSearchResult = result => {
      const foundResult =
        result.resultCode === window.CoreControls.Search.ResultCode.FOUND;
      const isSearchDone =
        result.resultCode === window.CoreControls.Search.ResultCode.DONE;

      if (foundResult) {
        this.foundSingleSearchResult = true;
        addResult(result);
        core.displaySearchResult(result);
        setActiveResult(result);
        this.runSearchListeners();
      }

      if (isSearchDone) {
        core.getDocumentViewer().trigger('endOfDocumentResult', true);
        if (!this.foundSingleSearchResult) {
          this.setState({ noResultSingleSearch: true });
        }
      }
      setIsSearching(false);
    };

    setIsSearching(true);

    const options = {
      'fullSearch': isFullSearch,
      'onResult': handleSearchResult,
      'onPageEnd': handleSearchResult,
      'onDocumentEnd': handleSearchResult,
      'onError': this.handleSearchError.bind(this),
    };
    core.textSearchInit(searchValue, searchMode, options);
  };

  runSearchListeners = () => {
    const {
      searchValue,
      searchListeners,
      isCaseSensitive,
      isWholeWord,
      isWildcard,
      isRegex,
      isAmbientString,
      isSearchUp,
      results,
    } = this.props;

    searchListeners.forEach(listener => {
      listener(
        searchValue,
        {
          caseSensitive: isCaseSensitive,
          wholeWord: isWholeWord,
          wildcard: isWildcard,
          regex: isRegex,
          searchUp: isSearchUp,
          ambientString: isAmbientString,
        },
        results
      );
    });
  };

  onTransitionEnd = () => {
    if (this.props.isOpen) {
      this.searchTextInput.current.focus();
    }
  };

  onChange = e => {
    const { isSearchPanelOpen, setSearchValue } = this.props;
    const searchValue = e.target.value;

    setSearchValue(searchValue);

    if (searchValue.trim()) {
      if (isSearchPanelOpen) {
        this.clearSearchResults();
        this.executeDebouncedFullSearch();
      } else {
        this.executeDebouncedSingleSearch();
      }
    } else {
      this.clearSearchResults();
    }
  };

  onKeyDown = e => {
    const shouldOpenSearchPanel =
      !this.props.isSearchPanelDisabled && (e.metaKey || e.ctrlKey) && e.which === 13;

    if (e.shiftKey && e.which === 13) {
      // Shift + Enter
      this.onClickPrevious(e);
    } else if (shouldOpenSearchPanel) {
      // (Cmd/Ctrl + Enter)
      this.onClickOverflow(e);
    } else if (e.which === 13) {
      // Enter
      this.onClickNext(e);
    }
  };

  onClickNext = e => {
    e.preventDefault();
    const { isSearchPanelOpen, activeResultIndex, results, setActiveResultIndex } = this.props;

    if (isSearchPanelOpen) {
      if (results.length === 0) {
        return;
      }
      const nextResultIndex = activeResultIndex === results.length - 1 ? 0 : activeResultIndex + 1;
      setActiveResultIndex(nextResultIndex);
      core.setActiveSearchResult(results[nextResultIndex]);
    } else {
      this.executeSingleSearch();
    }
  };

  onClickPrevious = e => {
    e.preventDefault();
    const { isSearchPanelOpen, activeResultIndex, results, setActiveResultIndex } = this.props;

    if (isSearchPanelOpen) {
      if (results.length === 0) {
        return;
      }
      const prevResultIndex = activeResultIndex <= 0 ? results.length - 1 : activeResultIndex - 1;
      setActiveResultIndex(prevResultIndex);
      core.setActiveSearchResult(results[prevResultIndex]);
    } else {
      const isSearchUp = true;
      this.executeSingleSearch(isSearchUp);
    }
  };

  onClickOverflow = () => {
    const { activeResult, openElement, setActiveResult } = this.props;

    openElement('searchPanel');
    this.clearSearchResults();
    setActiveResult(activeResult);
    this.executeFullSearch();
  };

  onChangeCaseSensitive = e => {
    this.props.setCaseSensitive(e.target.checked);
    this.clearSearchResults();
    this.executeDebouncedFullSearch();
  };

  onChangeWholeWord = e => {
    this.props.setWholeWord(e.target.checked);
    this.clearSearchResults();
    this.executeDebouncedFullSearch();
  };

  onChangeWildcard = e => {
    this.props.setWildcard(e.target.checked);
    this.clearSearchResults();
    this.executeDebouncedFullSearch();
  };

  render() {
    const {
      isDisabled,
      t,
      isSearchPanelOpen,
      isSearchPanelDisabled,
      results,
      searchValue,
      activeResultIndex,
      isWildCardSearchDisabled,
    } = this.props;

    if (isDisabled) {
      return null;
    }

    const className = getClassName(
      `Overlay SearchOverlay ${isSearchPanelOpen ? 'transformed' : ''}`,
      this.props
    );

    return (
      <div
        className={className}
        data-element="searchOverlay"
        onTransitionEnd={this.onTransitionEnd}
      >
        <div className="wrapper">
          <div className="main">
            <div className="input-wrapper">
              <input
                ref={this.searchTextInput}
                type="text"
                autoComplete="off"
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                value={searchValue}
              />
            </div>
            <div className="number-of-results">
              {isSearchPanelOpen && <div>{`${activeResultIndex + 1} / ${results.length}`}</div>}
            </div>
            <div className="button previous" onClick={this.onClickPrevious}>
              <Icon glyph="ic_chevron_left_black_24px" />
            </div>
            <div className="button next" onClick={this.onClickNext}>
              <Icon glyph="ic_chevron_right_black_24px" />
            </div>
            <Tooltip content="action.showMoreResults">
              <div
                className={`advanced ${isSearchPanelOpen || isSearchPanelDisabled ? 'hidden' : ''}`}
                onClick={this.onClickOverflow}
              >
                <Icon glyph="ic_overflow_black_24px" />
              </div>
            </Tooltip>
          </div>
          <div className={`options ${isSearchPanelOpen ? 'visible' : ''}`}>
            <div className="search-option">
              <Input
                dataElement="caseSensitiveSearchOption"
                id="case-sensitive-option"
                type="checkbox"
                ref={this.caseSensitiveInput}
                onChange={this.onChangeCaseSensitive}
                label={t('option.searchPanel.caseSensitive')}
              />
            </div>
            <div className="search-option">
              <Input
                dataElement="wholeWordSearchOption"
                id="whole-word-option"
                type="checkbox"
                ref={this.wholeWordInput}
                onChange={this.onChangeWholeWord}
                label={t('option.searchPanel.wholeWordOnly')}
              />
            </div>
            {!isWildCardSearchDisabled && (
              <div className="search-option" data-element="wildCardSearchOption">
                <Input
                  dataElement="wildCardSearchOption"
                  id="wild-card-option"
                  type="checkbox"
                  ref={this.wildcardInput}
                  onChange={this.onChangeWildcard}
                  label={t('option.searchPanel.wildcard')}
                />
              </div>
            )}
          </div>
          {!isSearchPanelOpen && this.state.noResultSingleSearch && searchValue !== '' && (
            <div className="no-result">{t('message.noResults')}</div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isSearchPanelOpen: selectors.isElementOpen(state, 'searchPanel'),
  isSearchPanelDisabled: selectors.isElementDisabled(state, 'searchPanel'),
  searchValue: selectors.getSearchValue(state),
  isCaseSensitive: selectors.isCaseSensitive(state),
  isWholeWord: selectors.isWholeWord(state),
  isAmbientString: selectors.isAmbientString(state),
  isSearchUp: selectors.isSearchUp(state),
  isWildcard: selectors.isWildcard(state),
  isRegex: selectors.isRegex(state),
  results: selectors.getResults(state),
  activeResult: selectors.getActiveResult(state),
  activeResultIndex: selectors.getActiveResultIndex(state),
  isProgrammaticSearch: selectors.isProgrammaticSearch(state),
  isProgrammaticSearchFull: selectors.isProgrammaticSearchFull(state),
  searchListeners: selectors.getSearchListeners(state),
  isDisabled: selectors.isElementDisabled(state, 'searchOverlay'),
  isOpen: selectors.isElementOpen(state, 'searchOverlay'),
});

const mapDispatchToProps = {
  openElement: actions.openElement,
  openElements: actions.openElements,
  closeElement: actions.closeElement,
  closeElements: actions.closeElements,
  setSearchValue: actions.setSearchValue,
  setActiveResult: actions.setActiveResult,
  setActiveResultIndex: actions.setActiveResultIndex,
  setIsSearching: actions.setIsSearching,
  resetSearch: actions.resetSearch,
  addResult: actions.addResult,
  setCaseSensitive: actions.setCaseSensitive,
  setWholeWord: actions.setWholeWord,
  setWildcard: actions.setWildcard,
  setNoResult: actions.setNoResult,
  setSearchError: actions.setSearchError,
  setIsProgrammaticSearch: actions.setIsProgrammaticSearch,
  setIsProgrammaticSearchFull: actions.setIsProgrammaticSearchFull,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(onClickOutside(SearchOverlay)));