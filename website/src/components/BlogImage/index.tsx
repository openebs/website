import React, {useState} from "react";

interface BlogImg {
  imgPath : string;
  alt: string;
  className?: string;
}

const BlogImage: React.FC<BlogImg> = ({ imgPath, alt, ...props }) => {
  const  [defaultImage, setDefaultImageState] = useState(false);
  return (
    <>
      <img
        loading="lazy"
        onError={() => setDefaultImageState(true)}
        alt={alt}
        src={
          defaultImage
            ? `/images/blog/defaultImage.png`
            : imgPath
        }
        {...props}
      />
    </>
  );
};

export default BlogImage;
