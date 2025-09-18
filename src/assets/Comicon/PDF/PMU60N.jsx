import React from 'react';
import pmu60n from "./media/pmu60n.png";
import {HTTP_HOST} from "../../../config/config";

const Pmu60N = () => {
    return (
        <img src={HTTP_HOST + '/media/pmu60n.png'}
             className="start-photo"
             alt="Pmu60N"
        />
    );
};

export default Pmu60N;
