import React, {useEffect, useState} from 'react';
import {Alert} from "antd";
import {useChatSocket} from "../../../context/ChatSocketContext";

const AlertCustom = () => {
    const [alertMessage, setAlertMessage] = useState('');
    const [alertDescription, setAlertDescription] = useState('');
    const [alertType, setAlertType] = useState('');

    const [isAlertVisible, setIsAlertVisible] = useState(false);

    const {
        connected,           // boolean - подключен ли WebSocket
        isAlertVisibleKey,
        alertInfo,
    } = useChatSocket();

    useEffect(() => {
        if (isAlertVisibleKey) {
            setIsAlertVisible(true);
        }
    }, [isAlertVisibleKey]);

    useEffect(() => {
        setAlertMessage(alertInfo.message);
        setAlertDescription(alertInfo.description);
        setAlertType(alertInfo.type);
    }, [alertInfo]);

    const hideAlertCustom = () => {
        setIsAlertVisible(false);
    };

    return (
        <div>
            {isAlertVisible && (
                <Alert
                    message={alertMessage}
                    description={alertDescription}
                    type={alertType}
                    showIcon
                    closable
                    style={{
                        position: 'fixed',
                        top: 20,
                        right: 20,
                        zIndex: 9999,
                        width: 350,
                    }}
                    onClose={() => hideAlertCustom()}
                />
            )}
        </div>
    );
};

export default AlertCustom;
