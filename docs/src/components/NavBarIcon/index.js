import React from "react";
import * as Icon from 'react-feather';

export const NavbarIcon = (prop) => { 
    const { iconName, ...props } = prop;
    const IconComponent = Icon[`${iconName}`];
    return <IconComponent {...props} />
}