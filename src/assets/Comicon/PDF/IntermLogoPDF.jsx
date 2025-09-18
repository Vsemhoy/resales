import React from 'react';
import Inter_mImg from './media/Inter-M.png';
const IntermLogoPDF = (props) => {
    return (
        <img src={Inter_mImg}
             className="start-interm"
             alt="inter-m"
             style={props?.big ? {} : {height: '8mm', marginTop: '0', marginBottom: '1.7mm'}}
        />
    );
};

export default IntermLogoPDF;
