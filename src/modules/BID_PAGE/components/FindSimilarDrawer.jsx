import React from 'react';
import {PRODMODE} from "../../../config/config";
import {Drawer} from "antd";

const FindSimilarDrawer = (props) => {
    return (
        <Drawer
            title={`Поиск похожих заявок`}
            placement="right"
            width={600}
            onClose={() => props.closeDrawer()}
            open={props.isOpenDrawer}
        >

        </Drawer>
    );
};

export default FindSimilarDrawer;
