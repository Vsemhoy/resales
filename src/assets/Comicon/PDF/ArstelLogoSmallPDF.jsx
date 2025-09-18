import React from 'react';
import ArstelSmall from "./media/ARSTEL_small.png";
import {HTTP_HOST} from "../../../config/config";

const ArstelLogoSmallPdf = () => {
    return (
        <img className="footer-img"
             src={HTTP_HOST + '/media/ARSTEL_small.png'}
             alt="arstel_logo"
        />
    );
};

export default ArstelLogoSmallPdf;
