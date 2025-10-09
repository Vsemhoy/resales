import {Button, Modal, Upload, message, Input} from "antd";
import React, {useEffect, useState} from "react";
import TextArea from "antd/es/input/TextArea";
import {UploadOutlined} from "@ant-design/icons";
import FormItemLabel from "antd/es/form/FormItemLabel";


const NewOrderModal = (props) => {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
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

    useEffect(() => {
        setTitle(props.title);
    }, [])

    const handleChange = (value, type) => {
        switch (type) {
            case 1:
                setText(value);
                break;
            case 2:
                setTitle(value);
                break;
        }
    }

    const handleOk = () => {
        props.handleOk(title, text, fileList)
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
            <h4> Название заявки </h4>
            <Input value={title}
                   placeholder={"Введите коротко что делать"}
                   onChange={(e) => handleChange(e.target.value, 2)}
            />

            <h4> Комментарий к заявке </h4>
            <TextArea
                value={text}
                autoSize={{minRows: 5, maxRows: 6}}
                style={{fontSize: '18px', marginDown: '10px'}}
                onChange={(e) => handleChange(e.target.value, 1)}
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
                <Button icon={<UploadOutlined/>}>Загрузить файлы</Button>
            </Upload>

            <div style={{marginTop: 8, fontSize: '12px', color: '#999'}}>
                Максимальный размер файла: 10MB
            </div>

            <div style={{marginTop: 8, fontSize: '12px', color: '#999'}}>
                Название файлов должно быть на АНГЛИЙСКОМ
            </div>

        </Modal>
    );
}

export default NewOrderModal;