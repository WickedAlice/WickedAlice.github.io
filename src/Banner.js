import React from 'react';

const LAYOUT_OPTIONS = {
  vertical: 'vertical',
  horizontal: 'horizontal'
}

function Banner({ data, layout }) {

  layout = layout || LAYOUT_OPTIONS.vertical;
  const { title, image, text } = data;

  return (
    (layout === LAYOUT_OPTIONS.vertical)
      ? <div className="Banner-vertical">
        <div className="Banner-header">
          <span>Explore context</span>
          <div className="Banner-header-icon"/>
        </div>
        <div className="Banner-title">
          {title}
        </div>
        <img src={image} className="Banner-map" alt="Banner-map"/>
        <div className="Banner-text">
          {text}
        </div>
      </div>
      : <div className="Banner-horizontal">
        <div className="Banner-info">
          <div className="Banner-header">
            <span>Explore context</span>
            <div className="Banner-header-icon"/>
          </div>
          <div className="Banner-title">
            {title}
          </div>
          <div className="Banner-text">
            {text}
          </div>
        </div>
        <img src={image} className="Banner-map" alt="Banner-map"/>

      </div>

  );
}

export default Banner;
