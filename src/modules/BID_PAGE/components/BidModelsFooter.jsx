import React from 'react';
import { Button } from 'antd';
import { BlockOutlined, FileSearchOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';

export const BidModelsFooter = ({
    isCalculating,
    engineerParams,
    amounts,
    prepareAmount,
    prepareEngineerParameter,
    onAddModel,
    onOpenParse,
    onOpenFindSimilar,
    isDisabledInputManager,
}) => (
    <div className={'sa-bid-models-footer'}>
        <div className={'sa-footer-btns'}>
            <Button
                style={{ width: '30%' }}
                color="primary"
                variant="outlined"
                icon={<PlusOutlined />}
                onClick={onAddModel}
                disabled={isDisabledInputManager}
            >
                Добавить модель
            </Button>
            <Button
                style={{ width: '30%' }}
                color="primary"
                variant="filled"
                icon={<FileSearchOutlined />}
                onClick={onOpenParse}
                disabled={isDisabledInputManager}
            >
                Анализ сырых данных
            </Button>
            <Button
                style={{ width: '30%' }}
                color="primary"
                variant="filled"
                icon={<BlockOutlined />}
                onClick={onOpenFindSimilar}
            >
                Похожие
            </Button>
        </div>
        <div className={'sa-footer-table-amounts'}>
            <div className={'sa-footer-table'}>
                <div className={'sa-footer-table-col'}>
                    <div className={'sa-footer-table-cell'}>
                        <p>Высота об-ни: </p>
                        {!isCalculating ? (
                            <p>
                                <span>{prepareEngineerParameter(engineerParams.unit)}</span> U
                            </p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                    <div className={'sa-footer-table-cell'}>
                        <p>Высота шкафа: </p>
                        {!isCalculating ? (
                            <p>
                                <span>{prepareEngineerParameter(engineerParams.box_size)}</span> U
                            </p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                </div>
                <div className={'sa-footer-table-col'}>
                    <div className={'sa-footer-table-cell'}>
                        <p>Потр. мощ.: </p>
                        {!isCalculating ? (
                            <p>
                                <span>{prepareEngineerParameter(engineerParams.power_consumption)}</span> кВт
                            </p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                    <div className={'sa-footer-table-cell'}>
                        <p>Вых. мощность: </p>
                        {!isCalculating ? (
                            <p>
                                <span>{prepareEngineerParameter(engineerParams.max_power)}</span> Вт
                            </p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                </div>
                <div className={'sa-footer-table-col'}>
                    <div className={'sa-footer-table-cell'}>
                        <p>Мощность АС: </p>
                        {!isCalculating ? (
                            <p>
                                <span>{prepareEngineerParameter(engineerParams.rated_power_speaker)}</span> Вт
                            </p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                    <div className={'sa-footer-table-cell'}>
                        <p>Масса: </p>
                        {!isCalculating ? (
                            <p>
                                <span>{prepareEngineerParameter(engineerParams.mass)}</span> кг
                            </p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                </div>
                <div className={'sa-footer-table-col'}>
                    <div className={'sa-footer-table-cell'}>
                        <p>Объем:</p>
                        {!isCalculating ? (
                            <p>
                                <span>{prepareEngineerParameter(engineerParams.size)}</span> m3
                            </p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                </div>
            </div>
            <div className={'sa-footer-amounts'}>
                <div className={'sa-footer-amounts-col'}>
                    <div className={'sa-footer-amounts-cell'}>
                        <p>Сумма в долларах</p>
                    </div>
                    <div className={'sa-footer-amounts-cell'}>
                        <p>Сумма в евро</p>
                    </div>
                    <div className={'sa-footer-amounts-cell'}>
                        <p>Сумма в рублях</p>
                    </div>
                </div>
                <div className={'sa-footer-amounts-col'}>
                    <div className={'sa-footer-amounts-cell cell-amount'}>
                        {!isCalculating ? (
                            <p>{prepareAmount(amounts.usd)} $</p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                    <div className={'sa-footer-amounts-cell cell-amount'}>
                        {!isCalculating ? (
                            <p>{prepareAmount(amounts.eur)} €</p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                    <div className={'sa-footer-amounts-cell cell-amount'}>
                        {!isCalculating ? (
                            <p>{prepareAmount(amounts.rub)} ₽</p>
                        ) : (
                            <LoadingOutlined />
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

