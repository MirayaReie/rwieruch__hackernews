import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import './App.css';

const DEFAULT_QUERY = 'ES6';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '10';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  DATE: list => list, // TODO!!!!
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false
    };

    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSort = this.onSort.bind(this);
  }

  onSort(sortKey) {
    const isSortReverse =
      this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  needsToSearchTopstories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopstories(result) {
    const { hits, page } = result;
    const { results, searchKey } = this.state;

    const oldHits =
      results && results[searchKey] ? results[searchKey].hits : [];

    const updatedHits = [...oldHits, ...hits];
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      },
      isLoading: false
    });
  }

  fetchSearchTopstories(searchTerm, page) {
    this.setState({ isLoading: true });
    fetch(
      `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then(response => response.json())
      .then(result => {
        this.setSearchTopstories(result);
      })
      .catch(e => e);
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }

    event.preventDefault();
  }

  onDismiss(id) {
    const { results, searchKey } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  render() {
    const {
      results,
      searchKey,
      searchTerm,
      isLoading,
      sortKey,
      isSortReverse
    } = this.state;
    const page =
      (results && results[searchKey] && results[searchKey].page) || 0;
    const list =
      (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <Table
          list={list}
          sortKey={sortKey}
          isSortReverse={isSortReverse}
          onDismiss={this.onDismiss}
          onSort={this.onSort}
        />
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}
          >
            More
          </ButtonWithLoading>
        </div>
      </div>
    );
  }
}

const Button = ({ onClick, className = '', children }) =>
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>;

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

class Search extends Component {
  componentDidMount() {
    this.input.focus();
  }

  render() {
    const { value, onChange, onSubmit, children } = this.props;
    return (
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={value}
          onChange={onChange}
          ref={node => {
            this.input = node;
          }}
        />
        <button type="submit">
          {children}
        </button>
      </form>
    );
  }
}

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

const Sort = ({ sortKey, activeSortKey, onSort, children }) => {
  const sortClass = ['button-inline'];
  if (sortKey === activeSortKey) {
    sortClass.push('button-active');
  }
  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass.join(' ')}>
      {children}
    </Button>
  );
};

const Table = ({ list, sortKey, isSortReverse, onSort, onDismiss }) => {
  const sortedList = isSortReverse
    ? SORTS[sortKey](list).reverse()
    : SORTS[sortKey](list);
  return (
    <div className="table">
      <div className="table-header">
        <span style={{ width: '40%' }}>
          <Sort sortKey={'TITLE'} onSort={onSort} activeSortKey={sortKey}>
            Title
          </Sort>
        </span>
        <span style={{ width: '20%' }}>
          <Sort sortKey={'AUTHOR'} onSort={onSort} activeSortKey={sortKey}>
            Author
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort sortKey={'DATE'} onSort={onSort} activeSortKey={sortKey}>
            Date
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort sortKey={'COMMENTS'} onSort={onSort} activeSortKey={sortKey}>
            Comments
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort sortKey={'POINTS'} onSort={onSort} activeSortKey={sortKey}>
            Points
          </Sort>
        </span>
        <span style={{ width: '10%' }}>Archive</span>
      </div>
      {sortedList.map(item =>
        <div key={item.objectID} className="table-row">
          <span style={{ width: '40%' }}>
            <a href={item.url}>
              {item.title}
            </a>
          </span>
          <span style={{ width: '20%' }}>
            {item.author}
          </span>
          <span style={{ width: '10%' }}>
            {item.created_at.substr(0, 10)}
          </span>
          <span style={{ width: '10%' }}>
            {item.num_comments}
          </span>
          <span style={{ width: '10%' }}>
            {item.points}
          </span>
          <span style={{ width: '10%' }}>
            <Button
              onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Dismiss
            </Button>
          </span>
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      title: PropTypes.string,
      author: PropTypes.string,
      created_at: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired
};

const Loading = () => <div>Loading...</div>;

const withLoading = Component => ({ isLoading, ...rest }) =>
  isLoading ? <Loading /> : <Component {...rest} />;

const ButtonWithLoading = withLoading(Button);

export default App;

export { Button, Search, Table };
