import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const TorgPageSectionRow = (props) => {
  const [inputs, setInputs] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [expanderText, setExpanderText] = useState("комм");
  const [actionBlock, setActionBlock] = useState(null);

  useEffect(() => {
    if (props.inputs){
      setInputs(props.inputs);
    } else {
      setInputs([]);
    }
  }, [props.inputs]);
  
  useEffect(() => {
    setEditMode(props.edit_mode);
    // if (!props.editMode){
    //   setActionBlock(null);
    // } else {
    //   if (props.action){
    //     setActionBlock(props.action);
    //   }
    // }
  }, [props.edit_mode]);

  useEffect(() => {
    if (props.explabel){
      setExpanderText(props.explabel);
    }
  }, [props.explabel]);



  useEffect(() => {
    if (props.action){
      setActionBlock(props.action);
    }
  }, [props.action]);



  return (
    <div className={`torg-section ${editMode ? 'torg-section-editmode' : ''}`}>
      <div className='sk-omt-row-wrapper sk-omt-rw-first'>
          <div className={`sk-omt-row omt-${inputs?.length}-col`}>
            {inputs.map((item, index)=>(
              <div className={`${(item.edit_mode && item.required && !(item?.value && item.value)) ? 'sa-required-field-block' : ''}`}>
                <div className={'sk-omt-legend sa-flex-space'}>

              
              {props.extratext && props.extratext.length > 0 && index === 0 && (
	            <div
                
                  className={`sk-omt-comment-trigger ${
                    props.extratext?.[0]?.value !== null && props.extratext?.[0]?.value !== ""
                      ? "sk-omt-comment-trigger-treasure"
                      : ""
                  } ${
                    props.extratext?.[0]?.required === true && props.extratext?.[0]?.value === ""
                      ? "sk-omt-comment-trigger-hot"
                      : ""
                  }`}
                  onClick={() => setOpened(!opened)}
                >
                  <span>{opened ? <CaretUpOutlined /> : <CaretDownOutlined />}</span>
                  <span>{expanderText}</span>
                </div>
							)}
              <div></div>
                  <span>{item.label}</span>
                  
                </div>
                <div className='sk-omt-content' style={{paddingLeft: '0px'}}>
                  <div className={`sk-omt-content-formatted`} >
                    {item.input}
                  </div>
                  </div>
                </div>
            ))}
          </div>
          {actionBlock && editMode && (
            <div className='sk-omt-action-block'>{actionBlock}</div>
          ) } 
      </div>
      {props.extratext && props.extratext.length > 0 && opened && (
        <div>
          {props.extratext.map((item)=>(
            <div className='sk-omt-row-wrapper'>
              <div className={`sk-omt-row omt-1-col`}>
              <div className={`${(item.edit_mode  && item.required && !(item?.value && item.value)) ? 'sa-required-field-block' : ''}`}>
                <div className={'sk-omt-legend sa-flex-space'}>
                  <span style={{paddingLeft: '6px'}}></span>
                  <span>{item.label}</span>
                  
                </div>
                <div className='sk-omt-content' style={{paddingLeft: '0px'}}>
                  <div className={`sk-omt-content-formatted`} >
                    {item.input}
                  </div>
                  </div>
                </div>
            </div>
            </div>
      ))}
        </div>
      )}
    </div>
  );
};

export default TorgPageSectionRow;