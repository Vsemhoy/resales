import { Button, Card } from "antd";
import React, { useState, useEffect } from "react";
import "./style/noticard.css";
import { CheckCircleOutlined, CheckSquareOutlined, ExclamationOutlined, UpSquareOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import MDEditor from "@uiw/react-md-editor";


const NotiCard = (props) => {
    const [isRead,  setIsRead] = useState(props.data.is_read);
    const [isReq,   setIsReq ] = useState(props.data.mandatory);

    const [color,   setColor ] = useState(props.data.color && !props.data.is_read ? props.data.color : "#b3b3b3");
    const [name,    setName  ] = useState(props.data.name ? props.data.name : "Сообщение");
    const [updated, setUpdated] = useState(props.data.updated_at? dayjs(props.data.updated_at) : null);


    const [readAnimation, setReadAnimation] = useState(false);

    const mouseOver = () => {
        if (!isReq && !isRead){
            setReadAnimation(true);
            setIsRead(true);
            setTimeout(() => {
                setReadAnimation(false);
            }, 600);
            setUpdated(dayjs());
            if (props.on_read){
                props.on_read(props.data.id);
            };
            setColor('#b3b3b3');
        };
    }

    const makeRead = () => {
        if (!isRead){
            setReadAnimation(true);
            setIsRead(true);
            setTimeout(() => {
                setReadAnimation(false);
            }, 600);
            setUpdated(dayjs());
            if (props.on_read){
                props.on_read(props.data.id);
            };
            setColor('#b3b3b3');
        };
    }



    useEffect(()=>{
        setIsReq(props.data.mandatory);
        // setColor(props.data.color);
        setName(props.data.name);
        // setIsRead(false);
        // setUpdated(null);
     },[props.data]);

     return (
        <div className={`ma-noticard ${!isRead ? "ma-notread" : ""} ${readAnimation ? "ma-blow" : ""}`  }
            onMouseOver={mouseOver}
            style={{ borderColor: color, background: 'white'}}
            
        >
            <div className={"ma-notcontent"}>
                {name && (
                    <div className="ma-notihead">{name}</div>
                )}
                <MDEditor.Markdown source={props.data.content} 
                    data-color-mode="light"
                    className="my-markdown-light"
                />
            </div>
            <div className={"ma-notfooter"}>
                
                    {isReq && !isRead ? (
                        <Button color="danger" variant="solid"
                            onClick={makeRead}
                        >Прочитано!</Button>
                    ) : ""}
    
                    {isRead ? (
                        <CheckSquareOutlined title={"Прочитано"} style={{ color: 'green', fontSize: 'x-large', borderRadius: '3px'}} />
                    ) : ""}
    
                    {!isReq && !isRead ? (
                        <ExclamationOutlined title={"Нужно прочесть"} style={{border: '1px solid red', color: 'red', fontSize: 'large', borderRadius: '3px'}} />
                    ) : ""}
                

                {isRead ? (
                    <span>
                        <span style={{color: 'gray', fontStyle: 'italic'}}>Прочитано</span> {updated?.format('DD-MM-YYYY')}
                    </span>
                ) : (
                    <span>
                        <span style={{color: 'gray', fontStyle: 'italic'}}>Создано</span> {dayjs(props.data.created_at).format('DD-MM-YYYY')}
                    </span>
                )
            }

            </div>
        </div>
    );
}

export default NotiCard;