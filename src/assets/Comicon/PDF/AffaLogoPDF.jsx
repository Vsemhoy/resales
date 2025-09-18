import React from 'react';
import AffaImg from './media/Affa_logo.png';
import {HTTP_HOST} from "../../../config/config";
const AffaLogoPDF = () => {
    return (
        <img src={HTTP_HOST + '/media/Affa_logo.png'}
             alt="affa"
             style={{marginRight: '10px', marginTop: '2mm', height: '10mm'}}
        />
    );
};

export default AffaLogoPDF;
