import React, { useEffect, useState } from "react";
import { ANTD_PAGINATION_LOCALE } from "../../../config/Localization";
import { Button, Collapse, Pagination, Spin } from "antd";
// import OrgNoteModalRow from "../../ORG_LIST/components/OrgModal/Tabs/TabComponents/RowTemplates/OrgNoteModalRow";
import dayjs from "dayjs";
import { getMonthName } from "../../../components/helpers/TextHelpers";
import { PlusCircleFilled, PlusOutlined } from "@ant-design/icons";
import { compareObjects } from "../../../components/helpers/CompareHelpers";
import OrgProjectEditorSectionBox from "../components/sections/NotesTabSections/Rows/OrgProjectEditorSectionBox";
import { TrashIcon } from "@heroicons/react/24/outline";

const ProjectsTabPage = (props) => {
  const { userdata } = props;

  const [orgId, setOrgId] = useState(null);
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [onPage, setOnPage] = useState(30);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [newLoading, setNewLoading] = useState(false);

  // Структурированные в коллапсы юниты
  const [structureItems, setStructureItems] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [baseData, setBaseData] = useState([]);

  // Новые юниты
  const [temporaryUnits, setTemporaryUnits] = useState([]);
  const [newStructureItems, setNewStructureItems] = useState([]);

  const [editedItemsIds, setEditedItemsIds] = useState([]);
  const [openedNewSections, setOpenedNewSections] = useState([]);

  const [orgusers, setOrgUsers] = useState([]);

    const [selects, setSelects] = useState(null);
    useEffect(() => {
      setSelects(props.selects);
    }, [props.selects]);

  useEffect(() => {
    setShow(props.show);
  }, [props.show]);

  useEffect(() => {
    setCurrentPage(props.current_page);
  }, [props.current_page]);

  useEffect(() => {
   
      setOrgId(props.item_id);
    
  }, [props.item_id]);

  useEffect(() => {
    if (props.current_page && props.current_page !== currentPage)
      setCurrentPage(props.current_page);
  }, [props.current_page]);

    useEffect(() => {
      if (props.main_data && props.main_data.contacts) {
        setOrgUsers(props.main_data.contacts);
      } else {
        setOrgUsers([]);
      }
    }, [props.main_data]);

  // useEffect(() => {
  //   if (props.edit_mode === false) {
  //     if (editedItemsIds.length > 0 || newStructureItems.length > 0) {
  //       if (
  //         window.confirm(
  //           "У вас есть несохраненные заметки! Отменить изменения?"
  //         )
  //       ) {
  //         setOriginalData([]);
  //         setLoading(true);
  //         setEditMode(props.edit_mode);
  //         setTemporaryUnits([]);
  //         setEditedItemsIds([]);
  //         setTimeout(() => {
  //           setBaseData(
  //             props.base_data?.projects
  //               ? JSON.parse(JSON.stringify(props.base_data.projects))
  //               : []
  //           );
  //         }, 1000);

  //         setBaseData([]);

  //         setTimeout(() => {
  //           setBaseData(
  //             props.base_data?.projects
  //               ? JSON.parse(JSON.stringify(props.base_data.projects))
  //               : []
  //           );
  //         }, 1000);
  //       } else {
  //         // alert('Нажмите кнопку [Редактировать] и заново сохраните данные');
  //         if (props.on_break_discard) {
  //           // setBaseData(props.base_data?.projects);
  //           setOriginalData(
  //             props.base_data?.projects
  //               ? JSON.parse(JSON.stringify(props.base_data.projects))
  //               : []
  //           );
  //           props.on_break_discard();
  //         }
  //       }
  //     } else {
  //       setEditMode(props.edit_mode);
  //     }
  //   } else {
  //     setEditMode(props.edit_mode);
  //   }
  // }, [props.edit_mode]);

	useEffect(() => {
    if (props.edit_mode === false){
      setTemporaryUnits([]);
    }
		setEditMode(props.edit_mode);
	}, [props.edit_mode]);

  useEffect(() => {
    setTemporaryUnits([]);
    setNewStructureItems([]);
  }, [orgId]);

  useEffect(() => {
    if (props.base_data?.projects !== null && props.base_data?.projects?.length > 0) {
      let secids = [];
      // setDataList(baseOrgData.projects);
      let strdata = baseData.map((item) => {
        secids.push("projrow_" + item.id);
        return {
          key: "projrow_" + item.id,
          label: (
            <div
              className={`sa-flex-space ${
                item.deleted === 1 && editMode ? "sa-orgrow-deleted" : ""
              }`}
            >
              <div>
                {item.name && item.name !== "" ? item.name : item.address}
                <span className="sa-date-text">
                  {item?.date
                    ? " - " +
                      getMonthName(dayjs(item.date).month() + 1) +
                      " " +
                      dayjs(item.date).format("YYYY")
                    : ""}
                </span>{" "}
                <span className={"sa-text-phantom"}>({item.id})</span>
              </div>
              {editMode && (
                <>
                  {item.deleted === 1 ? (
                    <Button
                      size="small"
                      color="danger"
                      variant="filled"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleDeleteRealUnit(item.id, 0);
                      }}
                    >
                      ВЕРНУТЬ
                    </Button>
                  ) : (
                    <Button
                      title={'Удалить проект'}
                      size="small"
                      color="danger"
                      variant="outlined"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleDeleteRealUnit(item.id, 1);
                      }}
                      icon=<TrashIcon height={'20px'} />
                    >
                      
                    </Button>
                  )}
                </>
              )}
            </div>
          ),
          children: (
            <OrgProjectEditorSectionBox
              color={null}
              data={item}
              on_delete={handleDeleteRealUnit}
              on_change={handleUpdateRealUnit}
              edit_mode={editMode}
              selects={selects}
              org_users={orgusers}
              // selects_data={props.selects_data}
            />
          ),
        };
      });

      setStructureItems(strdata);
    } else {
      setStructureItems([]);
    }
    setLoading(false);
  }, [baseData, editMode]);


  useEffect(() => {
    setOriginalData(
      props.base_data?.projects
        ? JSON.parse(JSON.stringify(props.base_data.projects))
        : []
    );
    setBaseData(
      props.base_data?.projects
        ? JSON.parse(JSON.stringify(props.base_data.projects))
        : []
    );
  }, [props.base_data]);







  useEffect(() => {
    let secids = [];
    setNewStructureItems(
      temporaryUnits.map((item) => {
        let nkey = "new_projrow_" + item.id;
        secids.push(nkey);
        return {
          key: nkey,
          label: (
            <div className="sa-flex-space">
              <div>
                {item.name && item.name !== "" ? item.name : item.address}
                <span className="sa-date-text">
                  {item?.date
                    ? " - " +
                      getMonthName(dayjs(item.date).month() + 1) +
                      " " +
                      dayjs(item.date).format("YYYY")
                    : ""}
                </span>{" "}
                <span className={"sa-text-phantom"}>({item.id})</span>
              </div>
              <Button
                size="small"
                onClick={(ev) => {
                  ev.stopPropagation();
                  handleDeleteBlankUnit(item.id);
                }}
              >
                Удалить
              </Button>
            </div>
          ),
          children: (
            <OrgProjectEditorSectionBox
              color={"#2599c7ff"}
              data={item}
              on_delete={handleDeleteBlankUnit}
              on_change={handleUpdateBlankUnit}
              on_blur={handleUpdateBlankUnit}
              edit_mode={editMode}
              selects={selects}
              org_users={orgusers}
              // selects_data={props.selects_data}
            />
          ),
        };
      })
    );
    // secids.reverse();
    if (JSON.stringify(openedNewSections) !== JSON.stringify(secids)) {
      setOpenedNewSections(secids);
    }
    setNewLoading(false);
  }, [temporaryUnits, editMode]);



  const get_org_data_action = (org_id, ev, on) => {
    if (props.on_change_page && ev !== currentPage) {
      props.on_change_page(ev);
    }
  };



  const handleAddUnitBlank = () => {
    setNewLoading(true);
    setTimeout(() => {
      let spawn = {
        command: "create",
        id:
          "new_" +
          dayjs().unix() +
          dayjs().millisecond() +
          temporaryUnits.length,
        id_orgs: props.item_id,
        id8staff_list: userdata.user.id,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"), //"2016-09-04T21:00:00.000000Z",
        id8an_projecttype: 0,
        name: "",
        equipment: "",
        customer: "",
        address: "",
        stage: "",
        contactperson: "",
        cost: "",
        bonus: "",
        comment: "",
        typepaec: "",
        deleted: 1,
        date_end: null,
        erector_id: null,
        linkbid_id: [],
        date_create: dayjs().unix(),
        id_company: userdata.user.active_company,
        created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        author_id: userdata.user.id,  
        curator: {
          id: userdata.user.id,
          surname: userdata?.user.surname,
          name: userdata?.user.name,
          secondname: userdata?.user.secondname,
        },
      };

      setTemporaryUnits((prevItems) => [spawn, ...prevItems]);
    }, 760);
  };



  const handleDeleteBlankUnit = (id) => {
    setTemporaryUnits(temporaryUnits.filter((item) => item.id !== id));
  };



  const handleDeleteRealUnit = (id, value) => {
    if (!editedItemsIds.includes(id)) {
      setEditedItemsIds([...editedItemsIds, id]);
    }
    setBaseData((prevData) => {
      // Удаляем элемент
      const filtered = prevData.filter((item) => item.id !== id);

      // Находим элемент для обновления
      const uitem = prevData.find((item) => item.id === id);
      if (uitem) {
        // Создаем обновленную версию
        const updatedItem = {
          ...uitem,
          deleted: value,
          command: value === 1 ? "delete" : "update",
        };

        // Находим индекс оригинального элемента
        const originalIndex = prevData.findIndex((item) => item.id === id);

        // Вставляем на ту же позицию
        const newData = [...filtered];
        newData.splice(originalIndex, 0, updatedItem);
        return newData;
      }
      return filtered;
    });
  };



  const handleUpdateBlankUnit = (id, data) => {
    if (!editMode) {
      return;
    }
    setTemporaryUnits((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);

      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };

  useEffect(() => {
    setTemporaryUnits([]);
  }, [orgId]);

  const handleUpdateRealUnit = (id, data) => {
    // let udata = originalData.filter((item) => item.id !== id);
    // udata.push(data);
    if (!editMode) {
      return;
    }

    const excluders = ["command", "date", "created_at", "date_create", "curator"];
    let is_original = false;

    originalData.forEach((element) => {
      if (element.id === id) {
        is_original = compareObjects(element, data, {
          excludeFields: excluders,
          compareArraysDeep: false,
          ignoreNullUndefined: true,
        });
      }
    });

    if (is_original === false) {
      if (!editedItemsIds?.includes(id)) {
        setEditedItemsIds([...editedItemsIds, id]);
      }
      data.command = "update";
    } else {
      if (editedItemsIds?.includes(id)) {
        setEditedItemsIds(editedItemsIds.filter((item) => item !== id));
      }
      data.command = "";
    }

    setBaseData((prevUnits) => {
      const exists = prevUnits.some((item) => item.id === id);
      if (!exists) {
        return [...prevUnits, data];
      } else {
        return prevUnits.map((item) => (item.id === id ? data : item));
      }
    });
  };

  // если в call_to_save не null, а timestamp, отправляем данные на обновление
  useEffect(() => {
    if (props.call_to_save !== null && props.on_save !== null) {
      props.on_save(baseData, temporaryUnits);
    }

  }, [props.call_to_save]);


  /** Отптавка данных родительскому компоненту */
  useEffect(() => {
    if (editMode && props.on_change_data){
      if (temporaryUnits.length > 0 || editedItemsIds.length > 0){
        props.on_change_data('projects', baseData.concat(temporaryUnits))
      }
    }
  }, [baseData, temporaryUnits]);


  return (
    <div className={`${show ? '' : 'sa-orgpage-tab-hidder'}`}>
   
        <Spin spinning={loading}>
          <div className={"sa-orgtab-container"}>
            <div
              className={"sa-pa-6 sa-flex-space"}
              style={{ paddingTop: "9px" }}
            >
              <div>
                <Pagination
                  disabled={editMode}
                  size={"small"}
                  current={currentPage}
                  pageSizeOptions={[10, 30, 50, 100]}
                  defaultPageSize={onPage}
                  locale={ANTD_PAGINATION_LOCALE}
                  showQuickJumper
                  total={total}
                  onChange={(ev, on) => {
                    if (ev !== currentPage) {
                      setCurrentPage(ev);
                    }
                    if (on !== onPage) {
                      setOnPage(on);
                    }
                    get_org_data_action(orgId, ev, on);
                  }}
                />
              </div>
              <div>
                {editMode && (
                  <Button
                    type={"primary"}
                    icon={<PlusOutlined />}
                    onClick={handleAddUnitBlank}
                    disabled={newStructureItems.length > 7 || newLoading}
                  >
                    Cоздать проект
                  </Button>
                )}
              </div>
            </div>
            <div>
              {newStructureItems.length > 0 && (
                <div className={"sa-org-temp-stack-collapse"}>
                  <div className={"sa-org-temp-stack-collapse-header"}>
                    Новые проекты
                  </div>
                  <Spin spinning={newLoading} delay={500}>
                    <Collapse
                      size={"small"}
                      items={newStructureItems}
                      activeKey={openedNewSections}
                    />
                  </Spin>
                </div>
              )}

              <Collapse
                // defaultActiveKey={['st_commoninfo', 'st_departinfo', 'st_contactinfo']}
                // activeKey={modalSectionsOpened}
                size={"small"}
                // onChange={handleSectionChange}
                // onMouseDown={handleSectionClick}
                items={structureItems}
              />
            </div>
          </div>
        </Spin>

    </div>
  );
};

export default ProjectsTabPage;
