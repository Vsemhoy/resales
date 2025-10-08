import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const TorgPageSectionRow = (props) => {
  const [inputs, setInputs] = useState([]);
  const [extraOpened, setExtraOpened] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [expanderText, setExpanderText] = useState("комм");

  useEffect(() => {
    if (props.inputs){
      setInputs(props.inputs);
    } else {
      setInputs([]);
    }
  }, [props.inputs]);
  
  useEffect(() => {
    setEditMode(props.editMode);
  }, [props.editMode]);

  useEffect(() => {
    setExpanderText(props.explabel);
  }, [props.explabel]);


  return (
    <div className='torg-section'>
      <div className='sk-omt-row-wrapper'>
          <div className={`sk-omt-row omt-${inputs?.length}-col`}>
            {inputs.map((item, index)=>(
              <div className={`${(item.edit_mode && item.required && !(item?.value && item.value)) ? 'sa-required-field-block' : ''}`}>
                <div className={'sk-omt-legend sa-flex-space'}>

              
              {props.extratext && props.extratext.length > 0 && (
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
                  onClick={() => setExtraOpened(!extraOpened)}
                >
                  <span>{extraOpened ? <CaretUpOutlined /> : <CaretDownOutlined />}</span>
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

      </div>
      {props.extratext && props.extratext.length > 0 && extraOpened && (
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