import React from 'react';
import Button from './Button';

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

export default Sort;
