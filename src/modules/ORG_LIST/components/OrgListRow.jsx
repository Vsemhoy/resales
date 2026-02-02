import {
	ArchiveBoxXMarkIcon,
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
	Bars3BottomLeftIcon,
	DocumentCurrencyDollarIcon,
	FlagIcon,
	NewspaperIcon,
} from '@heroicons/react/24/outline';
import { Divider, Dropdown, List, Menu, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShortName } from '../../../components/helpers/TextHelpers';
import {
	BanknotesIcon,
	BriefcaseIcon,
	BuildingOffice2Icon,
	GlobeAltIcon,
	InboxStackIcon,
	MusicalNoteIcon,
	PhoneArrowUpRightIcon,
	TicketIcon,
} from '@heroicons/react/24/solid';
import { getBidsItems, getCallsItems, getMeetingsItems } from './hooks/AlansOrgHooks';
import { getProfileLiterals } from '../../../components/definitions/SALESDEF';
import { useURLParams } from '../../../components/helpers/UriHelpers';
import { BASE_ROUTE, CSRF_TOKEN, HTTP_ROOT, PRODMODE } from '../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';
import { values } from 'lodash';
import HighlightText from '../../../components/helpers/HighlightText';
import {ProjectOutlined} from "@ant-design/icons";

const OrgListRow = (props) => {
	const { updateURL, getCurrentParamsString, getFullURLWithParams } = useURLParams();
	const navigate = useNavigate();
	const [active, setActive] = useState(false);
	const [compColor, setCompColor] = useState('#00000000');
	const [menuItems, setMenuItems] = useState([]);

	const [requisitesMenu, setRequisitesMenu] = useState([]);
	const [paymersMenu,    setPaymersMenu] = useState([]);


	const [userdata, setUserdata] = useState(null);

	const [filterName, setFilterName] = useState(null);

	const [matchRequisite,  setMatchRequisite]  = useState(false);
	const [matchSubcompany, setmatchSubcompany] = useState(false);

	const [busyModers, setBusyModers] = useState(null);
	const [busyMode, setBusyMode]   = useState(null); // 1 - explore // 2 - edit
	const [busyEditor, setBusyEditor]   = useState(null);
	const [busyExplorers, setBusyExplorers] = useState([]);

	const [deleted, setDeleted] = useState(false);

	useEffect(() => {
		setBusyModers(props.busy);
		if (props.busy?.length > 0){
			let hasEditor = props.busy.find((item)=>item.action === "edit");
			if (hasEditor){
				setBusyEditor(hasEditor);
				setBusyMode(2);
			} else {
				setBusyEditor(null);
				setBusyMode(1);
			}
			setBusyExplorers(props.busy.filter((item)=>item.action === "observe"));
		} else {
			setBusyMode(null);
			setBusyEditor(null);
			setBusyExplorers([]);
		}
	}, [props.busy]);


	useEffect(() => {
		setUserdata(props.userdata);
	}, [props.userdata]);

const truncateText = (text, maxLength = 200) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) : text;
};

const antiTruncateText = (text, maxLength = 200) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(maxLength, text.length): '';
};

	useEffect(() => {
		if (props.filter_name){
			setFilterName(props.filter_name);
		} else {
			setFilterName(null);
		}
	}, [props.filter_name]);




	const [orgData, setOrgData] = useState(props.data);
	
	useEffect(() => {
		if (orgData){
			let newArr = [];
		// 	if (
		// 		(
		// 			(orgData.id_company < 2 || orgData.id_company === userdata?.user?.active_company) &&
		// 	(userdata?.acls?.includes(138) // Разрешено брать кураторство
		//  || userdata?.acls?.includes(137) // Рукотдела продаж
		// ) ) 
		// &&  userdata?.user?.id !== orgData?.curator_id 
		// ){
		// 		newArr.push(
		// 					{
		// 					key: 'Call_cur_item1',
		// 					icon: <ArrowRightEndOnRectangleIcon height="18px" />,
		// 					label: <div
		// 						onClick={handleCallBecomeCurator}
		// 					>Запросить кураторство</div>,
		// 				},
		// 		)
		// 	};



			if ((userdata?.acls?.includes(89) || userdata?.acls?.includes(92))  
				&& (orgData.id_company === userdata?.user?.active_company)){
				newArr.push(
					{
							key: 'Can_create_offer',
							icon: <ArchiveBoxXMarkIcon height="18px" />,
							label: <div
								onClick={()=>{create_bid(1, orgData.id)}}
							>Создать КП</div>,
						},
				);
				newArr.push(
					{
							key: 'Can_create_bid',
							icon: <ArchiveBoxXMarkIcon height="18px" />,
							label: <div
								onClick={()=>{create_bid(2, orgData.id)}}
							>Создать счёт</div>,
						},
				)
			};

			if (userdata?.acls?.includes(55) 
				&& (orgData.id_company < 2 || orgData.id_company === userdata?.user?.active_company)){
				newArr.push(
					{
							key: 'Can_del_item1',
							icon: <ArchiveBoxXMarkIcon height="18px" />,
							label: <div
								onClick={handleDeletOrg}
							>Удалить паспорт из списка</div>,
						},
				)
			};

			setMenuItems(newArr);
		}
	}, [orgData, userdata]);
	
	useEffect(() => {
		if (props.data) {
			setOrgData(props.data);
		}
	}, [props.data]);

	useEffect(() => {
		setCompColor(props.company_color);
		// console.log('company_color', props.company_color)
	}, [props.company_color]);

	useEffect(() => {
		if (props.is_active !== active) {
			setActive(props.is_active);
		}
	}, [props.is_active]);

	const handleDoubleClick = () => {
		if (props.on_double_click) {
			props.on_double_click(orgData.id);
		}
	};


	useEffect(() => {
			setSubComs();
	}, [orgData.subcompanies]);

		useEffect(() => {
		if (!filterName && orgData.subcompanies?.length === 0) return;
			const timer = setTimeout(() => {
				setSubComs();
			}, 1600);
			return () => clearTimeout(timer);
	}, [filterName]);


	const setSubComs = () => {
			setmatchSubcompany(false);
			
			let arrm = [];
		if (orgData.subcompanies?.length > 0){
				arrm.push({
									key: "Subco_00000000",
									value: '',
									label: "Дочерние компании:",
									disabled: true,
							});
				for (let i = 0; i < orgData.subcompanies?.length; i++) {
					const subco = orgData.subcompanies[i];

					if (subco.name && filterName?.trim() && subco.name?.toLowerCase().includes(filterName?.toLowerCase().trim())){
						setmatchSubcompany(true);
					}
					arrm.push({
									key: "Subco_" + subco.id,
									value: subco.name,
									label: <HighlightText text={subco.name} highlight={filterName} />,
									danger: subco.deleted_at? true : false,
									icon: subco.deleted_at ? <ArchiveBoxXMarkIcon height={'18px'}/> : <BuildingOffice2Icon height={'18px'} />,
							});
				}
			}
			setRequisitesMenu(arrm);
	}


		useEffect(() => {
			setRequizMenu();					
	}, [orgData.requisites]);

			useEffect(() => {
			if (!filterName && orgData.requisites?.length === 0) return;
			const timer = setTimeout(() => {
				setRequizMenu();					
		}, 1600);
		return () => clearTimeout(timer);
	}, [filterName]);

	const setRequizMenu = () => {
	setMatchRequisite(false);
		let arrm = [];
		if (orgData.requisites?.length > 0){
				arrm.push({
									key: "Subcor_00000000",
									value: '',
									label: "Фирмы/плательщики:",
									disabled: true,
							});
				for (let i = 0; i < orgData.requisites?.length; i++) {
					const subco = orgData.requisites[i];
					
					if (subco.name && filterName?.trim() && subco.name?.toLowerCase().includes(filterName?.trim().toLowerCase())){
						setMatchRequisite(true);
					}
					arrm.push({
									key: "Subcor_" + subco.id,
									value: subco.name,
									label: <HighlightText text={subco.name} highlight={filterName} />,
									danger: subco.deleted_at? true : false,
									icon: subco.deleted_at ? <ArchiveBoxXMarkIcon height={'18px'}/> : <TicketIcon height={'18px'} />,
							});
				}
			}
			setPaymersMenu(arrm);
	}


	const handleCallBecomeCurator = async () => {
		console.log('curator of', orgData.id);
			// http://192.168.1.16/api/curators/create
			try {
					const format_data = {
						
						_token: CSRF_TOKEN,
						data: {
							id_org: orgData.id,
						},
					};
					let new_bid_response = await PROD_AXIOS_INSTANCE.post(
						"/api/curators/create",
						format_data,
					);
					if (new_bid_response) {
						// window.open(
						// 	window.location.origin + '/' + HTTP_ROOT + '/bids/' +
						// 	new_bid_response.data.bid.id, 
						// 	"_blank"
						// );
						alert("Заявка на кураторство отправлена");
					}
				} catch (e) {
					console.log(e);
					
			}
	}

	const handleDeletOrg = async () => {
		// console.log('delete of', orgData.id);
		if (PRODMODE){
			try {
						
						let orgdel = await PROD_AXIOS_INSTANCE.delete(
							"/api/sales/delete/" + orgData.id + "?_token=" + CSRF_TOKEN,
						);
						if (orgdel) {
							setDeleted(true);
							console.log(orgdel);
						}
					} catch (e) {
						console.log(e);
						alert(e);
				}
		}
		else {
			setDeleted(true);
		}
	}

	const wrapLink = (text) => {
		return text.split(' ').map((word, index) => {
			// Проверяем, начинается ли слово с "www" или "http"
			if (word.toLowerCase().startsWith('www.') || word.toLowerCase().startsWith('http')) {
				// Если нет http, добавляем
				const href = word.startsWith('http') ? word : `https://${word}`;

				return (
					<a
						key={index}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						style={{ textDecoration: 'underline', color: 'white' }}
					>
						{word}
					</a>
				);
			}

			// Обычное слово
			return <span key={index}> {word} </span>;
		});
	};

	const goToBid = (id) => {
		navigate('/bids/' + id); // переход на /profile
	};

	const navigateToEditor = (e) => {
		navigate('/orgs/' + orgData.id + '?mode=view', {
			state: { from: window.location.pathname + window.location.search },
		});
	};


	const create_bid = async (type, org_id) => {
      try {
        const format_data = {
          
          _token: CSRF_TOKEN,
          data: {
            org: org_id,
            type: type,
          },
        };
        let new_bid_response = await PROD_AXIOS_INSTANCE.post(
          "/sales/data/makebid",
          format_data,
        );
        if (new_bid_response) {
          window.open(
            // window.location.origin + '/' + HTTP_ROOT + '/bids/' +
            HTTP_ROOT + BASE_ROUTE + '/bids/' +
            new_bid_response.data.bid.id, 
            "_blank"
          );
        }
      } catch (e) {
        console.log(e);
				if (!PRODMODE){
					window.open(
							'/bids/' +
							type, 
							"_blank"
						);
				}
      }
    };


	return (
		<Dropdown menu={{ items: menuItems }} trigger={['contextMenu']} key={`orgrow_${orgData.id}`}
		>
			<Tooltip title={
				busyMode !== null ? (
					<div>
						{busyMode === 2 ? (
							<div>
								<div>Редактирует:</div>
								<div>{busyEditor?.username}</div>
							</div>
						) : ""}
						{busyExplorers.length > 0 && busyMode === 2 ? (
							<hr></hr>
						) : ""}
						{busyExplorers.length > 0 ? (
							<div>
								<div>Просматривают:</div>
								{busyExplorers.map(item=> (
									<div>{item?.username}</div>
								))}
							</div>
						) : ""}
					</div>
				) : ""
			}>
				<div
					className={`sa-table-box-orgs sa-table-box-row ${active ? 'active' : ''}
				${busyMode === 1 ? "sa-explore-row" : ""} ${busyMode === 2 ? "sa-busy-row" : ""}
				`}
					style={{color: compColor, display: `${deleted ? 'none' : 'grid'}`}}
					onDoubleClick={handleDoubleClick}
					id={'orgrow_' + orgData.id}
				>
					<div
						className={'sa-table-box-cell'}
						// style={{background:'#ff870002', borderLeft:'6px solid #ff8700'}}
					>
						<div>
							<NavLink
								to={'/orgs/' + orgData.id + '?frompage=orgs&' + getCurrentParamsString()}
								state={'hello'}
							>
								{orgData.id}
							</NavLink>
						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'sa-align-left'}>
							<div>
								<Tooltip
									color={'white'}
									title={
										orgData.middlename || orgData.subcompanies?.length > 0 || orgData.requisites?.length > 0 ? (
											<div style={{padding: '6px'}}>
												{orgData.middlename ? (
													<>
														<div className={'sa-table-orgs-header-in-tooltip'}>Второе
															название:
														</div>
														<div style={{color: 'black'}}>
															<HighlightText text={orgData.middlename}
																		   highlight={filterName}/>
														</div>
													</>
												) : ""}
												{orgData.subcompanies?.length > 0 && (
													<>
														{orgData.middlename && (
															<div style={{padding: '8px'}}></div>
														)}
														<div className={'sa-table-orgs-header-in-tooltip'}>Дочерние
															компании :
														</div>
														<List
															style={{padding: '0px'}}
															size="small"
															className='sa-org-more-list-ee'
															bordered
															dataSource={orgData.subcompanies?.map((subco) => (subco.name))}
															renderItem={(item) => <List.Item>
																<div className={'sa-org-list-row-name-name-li'}>
																	<span><BuildingOffice2Icon height={'18px'}/></span>
																	<span><HighlightText text={item}
																						 highlight={filterName}/></span>
																</div>
															</List.Item>}
														/>
													</>
												)}
												{orgData.requisites?.length > 0 && (
													<>
														{orgData.middlename || orgData.subcompanies?.length > 0 ? (
															<div style={{padding: '8px'}}></div>
														) : ""}
														<div
															className={'sa-table-orgs-header-in-tooltip'}>Фирмы/плательщики
															:
														</div>
														<List
															style={{padding: '0px'}}
															size="small"
															className='sa-org-more-list-ee'
															bordered
															dataSource={orgData.requisites?.map((subco) => (subco.name))}
															renderItem={(item) => <List.Item>
																<div className={'sa-org-list-row-name-name-li'}>
																	<span><TicketIcon height={'18px'}/></span>
																	<span><HighlightText text={item}
																						 highlight={filterName}/></span>
																</div>
															</List.Item>}/>
													</>
												)}

											</div>) : null
									}
									placement='bottom'>


									<div className='sa-org-list-row-name-name'>
										<NavLink
											to={'/orgs/' + orgData.id + '?frompage=orgs&' + getCurrentParamsString()}>
											<HighlightText text={orgData.name} highlight={filterName}/>
										</NavLink>
									</div>

									{orgData.middlename ? (
										<div className={'sa-org-list-row-name-midname'}>{orgData.middlename ? (
											<div><HighlightText text={truncateText(orgData.middlename, 55)}
																highlight={filterName}/>{antiTruncateText(orgData.middlename, 55) ? (
												<>
													{(orgData?.middlename && filterName && orgData.middlename?.toLowerCase().includes(filterName?.toLowerCase())) ? (
														<span className='sa-text-higlighted'>...</span>
													) : ('...')}
												</>
											) : ''}</div>
										) : (
											<div>
												{/* {orgData.subcompanies?.length} суб-компании */}
											</div>
										)}</div>
									) : ""}
								</Tooltip>


							</div>


						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'sa-align-left'} title={orgData.region_name}>
							{orgData.town_name}
						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'sa-align-center'}>
							{orgData.profile && orgData.profile !== '' && orgData.profile !== 0 && (
								<Tooltip title={orgData.kindofactivity}>
									<div>{getProfileLiterals(orgData.profile)}</div>
								</Tooltip>
							)}
						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div>{orgData.notes}</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div>{orgData.inn}</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div className={'sa-align-center'}>
							{ShortName(orgData.curator_surname, orgData.curator_name, orgData.curator_secondname)}
						</div>
					</div>
					{/*<div className={'sa-table-box-cell'}>*/}
					{/*	<div>*/}
					{/*		{orgData.notes && orgData.notes !== '' && (*/}
					{/*			<Tooltip title={orgData.notes}>*/}
					{/*				<div>*/}
					{/*					<Bars3BottomLeftIcon height={'16px'}/>*/}
					{/*				</div>*/}
					{/*			</Tooltip>*/}
					{/*		)}*/}
					{/*	</div>*/}
					{/*</div>*/}
					{/*<div className={'sa-table-box-cell'}>*/}
					{/*	<div>*/}
					{/*		/!*{orgData.profile && orgData.profile !== '' && orgData.profile !== 0 && (*!/*/}
					{/*		/!*	<Tooltip title={orgData.kindofactivity}>*!/*/}
					{/*		/!*		<div>{getProfileLiterals(orgData.profile)}</div>*!/*/}
					{/*		/!*	</Tooltip>*!/*/}
					{/*		/!*)}*!/*/}
					{/*	</div>*/}
					{/*</div>*/}
					<div className={'sa-table-box-cell'}>
						<div className={'sa-flex-4-columns'}>
							<div>
								{orgData.website && (
									<Tooltip
										title={
											<div className="sa-flex-v">
												{orgData.website.split(',').map((siter) => {
													return wrapLink(siter);
												})}
											</div>
										}
									>
									<span>
										<GlobeAltIcon height={'18px'}/>
									</span>
									</Tooltip>
								)}
							</div>
							<div>
								{/*{(orgData.is_prosound !== null || orgData.is_prosound === 2) && (*/}
								{(orgData.is_prosound === 2) && (
									<Tooltip title={'Профзвук'}>
										<MusicalNoteIcon height={'16px'}/>
									</Tooltip>
								)}
							</div>
							<div>
								{orgData.subcompanies?.length > 0 ? (
									<Dropdown menu={{items: requisitesMenu}} placement="bottom">
										<div
											className={`sa-col-with-menu ${matchSubcompany ? "sa-col-win" : ""}`}
										>
											<BuildingOffice2Icon height={'18px'}/>
										</div>
									</Dropdown>
								) : ""}
							</div>
							<div>
								{orgData.requisites?.length > 0 ? (
									<Dropdown menu={{items: paymersMenu}} placement="bottom">
										<div
											className={`sa-col-with-menu ${matchRequisite ? "sa-col-win" : ""}`}
										>
											<TicketIcon height={'18px'}/>
										</div>
									</Dropdown>
								) : ""}
							</div>
							{/* <div>
              
            </div>
            <div>
              
            </div>
            <div>
              
            </div>
            <div>
              
            </div>
            <div>
              
            </div> */}
						</div>
					</div>

					<div className={'sa-table-box-cell'}>
						<div>
							{orgData.bids?.length > 0 && (
								<Dropdown menu={{items: getBidsItems(orgData.bids)}} placement="bottom">
									<div
										className={'sa-col-with-menu'}
										onClick={(item) =>
											item.id_company === props.userdata?.user.active_company
												? goToBid(item.id)
												: console.log('fail')
										}
									>
										<InboxStackIcon height={'18px'}/>
										<Tag
											color={'geekblue'}>{orgData?.bids_count ? (orgData.bids_count > 999 ? "999+" : orgData?.bids_count) : orgData.bids.length}</Tag>
									</div>
								</Dropdown>
							)}
						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div>
							{orgData.meetings?.length > 0 && (
								<Dropdown menu={{items: getMeetingsItems(orgData.meetings)}} placement="bottom">
									<div
										className={'sa-col-with-menu'}
										onClick={(item) =>
											item.id_company === props.userdata?.user.active_company
												? goToBid(item.id)
												: console.log('fail')
										}
									>
										<BriefcaseIcon height={'18px'}/>
										<Tag color={'volcano'}>{orgData.meetings.length}</Tag>
									</div>
								</Dropdown>
							)}
						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div>
							{orgData.calls?.length > 0 && (
								<Dropdown menu={{items: getCallsItems(orgData.calls)}} placement="bottom">
									<div
										className={'sa-col-with-menu'}
										onClick={(item) =>
											item.id_company === props.userdata?.user.active_company
												? goToBid(item.id)
												: console.log('fail')
										}
									>
										<PhoneArrowUpRightIcon height={'18px'}/>
										<Tag color={'green'}>{orgData.calls.length}</Tag>
									</div>
								</Dropdown>
							)}
						</div>
					</div>
					<div className={'sa-table-box-cell'}>
						<div>
							{/*{orgData.projects_count?.length > 0 && (*/}
							{orgData.projects_count > 0 && (
								// <Dropdown menu={{items: getCallsItems(orgData.calls)}} placement="bottom">
								<Dropdown menu={{items: []}} placement="bottom">
									<div
										className={'sa-col-with-menu'}
									>
										<ProjectOutlined height={'18px'}/>
										<Tag color={'green'}>{orgData.projects_count}</Tag>
									</div>
								</Dropdown>
							)}
						</div>
					</div>
					{/* <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div>
        <div className={'sa-table-box-cell'}>
        <div>1</div>
        </div> */}
				</div>
			</Tooltip>
		</Dropdown>
	);
};

export default OrgListRow;
