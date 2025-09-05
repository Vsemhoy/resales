import React, { useEffect, useState } from 'react';

import {Button, Col, Layout, Row} from 'antd';
import {Content, Header} from 'antd/es/layout/layout';

import './components/style/engineerpage.css';
import TextArea from "antd/es/input/TextArea";
import EngineerTable from "./components/EngineerTable";
import {useParams} from "react-router-dom";
import {CSRF_TOKEN, PRODMODE} from "../../config/config";
import {ALLMODELS_LIST, MODELS_LIST} from "./mock/mock";
import {PROD_AXIOS_INSTANCE} from "../../config/Api";
import {Footer} from "antd/es/modal/shared";

const EngineerPage = (props) => {
  const { userdata } = props;

  const {item_id} = useParams();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [models, setModels] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [commentEngineer, setCommentEngineer] = useState("");

  useEffect(() => {
    fetchInfo().then();
    setIsMounted(true);
  }, []);

  const fetchInfo = async () => {
    setIsLoading(true);
    await fetchAllModels();
    await fetchModelsBySpec();
    setIsLoading(false);
  };

  const fetchAllModels = async () => {
    if (PRODMODE){
      let response = await PROD_AXIOS_INSTANCE.get('/api/sales/getmodels')

      setAllModels(response.data.models);
    } else {
      setAllModels(ALLMODELS_LIST);
    }
  }

  const fetchModelsBySpec = async () => {
    if (PRODMODE){
      let response = await PROD_AXIOS_INSTANCE.post('/api/sales/engineer/' + item_id, {
        _token: CSRF_TOKEN,
        data: {}
      })

      setEditMode(response.data.content.edit);
      setModels(response.data.content.models);
      setCommentEngineer(response.data.content.comment);
    } else {
      setEditMode(true);
      setModels(MODELS_LIST);
      setCommentEngineer("Hello world!")
    }
  }

  const fetchUpdate = async () => {
    console.log("commentEngineer: ", commentEngineer);

    if (PRODMODE){
      let response = await PROD_AXIOS_INSTANCE.put('/api/sales/engineer/' + item_id, {
        _token: CSRF_TOKEN,
        data: {
          models: models,
          comment: commentEngineer
        }
      })
    } else {
      console.log("commentEngineer: ", commentEngineer);
    }
  }

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        setIsLoading(true);
        fetchUpdate().then(() => {
          setIsLoading(false);
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [models, commentEngineer]);

  const update_local_state = (type, value, index) => {
    const modelsUpdate = JSON.parse(JSON.stringify(models));
    let commentEngineerUpdate = JSON.parse(JSON.stringify(commentEngineer));

    switch (type){
      case "model":
        modelsUpdate[index] = {
          ...modelsUpdate[index],
          model_id: value.value,
          model_name: value.label,
          model_count: value.count,
        }
        break;

      case "count":
        modelsUpdate[index] = {
          ...modelsUpdate[index],
          model_count: value,
        }

        break;

      case "delete":
        if (!editMode){
          modelsUpdate.splice(index, 1);
        }
        break;

      case "comment":
        commentEngineerUpdate = value;
        break;
    }

    setModels(modelsUpdate);
    setCommentEngineer(commentEngineerUpdate);
  }

  return (
      <Layout style={{ background: '#b4cbe4', minHeight: '100vh' }}>
        <Header style={{ background: '#b4cbe4', padding: '0 24px' }}>
          <h1>Спецификация</h1>
        </Header>
        <Layout style={{ background: '#b4cbe4', padding: '24px' }}>
          <Content>
            <Row>
              <Col span={9}>
                <div style={{
                  // background: '#b4cbe4',
                  padding: '24px',
                  // borderRadius: '8px',
                  // height: '100%'
                }}>
                  <h3>Комментарий инженера</h3>
                  <TextArea
                      rows={5}
                      placeholder="Введите текст..."
                      style={{ width: "600px", fontSize: '18px' }}
                      value={commentEngineer}
                      disabled={!editMode}
                      onChange={(e) =>  update_local_state("comment", e.target.value, 1)}
                  />
                </div>
              </Col>
              <Col span={15}>
                <div style={{
                  // background: '#fff',
                  padding: '24px',
                  // borderRadius: '8px',
                  // height: '100%'
                }}>
                  <h3>Основное содержимое</h3>
                  <EngineerTable
                      loading={isLoading}
                      allModels={allModels}
                      models={models}
                      update_local_state={update_local_state}
                      EDITMODE={!editMode}
                  />
                </div>
              </Col>
            </Row>
          </Content>
          <Content>
            <Button> Закрыть </Button>
            <Button> Сохранить </Button>
          </Content>
        </Layout>
      </Layout>
  );
};

export default EngineerPage;