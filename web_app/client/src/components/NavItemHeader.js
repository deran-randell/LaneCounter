import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/outline';
import style from './NavItem.module.css';

const resolveLinkPath = (childTo, parentTo) => `${parentTo}/${childTo}`;

const NavItemHeader = props =>
{
  const { item } = props;

  const { title, Icon, path: headerToPath, children } = item;
  const location = useLocation();

  const [ expanded, setExpand ] = useState(
    location.pathname.includes(headerToPath)
  );

  const onExpandChange = e =>
  {
    e.preventDefault();
    setExpand(expanded => !expanded);
  };

  return (
    <>
      <button
        className={`${style.navItem} ${style.navItemHeaderButton}`}
        onClick={onExpandChange}
      >
        <Icon className={style.navIcon} />
        <span className={style.navLabel}>{title}</span>
        <ChevronDownIcon
          className={`${style.navItemHeaderChevron} ${expanded && style.chevronExpanded
            }`}
        />
      </button>

      {expanded && (
        <div className={style.navChildrenBlock}>
          {children.map((item, index) =>
          {
            const key = `${item.title}-${index}`;

            const { title, Icon, children } = item;

            if (children)
            {
              return (
                <div key={key}>
                  <NavItemHeader
                    item={{
                      ...item,
                      to: resolveLinkPath(item.path, props.item.path),
                    }}
                  />
                </div>
              );
            }

            return (
              <NavLink
                key={key}
                to={resolveLinkPath(item.path, props.item.path)}
                className={style.navItem}
                activeclassname={style.activeNavItem}
              >
                <Icon className={style.navIcon} />
                <span className={style.navLabel}>{title}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </>
  );
};

export default NavItemHeader;