import {Button, Modal, Upload, message } from "antd";
import React, {useEffect, useState} from "react";
import TextArea from "antd/es/input/TextArea";
import {UploadOutlined} from "@ant-design/icons";


const NewOrderModal = (props) => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        setText(props.text);
    }, [props.text]);

    useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    useEffect(() => {
        setFileList(props.fileListM);
    }, [props.fileListM]);

    const handleChange = (value) => {
        setText(value);
    }

    const handleOk = () => {
        props.handleOk(text, fileList)
    }

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleRemoveFile = (file) => {
        setFileList(fileList.filter(f => f.uid !== file.uid));
    };

    return (
        <Modal
            title={"Новая задача для инженеров"}
            open={open}
            onOk={handleOk}
            onCancel={props.handleCancel}
            closeIcon={false}
        >
            <TextArea
                value={text}
                autoSize={{minRows: 5, maxRows: 6}}
                style={{fontSize: '18px', marginDown: '10px'}}
                onChange={(e) => handleChange(e.target.value)}
            />


            <Upload
                multiple
                beforeUpload={(file) => {
                    const isAllowed = file.type.includes('image/') ||
                        file.type.includes('application/') ||
                        file.type.includes('text/');
                    if (!isAllowed) {
                        message.error('Вы можете загружать только документы и изображения');
                    }

                    return false;
                }}
                onChange={handleUploadChange}
                fileList={fileList}
                onRemove={handleRemoveFile}
            >
                <Button icon={<UploadOutlined />}>Загрузить файлы</Button>
            </Upload>

            <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                Максимальный размер файла: 10MB
            </div>

        </Modal>
    );
}

export default NewOrderModal;