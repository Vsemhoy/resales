import React from 'react';
import { Badge, Button, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export const BidFilesSection = ({ bidType, filesCount, onOpen }) => {
    if (+bidType !== 1 && +bidType !== 2) return null;

    const title = +bidType === 1 ? 'Файлы' : 'Счета';

    return (
        <Tooltip title={title} placement={'right'}>
            <Badge count={filesCount} color={'geekblue'}>
                <Button
                    className={'sa-bid-page-btn'}
                    color="primary"
                    variant="outlined"
                    icon={<DownloadOutlined className={'sa-bid-page-btn-icon'} />}
                    onClick={onOpen}
                ></Button>
            </Badge>
        </Tooltip>
    );
};

