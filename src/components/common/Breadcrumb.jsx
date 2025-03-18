import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/breadcrumb.css';

const Breadcrumb = ({ items }) => {
  return (
    <div className="breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          {index === items.length - 1 ? (
            <span className="breadcrumb-current">{item.label}</span>
          ) : (
            <Link to={item.path} className="breadcrumb-link">
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;