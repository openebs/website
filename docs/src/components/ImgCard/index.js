import React from "react";
import Link from '@docusaurus/Link';
import styles from "./index.module.scss";

function ImgCard({ dataList }) {
  return (
    <div className={styles.wrapper}>
      {dataList.map((data) => {
        return (
          <Link to={data?.url} key={data?.title} className={styles.link}>
            <img src={data?.Svg} className={styles.img} />
            <span>{data?.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default ImgCard;
