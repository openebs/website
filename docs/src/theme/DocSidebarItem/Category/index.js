/**
 * Swizzled from @docusaurus/theme-classic.
 * Extended to support icon rendering via item.customProps.icon
 * (uses lucide-react icon names, e.g. "Server", "Book", "Settings").
 */
import React, { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { ThemeClassNames, useThemeConfig, usePrevious, Collapsible, useCollapsible, } from '@docusaurus/theme-common';
import { isSamePath } from '@docusaurus/theme-common/internal';
import { isActiveSidebarItem, findFirstSidebarItemLink, useDocSidebarItemsExpandedState, useVisibleSidebarItems, } from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import { translate } from '@docusaurus/Translate';
import useIsBrowser from '@docusaurus/useIsBrowser';
import DocSidebarItems from '@theme/DocSidebarItems';
import DocSidebarItemLink from '@theme/DocSidebarItem/Link';
import * as LucideIcons from 'lucide-react';
import styles from './styles.module.css';
function getSidebarIcon(customProps) {
    const iconName = customProps?.icon;
    if (typeof iconName !== 'string')
        return null;
    const Icon = LucideIcons[iconName];
    if (typeof Icon !== 'function')
        return null;
    return Icon;
}
// If we navigate to a category and it becomes active, it should automatically
// expand itself
function useAutoExpandActiveCategory({ isActive, collapsed, updateCollapsed, activePath, }) {
    const wasActive = usePrevious(isActive);
    const previousActivePath = usePrevious(activePath);
    useEffect(() => {
        const justBecameActive = isActive && !wasActive;
        const stillActiveButPathChanged = isActive && wasActive && activePath !== previousActivePath;
        if ((justBecameActive || stillActiveButPathChanged) && collapsed) {
            updateCollapsed(false);
        }
    }, [
        isActive,
        wasActive,
        collapsed,
        updateCollapsed,
        activePath,
        previousActivePath,
    ]);
}
/**
 * When a collapsible category has no link, we still link it to its first child
 * during SSR as a temporary fallback. This allows to be able to navigate inside
 * the category even when JS fails to load, is delayed or simply disabled
 * React hydration becomes an optional progressive enhancement
 * see https://github.com/facebookincubator/infima/issues/36#issuecomment-772543188
 * see https://github.com/facebook/docusaurus/issues/3030
 */
function useCategoryHrefWithSSRFallback(item) {
    const isBrowser = useIsBrowser();
    return useMemo(() => {
        if (item.href && !item.linkUnlisted) {
            return item.href;
        }
        if (isBrowser || !item.collapsible) {
            return undefined;
        }
        return findFirstSidebarItemLink(item);
    }, [item, isBrowser]);
}
function CollapseButton({ collapsed, categoryLabel, onClick, }) {
    return (<button aria-label={collapsed
            ? translate({
                id: 'theme.DocSidebarItem.expandCategoryAriaLabel',
                message: "Expand sidebar category '{label}'",
                description: 'The ARIA label to expand the sidebar category',
            }, { label: categoryLabel })
            : translate({
                id: 'theme.DocSidebarItem.collapseCategoryAriaLabel',
                message: "Collapse sidebar category '{label}'",
                description: 'The ARIA label to collapse the sidebar category',
            }, { label: categoryLabel })} aria-expanded={!collapsed} type="button" className="clean-btn menu__caret" onClick={onClick}/>);
}
function CategoryLinkLabel({ label, icon, }) {
    return (<span title={label} className={styles.categoryLinkLabel}>
      {icon && React.createElement(icon, { size: 16, className: styles.categoryIcon })}
      {label}
    </span>);
}
export default function DocSidebarItemCategory(props) {
    const visibleChildren = useVisibleSidebarItems(props.item.items, props.activePath);
    if (visibleChildren.length === 0) {
        return <DocSidebarItemCategoryEmpty {...props}/>;
    }
    else {
        return <DocSidebarItemCategoryCollapsible {...props}/>;
    }
}
function isCategoryWithHref(category) {
    return typeof category.href === 'string';
}
// If a category doesn't have any visible children, we render it as a link
function DocSidebarItemCategoryEmpty({ item, ...props }) {
    if (!isCategoryWithHref(item)) {
        return null;
    }
    const { type, collapsed, collapsible, items, linkUnlisted, ...forwardableProps } = item;
    const linkItem = {
        type: 'link',
        href: forwardableProps.href ?? '',
        ...forwardableProps,
    };
    return <DocSidebarItemLink item={linkItem} {...props}/>;
}
function DocSidebarItemCategoryCollapsible({ item, onItemClick, activePath, level, index, ...props }) {
    const { items, label, collapsible, className, href } = item;
    const { docs: { sidebar: { autoCollapseCategories }, }, } = useThemeConfig();
    const hrefWithSSRFallback = useCategoryHrefWithSSRFallback(item);
    const isActive = isActiveSidebarItem(item, activePath);
    const isCurrentPage = isSamePath(href, activePath);
    const { collapsed, setCollapsed } = useCollapsible({
        initialState: () => {
            if (!collapsible) {
                return false;
            }
            return isActive ? false : item.collapsed;
        },
    });
    const { expandedItem, setExpandedItem } = useDocSidebarItemsExpandedState();
    const updateCollapsed = (toCollapsed = !collapsed) => {
        setExpandedItem(toCollapsed ? null : index);
        setCollapsed(toCollapsed);
    };
    useAutoExpandActiveCategory({
        isActive,
        collapsed,
        updateCollapsed,
        activePath,
    });
    useEffect(() => {
        if (collapsible &&
            expandedItem != null &&
            expandedItem !== index &&
            autoCollapseCategories) {
            setCollapsed(true);
        }
    }, [collapsible, expandedItem, index, setCollapsed, autoCollapseCategories]);
    const icon = getSidebarIcon(item.customProps);
    const handleItemClick = (e) => {
        onItemClick?.(item);
        if (collapsible) {
            if (href) {
                if (isCurrentPage) {
                    e.preventDefault();
                    updateCollapsed();
                }
                else {
                    updateCollapsed(false);
                }
            }
            else {
                e.preventDefault();
                updateCollapsed();
            }
        }
    };
    return (<li className={clsx(ThemeClassNames.docs.docSidebarItemCategory, ThemeClassNames.docs.docSidebarItemCategoryLevel(level), 'menu__list-item', {
            'menu__list-item--collapsed': collapsed,
        }, className)}>
      <div className={clsx('menu__list-item-collapsible', {
            'menu__list-item-collapsible--active': isCurrentPage,
        })}>
        <Link className={clsx(styles.categoryLink, 'menu__link', {
            'menu__link--sublist': collapsible,
            'menu__link--sublist-caret': !href && collapsible,
            'menu__link--active': isActive,
        })} onClick={handleItemClick} aria-current={isCurrentPage ? 'page' : undefined} role={collapsible && !href ? 'button' : undefined} aria-expanded={collapsible && !href ? !collapsed : undefined} href={collapsible ? hrefWithSSRFallback ?? '#' : hrefWithSSRFallback} {...props}>
          <CategoryLinkLabel label={label} icon={icon}/>
        </Link>
        {href && collapsible && (<CollapseButton collapsed={collapsed} categoryLabel={label} onClick={(e) => {
                e.preventDefault();
                updateCollapsed();
            }}/>)}
      </div>

      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        <DocSidebarItems items={items} tabIndex={collapsed ? -1 : 0} onItemClick={onItemClick} activePath={activePath} level={level + 1}/>
      </Collapsible>
    </li>);
}
