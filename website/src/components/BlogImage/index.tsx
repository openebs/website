import React, { SyntheticEvent } from 'react';

interface BlogImg {
  imgPath : string;
  alt: string;
  className?: string;
}

const BlogImage: React.FC<BlogImg> = ({ imgPath, alt, ...props }) => {
  function addDefaultSrc(e: SyntheticEvent<HTMLImageElement, Event>) {
    /**
     * The browser will be stuck in an endless loop if the onerror image itself generates an error.
     * Thats the reason we have the e.currentTarget.onerror=null in the function
     * ref: https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#element.onerror
    */
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/images/blog/defaultImage.png'; // setting the fallback src
  }
  return (
    <>
      <img
        loading="lazy"
        onError={(e) => { addDefaultSrc(e); }}
        alt={alt}
        src={imgPath}
        {...props}
      />
    </>
  );
};

export default BlogImage;
