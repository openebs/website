import React from 'react';
import DocSidebarItemCategoryOriginal from '@theme-original/DocSidebarItem/Category';
import { NavbarIcon } from '@site/src/components/NavBarIcon';
import styles from './styles.module.css';

export default function DocSidebarItemCategory({ item, ...rest }) {
  const iconName = item?.customProps?.icon;

  if (!iconName) {
    return <DocSidebarItemCategoryOriginal item={item} {...rest} />;
  }

  const modifiedItem = {
    ...item,
    label: (
      <span className={styles.categoryLabel}>
        <NavbarIcon iconName={iconName} size="16" className={styles.categoryIcon} />
        {item.label}
      </span>
    ),
  };

  return <DocSidebarItemCategoryOriginal item={modifiedItem} {...rest} />;
}
