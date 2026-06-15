import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Input, Pagination, Switch } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { getDraftsList } from '../BID_PDF_PAGE/api/drafts.api'
import { getUser } from '../BID_PDF_PAGE/api'
import { STATUS_META } from '../BID_PDF_PAGE/useDraftStatus'
import classes from './SomaPdfListPage.module.css'

const COMPANY_LABELS = { 2: 'Arstel', 3: 'Rondo', 1: 'FreeCompany' }
const KP_TYPE_LABELS = { 1: 'Трансляция', 2: 'Проф' }

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, meta]) => ({
  value, label: meta.label,
}))

const editorUrl = (bidId, draftId) => `/bidsPDF/${bidId}/${draftId}`
const bidUrl    = (bidId)          => `/bids/${bidId}`

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function SomaPdfListPage() {
  const navigate = useNavigate()

  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [meId,    setMeId]    = useState(null)

  const [pagination, setPagination] = useState({ current: 1, pageSize: 30, total: 0 })
  const [sorter,     setSorter]      = useState({ field: 'id', order: 'descend' })
  const [filters,    setFilters]     = useState({})
  const [mineOnly,   setMineOnly]    = useState(false)

  useEffect(() => {
    getUser().then(d => setMeId(d?.user?.id ?? null)).catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    const sortBy    = sorter.field || 'id'
    const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc'

    const params = {
      page:  pagination.current,
      limit: pagination.pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
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
  }, [pagination.current, pagination.pageSize, sorter, filters, mineOnly])

  useEffect(() => { load() }, [load])

  const handleTableChange = (_p, _filters, sorterCfg) => {
    if (sorterCfg?.field) {
      setSorter({ field: sorterCfg.field, order: sorterCfg.order })
    }
  }

  // ─── Фильтры по столбцам ──────────────────────────────────────────────────
  const setFilter = (key, value) => {
    setFilters(prev => {
      const next = { ...prev }
      if (value === '' || value === undefined || value === null) delete next[key]
      else next[key] = value
      return next
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const textFilterDropdown = (key, placeholder) => () => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder={placeholder}
        value={filters[key] ?? ''}
        onChange={e => setFilter(key, e.target.value)}
        style={{ width: 180 }}
        autoFocus
      />
    </div>
  )

  const handleFilterChange = (_p, antFilters) => {
    setFilter('status',     antFilters.status?.[0]     ?? null)
    setFilter('id_company', antFilters.id_company?.[0] ?? null)
    setFilter('kp_type',    antFilters.kp_type?.[0]    ?? null)
  }

  const columns = [
    {
      title: 'ID', dataIndex: 'id', key: 'id', width: 60,
      sorter: true,
      filterDropdown: textFilterDropdown('id', 'ID черновика'),
      filterIcon: <SearchOutlined />,
      render: (id, row) => (
        <a onClick={e => { e.stopPropagation(); navigate(editorUrl(row.bid_id, id)) }}>{id}</a>
      ),
    },
    {
      title: 'ID КП', dataIndex: 'bid_id', key: 'bid_id', width: 90,
      sorter: true,
      filterDropdown: textFilterDropdown('bid_id', 'ID КП'),
      filterIcon: <SearchOutlined />,
      render: (bidId) => (
        <a onClick={e => { e.stopPropagation(); navigate(bidUrl(bidId)) }}>{bidId}</a>
      ),
    },
    {
      title: 'Этап', dataIndex: 'status', key: 'status', width: 170,
      sorter: true,
      filters: STATUS_OPTIONS.map(o => ({ text: o.label, value: o.value })),
      filteredValue: filters.status ? [filters.status] : null,
      onFilter: () => true,
      render: (status) => {
        const meta = STATUS_META[status] ?? { label: status, color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: 'Тип', dataIndex: 'kp_type', key: 'kp_type', width: 110,
      filters: Object.entries(KP_TYPE_LABELS).map(([value, text]) => ({ text, value })),
      filteredValue: filters.kp_type ? [filters.kp_type] : null,
      onFilter: () => true,
      render: (kpType) => KP_TYPE_LABELS[kpType] || kpType,
    },
    {
      title: 'Организация', key: 'org',
      filterDropdown: textFilterDropdown('org', 'Название организации'),
      filterIcon: <SearchOutlined />,
      render: (_, row) => row.form_data?.client_company?.name || row.form_data?.target_occupy || '—',
    },
    {
      title: 'Менеджер', key: 'manager',
      filterDropdown: textFilterDropdown('manager', 'Менеджер'),
      filterIcon: <SearchOutlined />,
      render: (_, row) => row.manager
        ? [row.manager.surname, row.manager.name].filter(Boolean).join(' ')
        : (row.form_data?.manager_name || '—'),
    },
    {
      title: 'Инженер', key: 'engineer',
      filterDropdown: textFilterDropdown('engineer', 'Инженер'),
      filterIcon: <SearchOutlined />,
      render: (_, row) => row.engineer
        ? [row.engineer.surname, row.engineer.name].filter(Boolean).join(' ')
        : <span style={{ color: '#bfbfbf' }}>—</span>,
    },
    {
      title: 'Моделей', dataIndex: 'bid_model_count', key: 'model_count', width: 80, align: 'center',
    },
    {
      title: 'Подразделение', dataIndex: 'id_company', key: 'id_company', width: 130,
      filters: Object.entries(COMPANY_LABELS).map(([value, text]) => ({ text, value })),
      filteredValue: filters.id_company ? [filters.id_company] : null,
      onFilter: () => true,
      render: (idCompany) => COMPANY_LABELS[idCompany] || idCompany,
    },
    {
      title: 'Автор', key: 'creator', width: 150,
      render: (_, row) => row.creator
        ? [row.creator.surname, row.creator.name].filter(Boolean).join(' ')
        : '—',
    },
    {
      title: 'Создан', dataIndex: 'created_at', key: 'created_at', width: 130,
      render: formatDate,
    },
    {
      title: 'Изменён', dataIndex: 'updated_at', key: 'updated_at', width: 130,
      sorter: true,
      render: formatDate,
    },
  ]

  return (
    <div>
      <div className={'sa-pagination-panel sa-pa-12 sa-back'}>
        <div className={'sa-flex-space'}>
          <div className={'sa-flex-gap'}>
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
          <div></div>
          <div className={'sa-flex-gap'} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Switch checked={mineOnly} onChange={v => { setMineOnly(v); setPagination(p => ({ ...p, current: 1 })) }} />
            <span style={{ fontSize: 13 }}>Мои PDF</span>
          </div>
        </div>
      </div>

      <div className={`sa-pa-12 sa-table ${classes.tableWrap}`} style={{ paddingTop: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
          onChange={(p, f, s) => { handleTableChange(p, f, s); handleFilterChange(p, f) }}
          onRow={(row) => ({
            onDoubleClick: () => window.open(editorUrl(row.bid_id, row.id), '_blank'),
          })}
        />
      </div>
    </div>
  )
}
