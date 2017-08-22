import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import App from './App';
import Search from './components/Search';
import Table from './components/Table';
import Button from './components/Button';

// for refs testing
function createNodeMock(element) {
  if (element.type === 'input') {
    return { focus() {} };
  }
  return null;
}

describe('App', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
  });

  test('snapshot', () => {
    const options = { createNodeMock };
    const component = renderer.create(<App />, options);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Search', () => {
  it('renders', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Search onChange={Function} onSubmit={Function}>
        Search
      </Search>,
      div
    );
  });

  test('snapshot', () => {
    const options = { createNodeMock };
    const component = renderer.create(
      <Search onChange={Function} onSubmit={Function}>
        Search
      </Search>,
      options
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Button', () => {
  it('renders', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button onClick={Function}>Click</Button>, div);
  });

  test('snapshot', () => {
    const component = renderer.create(
      <Button onClick={Function}>Click</Button>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Table', () => {
  const props = {
    onDismiss: () => {},
    list: [
      {
        title: '1',
        author: '1',
        num_comments: 1,
        points: 1,
        objectID: 'x',
        created_at: '1913-07-07'
      },
      {
        title: '2',
        author: '2',
        num_comments: 2,
        points: 2,
        objectID: 'y',
        created_at: '1913-07-07'
      },
      {
        title: '3',
        author: '3',
        num_comments: 3,
        points: 3,
        objectID: 'z',
        created_at: '1913-07-07'
      }
    ],
    sortKey: 'TITLE',
    isSortReverse: false
  };

  it('renders', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Table {...props} />, div);
  });

  test('snapshot', () => {
    const component = renderer.create(<Table {...props} />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows two items in list', () => {
    const element = shallow(<Table {...props} />);
    expect(element.find('.table-row').length).toBe(3);
  });
});
