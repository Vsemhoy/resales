import {
	ArchiveBoxXMarkIcon,
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
	Bars3BottomLeftIcon,
	DocumentCurrencyDollarIcon,
	NewspaperIcon,
} from '@heroicons/react/24/outline';
import { Dropdown, Menu, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShortName } from '../../../components/helpers/TextHelpers';
import {
	BriefcaseIcon,
	GlobeAltIcon,
	InboxStackIcon,
	MusicalNoteIcon,
	PhoneArrowUpRightIcon,
} from '@heroicons/react/24/solid';
import { getBidsItems, getCallsItems, getMeetingsItems } from './hooks/AlansOrgHooks';
import { getProfileLiterals } from '../../../components/definitions/SALESDEF';
import { useURLParams } from '../../../components/helpers/UriHelpers';
import { CSRF_TOKEN, HTTP_ROOT, PRODMODE } from '../../../config/config';
import { PROD_AXIOS_INSTANCE } from '../../../config/Api';

const OrgListRow = (props) => {
	const { updateURL, getCurrentParamsString, getFullURLWithParams } = useURLParams();
	const navigate = useNavigate();
	const [active, setActive] = useState(false);
	const [compColor, setCompColor] = useState('#00000000');
	const [menuItems, setMenuItems] = useState([]);

	const { userdata } = props;

	const menuItemsd = [
		{
			key: '1',
			icon: <ArrowRightEndOnRectangleIcon height="18px" />,
			label: 'Запросить кураторство',
		},
		{
			key: '2',
			icon: <ArrowRightStartOnRectangleIcon height="18px" />,
			label: 'Передать кураторство',
		},
		{
			key: '3',
			icon: <NewspaperIcon height="18px" />,
			label: 'Создать КП',
		},
		{
			key: '4',
			icon: <DocumentCurrencyDollarIcon height="18px" />,
			label: 'Создать Счёт',
		},
		{
			key: '5',
			icon: <ArchiveBoxXMarkIcon height="18px" />,
			label: 'Удалить',
		},
	];

	const [orgData, setOrgData] = useState(props.data);
	
	useEffect(() => {
		if (orgData){
			let newArr = [];
			if ((orgData.id_company < 2 || orgData.id_company === userdata?.user?.active_company) &&
			(userdata?.acls?.includes(138) // Разрешено брать кураторство
		 || userdata?.acls?.includes(137) // Рукотдела продаж
		) 
		){
				newArr.push(
							{
							key: 'Call_cur_item1',
							icon: <ArrowRightEndOnRectangleIcon height="18px" />,
							label: <div
								onClick={handleCallBecomeCurator}
							>Запросить кураторство</div>,
						},
				)
			};

			if (userdata?.acls?.includes(55) && (orgData.id_company < 2 || orgData.id_company === userdata?.user?.active_company)){
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

			if (userdata?.acls?.includes(55) && (orgData.id_company < 2 || orgData.id_company === userdata?.user?.active_company)){
				newArr.push(
					{
							key: 'Can_del_item1',
							icon: <ArchiveBoxXMarkIcon height="18px" />,
							label: <div
								onClick={handleDeletOrg}
							>Удалить пасспорт из списка</div>,
						},
				)
			};

			setMenuItems(newArr);
		}
	}, [orgData]);
	
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

		const handleDeletOrg = () => {
		console.log('delete of', orgData.id);
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
            window.location.origin + '/' + HTTP_ROOT + '/bids/' +
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
		<Dropdown menu={{ items: menuItems }} trigger={['contextMenu']} key={`orgrow_${orgData.id}`}>
			<div
				className={`sa-table-box-orgs sa-table-box-row ${active ? 'active' : ''}`}
				style={{ color: compColor }}
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
						<NavLink to={'/orgs/' + orgData.id + '?frompage=orgs&' + getCurrentParamsString()}>
							{orgData.name}
						</NavLink>
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div className={'sa-align-left'} title={orgData.region_name}>
						{orgData.town_name}
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div className={'sa-align-left'}>{orgData.comment}</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>{orgData.inn}</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div className={'sa-align-left'}>
						{ShortName(orgData.curator_surname, orgData.curator_name, orgData.curator_secondname)}
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>
						{orgData.notes && orgData.notes !== '' && (
							<Tooltip title={orgData.notes}>
								<div>
									<Bars3BottomLeftIcon height={'16px'} />
								</div>
							</Tooltip>
						)}
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>
						{orgData.profile && orgData.profile !== '' && orgData.profile !== 0 && (
							<Tooltip title={orgData.kindofactivity}>
								<div>{getProfileLiterals(orgData.profile)}</div>
							</Tooltip>
						)}
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div className={'sa-flex-2-columns'}>
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
										<GlobeAltIcon height={'18px'} />
									</span>
								</Tooltip>
							)}
						</div>
						<div>
							{(orgData.is_prosound !== null || orgData.is_prosound === 2) && (
								<Tooltip title={'Профзвук'}>
									<MusicalNoteIcon height={'16px'} />
								</Tooltip>
							)}
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
							<Dropdown menu={{ items: getBidsItems(orgData.bids) }} placement="bottom">
								<div
									className={'sa-col-with-menu'}
									onClick={(item) =>
										item.id_company === props.userdata?.user.active_company
											? goToBid(item.id)
											: console.log('fail')
									}
								>
									<InboxStackIcon height={'18px'} />
									<Tag color={'geekblue'}>{orgData.bids.length}</Tag>
								</div>
							</Dropdown>
						)}
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>
						{orgData.meetings?.length > 0 && (
							<Dropdown menu={{ items: getMeetingsItems(orgData.meetings) }} placement="bottom">
								<div
									className={'sa-col-with-menu'}
									onClick={(item) =>
										item.id_company === props.userdata?.user.active_company
											? goToBid(item.id)
											: console.log('fail')
									}
								>
									<BriefcaseIcon height={'18px'} />
									<Tag color={'volcano'}>{orgData.meetings.length}</Tag>
								</div>
							</Dropdown>
						)}
					</div>
				</div>
				<div className={'sa-table-box-cell'}>
					<div>
						{orgData.calls?.length > 0 && (
							<Dropdown menu={{ items: getCallsItems(orgData.calls) }} placement="bottom">
								<div
									className={'sa-col-with-menu'}
									onClick={(item) =>
										item.id_company === props.userdata?.user.active_company
											? goToBid(item.id)
											: console.log('fail')
									}
								>
									<PhoneArrowUpRightIcon height={'18px'} />
									<Tag color={'green'}>{orgData.calls.length}</Tag>
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
		</Dropdown>
	);
};

export default OrgListRow;
