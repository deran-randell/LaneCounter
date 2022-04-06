import React from "react";
import { SideBarData } from './SideBarData'
import style from './SideBar.module.css';
import NavItem from './NavItem.js';

export default function SideBar(props) {

    return (
      <>
        <div className="cad">
            <p>
              CYBICOM ATLAS DEFENCE
            </p>
            Moth Lane Counter
            <p></p>
        </div>
  
        <nav className={style.sidebar}>
            {SideBarData.map((item, index) => {
              return <NavItem key={`${item.label}-${index}`} item={item} />;
            })}
        </nav>
  
      </>
    );
}