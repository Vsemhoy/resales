import { InputNumber } from "antd";
import {useEffect, useState} from "react";
// import style from "../styles/main.module.css";

const Count = ({ count, disabled, index, EDITMODE, update_local_state }) => {
    const [count1, setCount1] = useState(1);

    useEffect(() => {
        setCount1(count);
    }, [count]);
    return (
        <InputNumber
            min={1}
            disabled={disabled || EDITMODE}
            value={count1}
            size={"small"}
            variant={"outlined"}
            style={{ width: "80px" }}
            onChange={(e) => update_local_state("count", e, index)}
        />
    );
};

export default Count;
