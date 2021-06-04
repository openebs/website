import React from "react";
import Link from '@docusaurus/Link';

function ImgCard({ dataList }) {
  return (
    <div className="img-wrapper">
      {dataList.map((data) => {
        return (
          <Link className="img-block" to={data?.url} key={data?.title}>
            <img src={data?.Svg} />
            <span>{data?.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default ImgCard;
