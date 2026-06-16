import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Affix, Button, Empty, Input, Layout, Pagination, Select, Spin, Switch, Tag, Typography } from 'antd'
import { getDraftsList } from '../BID_PDF_PAGE/api/drafts.api'
import { STATUS_META } from '../BID_PDF_PAGE/useDraftStatus'
import TableHeadNameWithSort from '../../components/template/TABLE/TableHeadNameWithSort'
import CurrencyMonitorBar from '../../components/template/CURRENCYMONITOR/CurrencyMonitorBar'
import { CSRF_TOKEN, ROUTE_PREFIX } from '../../config/config'
import { PROD_AXIOS_INSTANCE } from '../../config/Api'
import classes from './SomaPdfListPage.module.css'
import { AlertOutlined, CustomerServiceOutlined, FilterOutlined } from '@ant-design/icons'

const COMPANY_LABELS = { 2: 'Arstel', 3: 'Rondo', 1: 'FreeCompany' }
const COMPANY_COLORS = { 1: '#8d8d8d', 2: '#ff7700', 3: '#229922' }
const KP_TYPE_LABELS = { 1: <AlertOutlined  title="Трансляционная"/>, 2: <CustomerServiceOutlined title='Профессиональная' /> }
const DEFAULT_PAGE_SIZE = 30
const { Content, Sider } = Layout
const ROLE_OPTIONS = [
  { value: 1, label: 'Менеджер', acl: 89 },
  { value: 2, label: 'Администратор', acl: 91 },
  { value: 3, label: 'Бухгалтер', acl: 90 },
  { value: 4, label: 'Инженер', acl: 153 },
]

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))

const COMPANY_OPTIONS = Object.entries(COMPANY_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}))

const KP_TYPE_OPTIONS = Object.entries(KP_TYPE_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}))

const editorUrl = (bidId, draftId) => `/bidsPDF/${bidId}/${draftId}`
const bidUrl = (bidId) => `/bids/${bidId}`

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const compactFilters = (filters) => {
  const next = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) next[key] = value
  })
  return next
}

const parseSort = (value) => {
  if (!value) return [{ key: 'id', order: 1 }]
  const [key, order] = value.trim().split('-')
  const parsedOrder = Number(order)
  if (!key || ![1, 2].includes(parsedOrder)) return [{ key: 'id', order: 1 }]
  return [{ key, order: parsedOrder }]
}

const formatDate = (iso) => {
  if (!iso) return <>—</>

  const d = new Date(iso)
  if (isNaN(d.getTime())) return <>—</>

  const pad = n => String(n).padStart(2, '0')

  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`

  return (
    <div style={{display: 'flex', flexDirection: 'column'}} title={time}>
      <div>{date}</div>
      {/* <div style={{color: 'gray'}}>{time}</div> */}
    </div>
  )
}

const getPersonName = (person) =>
  person ? [person.surname, person.name].filter(Boolean).join(' ') : ''

const EllipsisText = ({ children, className }) => (
  <Typography.Text
    className={`${classes.ellipsisText} ${className || ''}`}
    ellipsis={{ tooltip: children }}
  >
    {children}
  </Typography.Text>
)

function HeaderCell({ label, sortKey, orderBox, onSortChange, children }) {
  return (
    <div className="sa-table-box-cell">
      <div className="sa-table-head-on">
        <TableHeadNameWithSort
          sort_key={sortKey}
          active_sort_items={orderBox}
          on_sort_change={onSortChange}
        >
          {label}
        </TableHeadNameWithSort>
        <div className="sa-pa-3">
          {children}
        </div>
      </div>
    </div>
  )
}

function TextFilter({ value, onChange, type = 'text' }) {
  return (
    <Input
      size="small"
      type={type}
      variant="filled"
      allowClear
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      style={{ width: '100%' }}
    />
  )
}

function SelectFilter({ value, onChange, options }) {
  return (
    <Select
      size="small"
      variant="filled"
      allowClear
      value={value ?? null}
      options={options}
      onChange={val => onChange(val ?? null)}
      style={{ width: '100%' }}
    />
  )
}

function SomaPdfSiderFilters({ filters, onChange }) {
  return (
    <Affix offsetTop={115}>
      <div className="sider-body sider-body-filters">
        <div className="sider-unit">
          <div className="sider-unit-title">Подразделение</div>
          <div className="sider-unit-control">
            <Select
              placeholder=""
              style={{ width: '100%' }}
              value={filters.id_company ?? null}
              options={COMPANY_OPTIONS}
              onChange={value => onChange('id_company', value ?? null)}
              allowClear
            />
          </div>
        </div>
      </div>
    </Affix>
  )
}

export default function SomaPdfListPage({ userdata, new_changed_user_data }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpenedFilters, setIsOpenedFilters] = useState(false)
  const activeRole = userdata?.user?.sales_role ?? 0
  const availableRoles = ROLE_OPTIONS.filter(role => userdata?.acls?.includes(role.acl))
  const isOneRole = availableRoles.length === 1

  const [pagination, setPagination] = useState({
    current: toNumberOrNull(searchParams.get('page')) || 1,
    pageSize: toNumberOrNull(searchParams.get('limit')) || DEFAULT_PAGE_SIZE,
    total: 0,
  })
  const [orderBox, setOrderBox] = useState(() => parseSort(searchParams.get('sort')))
  const [filters, setFilters] = useState(() => compactFilters({
    id: searchParams.get('id'),
    bid_id: searchParams.get('bid_id'),
    status: searchParams.get('status'),
    kp_type: toNumberOrNull(searchParams.get('kp_type')),
    org: searchParams.get('org'),
    manager: searchParams.get('manager'),
    engineer: searchParams.get('engineer'),
    id_company: toNumberOrNull(searchParams.get('id_company')),
  }))
  const [mineOnly, setMineOnly] = useState(searchParams.get('mine') === '1')

  const load = useCallback(() => {
    setLoading(true)
    const activeSort = orderBox[0] || { key: 'id', order: 1 }
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      sort_by: activeSort.key,
      sort_order: activeSort.order === 2 ? 'asc' : 'desc',
      ...filters,
      ...(mineOnly ? { mine: 1 } : {}),
    }

    getDraftsList(params)
      .then(res => {
        setData(res.data || [])
        setPagination(prev => ({ ...prev, total: res.meta?.total ?? 0 }))
      })
      .catch(e => console.error('Ошибка загрузки списка PDF:', e))
      .finally(() => setLoading(false))
  }, [pagination.current, pagination.pageSize, orderBox, filters, mineOnly])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setSearchParams(() => {
      const next = new URLSearchParams()
      if (pagination.current !== 1) next.set('page', String(pagination.current))
      if (pagination.pageSize !== DEFAULT_PAGE_SIZE) next.set('limit', String(pagination.pageSize))
      if (mineOnly) next.set('mine', '1')

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) next.set(key, String(value))
      })

      if (orderBox.length > 0) {
        const sort = orderBox[0]
        if (sort.key !== 'id' || sort.order !== 1) next.set('sort', `${sort.key}-${sort.order}`)
      }

      return next
    }, { replace: true })
  }, [filters, mineOnly, orderBox, pagination.current, pagination.pageSize, setSearchParams])

  const setFilter = (key, value) => {
    setFilters(prev => compactFilters({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleSortChange = (key, order) => {
    setOrderBox(order === 0 ? [] : [{ key, order }])
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleMineChange = (value) => {
    setMineOnly(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const getCompanyColor = (idCompany) =>
    userdata?.companies?.find(company => Number(company.id) === Number(idCompany))?.color ||
    COMPANY_COLORS[idCompany] ||
    '#bfbfbf'

  const renderStatus = (status) => {
    const meta = STATUS_META[status] ?? {
      label: status || '—',
      color: 'default'
    }

    return (
      <Tag
        color={meta.color}
        style={{
          whiteSpace: 'normal',
          height: 'auto',
          textAlign: 'center',
          display: 'flex', alignItems: 'center'
        }}
      >
        {meta.label}
      </Tag>
    )
  }

  const changeRole = async (salesRole) => {
    try {
      await PROD_AXIOS_INSTANCE.post(`${ROUTE_PREFIX}/update/sales_role`, {
        place: salesRole,
        _token: CSRF_TOKEN,
      })
      new_changed_user_data?.()
    } catch (e) {
      console.error('Ошибка смены роли:', e)
    }
  }
  return (
    <div className={classes.page} style={{marginTop: '12px'}}>
      <Affix>
        <div style={{ padding: 0, backgroundColor: '#b4c9e1' }}>
          <div className="sa-control-panel sa-flex-space sa-pa-12 sa-list-header">
            <div className="sa-header-label-container">
              <div className="sa-header-label-container-small">
                <h1 className="sa-header-label">PDF-шаблоны</h1>
                <CurrencyMonitorBar />
              </div>
              <div className="sa-header-label-container-small">
                <div className="sa-vertical-flex">
                  <Button
                    onClick={() => setIsOpenedFilters(prev => !prev)}
                    className={isOpenedFilters ? 'sa-default-solid-btn-color' : 'sa-default-outlined-btn-color'}
                    color="default"
                    variant={isOpenedFilters ? 'solid' : 'outlined'}
                    icon={<FilterOutlined />}
                  >
                    Доп Фильтры
                  </Button>
                  <Tag
                    style={{
                      height: '32px',
                      lineHeight: '27px',
                      textAlign: 'center',
                      fontSize: '14px',
                    }}
                    color="geekblue"
                  >
                    Всего найдено: {pagination.total}
                  </Tag>
                </div>
                {activeRole > 0 && (
                  <div className={classes.roleBox}>
                    <span>Роль:</span>
                    {isOneRole ? (
                      <Tag
                        className={`
                          sa-tag-custom
                          ${activeRole === 1 ? 'sa-select-custom-manager' : ''}
                          ${activeRole === 2 ? 'sa-select-custom-admin' : ''}
                          ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}
                          ${activeRole === 4 ? 'sa-select-custom-engineer' : ''}
                        `}
                      >
                        {ROLE_OPTIONS.find(role => role.value === activeRole)?.label || 'Неизвестная роль'}
                      </Tag>
                    ) : (
                      <Select
                        className={`
                          ${activeRole === 1 ? 'sa-select-custom-manager' : ''}
                          ${activeRole === 2 ? 'sa-select-custom-admin' : ''}
                          ${activeRole === 3 ? 'sa-select-custom-bugh' : ''}
                          ${activeRole === 4 ? 'sa-select-custom-engineer' : ''}
                        `}
                        style={{ width: 150 }}
                        options={availableRoles}
                        value={activeRole}
                        onChange={changeRole}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Affix>

      <Layout className="sa-layout sa-w-100">
        <Sider
          collapsed={!isOpenedFilters}
          collapsedWidth={0}
          width="300px"
          style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}
        >
          <div className="sa-sider">
            {isOpenedFilters && (
              <SomaPdfSiderFilters
                filters={filters}
                onChange={setFilter}
              />
            )}
          </div>
        </Sider>

        <Content>
      <div className="sa-pagination-panel sa-pa-12 sa-back">
        <div className="sa-flex-space">
          <div className="sa-flex-gap">
            <Pagination
              defaultCurrent={1}
              pageSize={pagination.pageSize}
              pageSizeOptions={[30, 50, 100, 200, 300]}
              current={pagination.current}
              total={pagination.total}
              showSizeChanger
              onChange={(page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }))
              }}
              showQuickJumper
              locale={{
                items_per_page: 'на странице',
                jump_to: 'Перейти',
                jump_to_confirm: 'OK',
                page: 'Страница',
              }}
            />
          </div>
          <div />
          <div className="sa-flex-gap" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Switch checked={mineOnly} onChange={handleMineChange} />
            <span style={{ fontSize: 13 }}>Мои PDF</span>
          </div>
        </div>
      </div>

      <div className={`sa-pa-12 sa-table ${classes.tableWrap}`} style={{minWidth: '100%'}}>
        <Spin spinning={loading}>
          <div className={`sa-table-box ${classes.pdfTable}`}>
            <Affix offsetTop={46}>
              <div className="sa-table-box-header">
                <div className={`${classes.pdfTableRow} sa-table-box-row sa-table-box-row-header`}>
                  <HeaderCell label="ID" sortKey="id" orderBox={orderBox} onSortChange={handleSortChange}>
                    <TextFilter type="number" value={filters.id} onChange={value => setFilter('id', value)} />
                  </HeaderCell>
                  <HeaderCell label="ID КП" sortKey="bid_id" orderBox={orderBox} onSortChange={handleSortChange}>
                    <TextFilter type="number" value={filters.bid_id} onChange={value => setFilter('bid_id', value)} />
                  </HeaderCell>
                  <HeaderCell label="Этап" sortKey="status" orderBox={orderBox} onSortChange={handleSortChange}>
                    <SelectFilter value={filters.status} onChange={value => setFilter('status', value)} options={STATUS_OPTIONS} />
                  </HeaderCell>
                  <HeaderCell label="Тип" sortKey="kp_type" orderBox={orderBox} onSortChange={handleSortChange}>
                    <SelectFilter value={filters.kp_type} onChange={value => setFilter('kp_type', value)} options={KP_TYPE_OPTIONS} />
                  </HeaderCell>
                  <HeaderCell label="Организация" sortKey="org" orderBox={orderBox} onSortChange={handleSortChange}>
                    <TextFilter value={filters.org} onChange={value => setFilter('org', value)} />
                  </HeaderCell>
                  <HeaderCell label="Объект" sortKey="object" orderBox={orderBox} onSortChange={handleSortChange}>
                    <TextFilter value={filters.object} onChange={value => setFilter('object', value)} />
                  </HeaderCell>
                  <HeaderCell label="Менеджер" sortKey="manager" orderBox={orderBox} onSortChange={handleSortChange}>
                    <TextFilter value={filters.manager} onChange={value => setFilter('manager', value)} />
                  </HeaderCell>
                  <HeaderCell label="Инженер" sortKey="engineer" orderBox={orderBox} onSortChange={handleSortChange}>
                    <TextFilter value={filters.engineer} onChange={value => setFilter('engineer', value)} />
                  </HeaderCell>
                  <HeaderCell label="Моделей" sortKey="model_count" orderBox={orderBox} onSortChange={handleSortChange}>
                    <span className={classes.emptyFilter}>—</span>
                  </HeaderCell>
                  <HeaderCell label="Автор" sortKey="creator" orderBox={orderBox} onSortChange={handleSortChange}>
                    <span className={classes.emptyFilter}>—</span>
                  </HeaderCell>
                  <HeaderCell label="Создан" sortKey="created_at" orderBox={orderBox} onSortChange={handleSortChange}>
                    <span className={classes.emptyFilter}>—</span>
                  </HeaderCell>
                  <HeaderCell label="Изменён" sortKey="updated_at" orderBox={orderBox} onSortChange={handleSortChange}>
                    <span className={classes.emptyFilter}>—</span>
                  </HeaderCell>
                </div>
              </div>
            </Affix>

            {data.length === 0 && !loading ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : data.map(row => {
              const orgName     = row.form_data?.client_company?.name || row.form_data?.target_occupy || '—'
              const objectName  = row.object || row.bid_object || null
              const managerName = getPersonName(row.manager) || row.form_data?.manager_name || '—'
              const engineerName = getPersonName(row.engineer) || '—'
              const creatorName = getPersonName(row.creator) || '—'

              return (
                <div
                  key={row.id}
                  className={`${classes.pdfTableRow} ${classes.companyMarkedRow} sa-table-box-row`}
                  style={{ '--company-color': getCompanyColor(row.id_company) }}
                  onDoubleClick={() => window.open(editorUrl(row.bid_id, row.id), '_blank')}
                >
                  <div className="sa-table-box-cell">
                    <a onClick={e => { e.stopPropagation(); navigate(editorUrl(row.bid_id, row.id)) }}>{row.id}</a>
                  </div>
                  <div className="sa-table-box-cell">
                    <a onClick={e => { e.stopPropagation(); navigate(bidUrl(row.bid_id)) }}>{row.bid_id}</a>
                  </div>
                  <div className="sa-table-box-cell">{renderStatus(row.status)}</div>
                  <div className="sa-table-box-cell">{KP_TYPE_LABELS[row.kp_type] || row.kp_type || '—'}</div>
                  <div className={`sa-table-box-cell text-align-left ${classes.orgNameCell}`}>{orgName}</div>
                  <div className={`sa-table-box-cell text-align-left ${classes.orgNameCell}`}>
                    {objectName
                      ? <EllipsisText>{objectName}</EllipsisText>
                      : <span className={classes.muted}>—</span>
                    }
                  </div>
                  <div className="sa-table-box-cell text-align-left">
                    <EllipsisText>{managerName}</EllipsisText>
                  </div>
                  <div className="sa-table-box-cell text-align-left">
                    {engineerName === '—' ? <span className={classes.muted}>—</span> : <EllipsisText>{engineerName}</EllipsisText>}
                  </div>
                  <div className="sa-table-box-cell">{row.bid_model_count}</div>
                  <div className="sa-table-box-cell text-align-left">
                    <EllipsisText>{creatorName}</EllipsisText>
                  </div>
                  <div className="sa-table-box-cell">{formatDate(row.created_at)}</div>
                  <div className="sa-table-box-cell">{formatDate(row.updated_at)}</div>
                </div>
              )
            })}
          </div>
        </Spin>
      </div>
        </Content>
      </Layout>
    </div>
  )
}
