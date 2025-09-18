import React from 'react';
import Inter_mSmall from "./media/INTER-M_small.png";
import {HTTP_HOST} from "../../../config/config";

const IntermLogoSmallPdf = () => {
    return (
        <img className="footer-img"
             src={HTTP_HOST + '/media/INTER-M_small.png'}
             alt="inter-m_logo"
        />
    );
};

export default IntermLogoSmallPdf;
