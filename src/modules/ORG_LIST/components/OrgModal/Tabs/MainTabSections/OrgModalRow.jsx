import { CaretDownOutlined, CaretUpOutlined, EnterOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { TextWithLineBreaks } from '../../../../../../components/helpers/TextHelpers';

const OrgModalRow = (props) => {
	const [columns, setcolumns] = useState(1);

	const [titles, setTitles] = useState(['Title one']);

	const [datas, setDatas] = useState(['data content one']);

	const [comment, setComment] = useState(null);

	const [opened, setOpened] = useState(false);

	const [commentTitle, setCommentTitle] = useState('КОММ');

	useEffect(() => {
		if (props.columns > 1) {
			setcolumns(props.columns);
		}
		if (props.titles) {
			setTitles(props.titles);
			if (props.titles.length > 1) {
				setcolumns(2);
			}
		}
		if (props.datas) {
			setDatas(props.datas);
		}
		if (props.comment) {
			setComment(props.comment);
		}
		if (props.comment_title) {
			setCommentTitle(props.comment_title);
		}
	}, [props]);

	return (
		<div className={'sk-omt-row-wrapper'}>
			<div className={`sk-omt-row omt-${columns}-col`}>
				<div>
					<div className={'sk-omt-legend sa-flex-space'}>
						<span style={{ paddingLeft: '6px' }}>
							{comment && (
								<div
									className={'sk-omt-comment-trigger'}
									onClick={() => {
										setOpened(!opened);
									}}
								>
									<span>{opened ? <CaretUpOutlined /> : <CaretDownOutlined />}</span>
									<span>{commentTitle}</span>
								</div>
							)}
						</span>
						<span>{titles[0]}</span>
					</div>

					{props.titles.length < 3 ? (
						<div className={'sk-omt-content'}>{datas[0]}</div>
					) : (
						<div className={'sk-omt-content-epanded'}>
							<div className={'sk-omt-content'}>{datas[0]}</div>
							<div className={'sk-omt-legend sa-flex-space'}>{titles[2]}</div>
							<div className={'sk-omt-content'}>{datas[2]}</div>
						</div>
					)}
				</div>
				{props.titles.length > 1 && (
					<div>
						<div className={'sk-omt-legend sa-flex-space'}>
							<span></span>
							<span>{titles.length > 1 && titles[1]}</span>
						</div>
						<div className={'sk-omt-content'}>{datas.length > 1 && datas[1]}</div>
					</div>
				)}
			</div>
			{comment && opened && (
				<div className={'sk-omt-row omt-1-col'}>
					<div>
						<div className={'sk-omt-legend  sa-flex-space'}>
							<span className={'sk-comment-arrow-sign'}>
								<EnterOutlined />
							</span>
							<span>
								<i>{commentTitle !== 'КОММ' ? commentTitle : 'Комментарий'}</i>
							</span>
						</div>
						<div className={'sk-omt-content'}>
							<TextWithLineBreaks text={comment}></TextWithLineBreaks>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrgModalRow;
