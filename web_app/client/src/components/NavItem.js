import React from 'react';
import { NavLink } from 'react-router-dom';
import style from './NavItem.module.css';
import NavItemHeader from './NavItemHeader.js';

const NavItem = props => {

  const { title, path, Icon, children } = props.item;

  if (children) {
    return <NavItemHeader item={props.item} />;
  }

  return (
    <NavLink
      exact="true"
      to={path}
      className={style.navItem}
      activeclassname={style.activeNavItem}
    >
      <Icon className={style.navIcon} />
      <span className={style.navLabel}>{title}</span>
    </NavLink>
  );
};

export default NavItem;
