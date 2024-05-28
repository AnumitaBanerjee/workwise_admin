import React from 'react'
import FullLoading from '../loading/FullLoading';

const NestedCategory = (props) => {
  const { allCategories, listLoading, handleUpdateCategory, handleDeleteCat } = props;

  const renderAccordion = (items, parentAccordionId) => {
    return items.map((item) => (
      <div key={item.id} className="accordion-item">
        <h2 className="accordion-header" id={`heading-${item.id}`}>
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${item.id}`}
            aria-expanded="true"
            aria-controls={`collapse-${item.id}`}
          >
            {item.title}
          </button>
        </h2>
        <div
          id={`collapse-${item.id}`}
          className="accordion-collapse collapse"
          aria-labelledby={`heading-${item.id}`}
          data-bs-parent={`#${parentAccordionId}`}
        >
          <div className="accordion-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <table className="table table-striped table-hover">
                  <thead>
                    <th>ID</th>
                    <th>Slug</th>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{item.id}</td>
                      <td>{item.slug}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="actionStyle">
                <span
                  className="fa fa-edit mr-3"
                  onClick={() => handleUpdateCategory(item)}
                ></span>
                <span
                  className="fa fa-trash"
                  onClick={(e) => handleDeleteCat(e, item)}
                ></span>
              </div>
            </div>
            {item.children && renderAccordion(item.children, `nested-accordion-${item.id}`)}
          </div>
        </div>
      </div>
    ));
  };

  if (listLoading) {
    return <FullLoading />;
  }

  return (
    <div className="accordion w-100" id="nested-accordion">
      {allCategories?.map((item, idx) => (
        <div key={item.id} className="accordion-item">
          <h2 className="accordion-header" id={`heading-${item.id}`}>
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse-${item.id}`}
            >
              {`${item.title}`}
            </button>
          </h2>
          <div
            id={`collapse-${item.id}`}
            className="accordion-collapse collapse"
            aria-labelledby={`heading-${item.id}`}
            data-bs-parent="#nested-accordion"
          >
            <div className="accordion-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <table className="table table-striped table-hover">
                    <thead>
                      <th>ID</th>
                      <th>Slug</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{item.id}</td>
                        <td>{item.slug}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="actionStyle">
                  <span
                    className="fa fa-edit mr-3"
                    onClick={() => handleUpdateCategory(item)}
                  ></span>
                  <span
                    className="fa fa-trash"
                    onClick={(e) => handleDeleteCat(e, item)}
                  ></span>
                </div>
              </div>
              {item.children && (
                <div className="accordion" id={`nested-accordion-${item.id}`}>
                  {renderAccordion(item.children, `nested-accordion-${item.id}`)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NestedCategory