import React from 'react';
import Inter_mImg from './media/Inter-M.png';
import {HTTP_HOST} from "../../../config/config";
const IntermLogoPDF = (props) => {
    return (
        <img src={HTTP_HOST + '/media/Inter-M.png'}
             className="start-interm"
             alt="inter-m"
             style={props?.big ? {} : {height: '8mm', marginTop: '0', marginBottom: '1.7mm'}}
        />
    );
};

export default IntermLogoPDF;
