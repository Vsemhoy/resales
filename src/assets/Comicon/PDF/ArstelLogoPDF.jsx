import React from 'react';
import ArstelImg from './media/ARSTEL.png';
import {HTTP_HOST, HTTP_ROOT} from "../../../config/config";
const ArstelLogoPDF = () => {

    console.log('Arstel image path:', ArstelImg);

    return (
        <img className="start-arstel" src={HTTP_HOST + '/media/ARSTEL.png'} alt="arstel"/>
    );
};

export default ArstelLogoPDF;
