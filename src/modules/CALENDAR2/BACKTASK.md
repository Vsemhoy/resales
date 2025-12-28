# Техническое задание: Модули "Календарь" и "Отчёты"

**Дата:** 28.12.2025  
**Версия:** 1.0  
**Статус:** Готово к разработке  

---

## 📋 Общее описание

Реализовать бэкенд для двух новых модулей:
1. **Календарь** — отображение событий сотрудников в календарном виде
2. **Отчёты** — табличные отчёты по активности сотрудников

Оба модуля работают с **единой сводной таблицей событий** `calendar_events`, которая агрегирует данные из существующих таблиц (bids, orgs_calls, orgs_meetings, orgs_notes, projects и т.д.).

---

## 🗄️ База данных

### Новые таблицы

#### 1. `calendar_events` — Сводная таблица событий

```sql
CREATE TABLE calendar_events (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Кто создал
    user_id         INT UNSIGNED NOT NULL,
    user_name       VARCHAR(100) NOT NULL COMMENT 'Денормализовано: Фамилия И.О.',
    department_id   INT UNSIGNED COMMENT 'ID отдела сотрудника',
    id_company      INT UNSIGNED NOT NULL COMMENT 'Филиал сотрудника',
    
    -- Тип события
    type            TINYINT UNSIGNED NOT NULL COMMENT 'ID типа из EVENT_TYPES',
    type_id         BIGINT UNSIGNED COMMENT 'ID записи в исходной таблице',
    type_table      VARCHAR(50) COMMENT 'Название исходной таблицы',
    
    -- Контекст (организация-клиент)
    org_id          INT UNSIGNED COMMENT 'ID организации',
    org_name        VARCHAR(255) COMMENT 'Денормализовано: название организации',
    is_curator      TINYINT UNSIGNED DEFAULT 0 COMMENT '1 = пользователь куратор этой орг.',
    
    -- Когда
    event_date      DATE NOT NULL COMMENT 'Дата события (для календаря)',
    event_time      TIME COMMENT 'Время события',
    
    -- Контент
    content         TEXT COMMENT 'Краткое описание / саммари',
    private         TINYINT UNSIGNED DEFAULT 0 COMMENT '1 = приватное (только автор видит)',
    
    -- Дополнительные данные
    amount          DECIMAL(15,2) COMMENT 'Сумма (для КП/счетов)',
    status          VARCHAR(50) COMMENT 'Статус события',
    parent_event_id BIGINT UNSIGNED COMMENT 'Связь с родительским событием (воронка)',
    
    -- Счётчики
    comments_count  INT UNSIGNED DEFAULT 0 COMMENT 'Количество комментариев',
    
    -- Timestamps
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL COMMENT 'Soft delete',
    
    -- Индексы
    INDEX idx_company_date (id_company, event_date),
    INDEX idx_user_date (user_id, event_date),
    INDEX idx_type_date (type, event_date),
    INDEX idx_org (org_id),
    INDEX idx_composite (id_company, user_id, type, event_date, deleted_at),
    INDEX idx_deleted (deleted_at),
    
    FOREIGN KEY (user_id) REFERENCES staff_list(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. `calendar_event_comments` — Комментарии к событиям

```sql
CREATE TABLE calendar_event_comments (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    event_id        BIGINT UNSIGNED NOT NULL,
    
    user_id         INT UNSIGNED NOT NULL,
    user_name       VARCHAR(100) NOT NULL COMMENT 'Денормализовано: Фамилия И.О.',
    id_company      INT UNSIGNED NOT NULL,
    
    content         TEXT NOT NULL,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    
    INDEX idx_event (event_id),
    INDEX idx_user (user_id),
    
    FOREIGN KEY (event_id) REFERENCES calendar_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES staff_list(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. `user_notes` — Персональные заметки (типы 14, 15)

```sql
CREATE TABLE user_notes (
    id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    user_id         INT UNSIGNED NOT NULL,
    id_company      INT UNSIGNED NOT NULL,
    
    title           VARCHAR(255) COMMENT 'Заголовок заметки',
    content         TEXT NOT NULL,
    
    is_private      TINYINT UNSIGNED DEFAULT 1 COMMENT '1 = приватная, 0 = публичная',
    
    -- Опциональная привязка к организации
    org_id          INT UNSIGNED COMMENT 'ID организации (если есть)',
    
    -- Привязка к дате (для календаря)
    note_date       DATE COMMENT 'Дата заметки',
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL,
    
    INDEX idx_user_date (user_id, note_date),
    INDEX idx_company_public (id_company, is_private, note_date),
    INDEX idx_org (org_id),
    
    FOREIGN KEY (user_id) REFERENCES staff_list(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Типы событий (справочник)

Хранить в конфиге или отдельной таблице `calendar_event_types`:

| id | name | color | real | noreport | Источник данных |
|----|------|-------|------|----------|-----------------|
| 1 | КП | #8eaaff | 1 | 0 | bids (status=draft/sent) |
| 2 | Счёт | #85ffda | 1 | 0 | bids (status=invoice) |
| 3 | Счёт к администратору | #52e6b9 | 1 | 0 | bids (status=to_admin) |
| 4 | Счёт к бухгалтеру | #33d1a2 | 1 | 0 | bids (status=to_buh) |
| 5 | Счёт завершён | #09af7d | 1 | 0 | bids (status=completed) |
| 6 | Встреча | #f7ed59 | 1 | 0 | orgs_meetings |
| 7 | Звонок | #faa781 | 1 | 0 | orgs_calls |
| 8 | Запрос на кураторство | #7997fa | 1 | 0 | curator_requests |
| 9 | Взятие кураторства | #59e5f7 | 1 | 0 | orgs (изменение куратора) |
| 10 | Заметка | #d38efc | 1 | 0 | orgs_notes |
| 11 | Добавление контакта | #ca6f7e | 1 | 0 | orgsusers (created) |
| 12 | Обновление контакта | #dfa4ad | 1 | 0 | orgsusers (updated) |
| 13 | Проект | #5554aa | 1 | 0 | projects |
| 14 | Мои заметки | #7c636f | 1 | 1 | user_notes (is_private=1) |
| 15 | Публичные заметки | #a08389 | 1 | 0 | user_notes (is_private=0) |
| 16 | Карточка клиента | #a4d44a | 1 | 0 | user_notes (is_private=0) |

**Примечания:**
- `real=1` — тип физически существует в БД
- `noreport=1` — не показывать в отчётах

---

## 🔄 Миграции Laravel

### Migration: create_calendar_events_table

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            
            // Кто
            $table->unsignedInteger('user_id');
            $table->string('user_name', 100);
            $table->unsignedInteger('department_id')->nullable();
            $table->unsignedInteger('id_company');
            
            // Что
            $table->unsignedTinyInteger('type');
            $table->unsignedBigInteger('type_id')->nullable();
            $table->string('type_table', 50)->nullable();
            
            // Для кого
            $table->unsignedInteger('org_id')->nullable();
            $table->string('org_name', 255)->nullable();
            $table->unsignedTinyInteger('is_curator')->default(0);
            
            // Когда
            $table->date('event_date');
            $table->time('event_time')->nullable();
            
            // Контент
            $table->text('content')->nullable();
            $table->unsignedTinyInteger('private')->default(0);
            
            // Доп. данные
            $table->decimal('amount', 15, 2)->nullable();
            $table->string('status', 50)->nullable();
            $table->unsignedBigInteger('parent_event_id')->nullable();
            
            // Счётчики
            $table->unsignedInteger('comments_count')->default(0);
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Индексы
            $table->index(['id_company', 'event_date']);
            $table->index(['user_id', 'event_date']);
            $table->index(['type', 'event_date']);
            $table->index('org_id');
            $table->index(['id_company', 'user_id', 'type', 'event_date', 'deleted_at'], 'idx_composite');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('staff_list')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_events');
    }
};
```

### Migration: create_calendar_event_comments_table

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_event_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('event_id');
            
            $table->unsignedInteger('user_id');
            $table->string('user_name', 100);
            $table->unsignedInteger('id_company');
            
            $table->text('content');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('event_id');
            $table->index('user_id');
            
            $table->foreign('event_id')->references('id')->on('calendar_events')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('staff_list')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_comments');
    }
};
```

### Migration: create_user_notes_table

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_notes', function (Blueprint $table) {
            $table->id();
            
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('id_company');
            
            $table->string('title', 255)->nullable();
            $table->text('content');
            
            $table->unsignedTinyInteger('is_private')->default(1);
            
            $table->unsignedInteger('org_id')->nullable();
            $table->date('note_date')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'note_date']);
            $table->index(['id_company', 'is_private', 'note_date']);
            $table->index('org_id');
            
            $table->foreign('user_id')->references('id')->on('staff_list')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notes');
    }
};
```

---

## 🔌 API Endpoints

**Base URL:** `/api/resales/calendar`

### 1. Получение событий календаря

```
GET /api/resales/calendar/events
```

**Query параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| company_id | int | Да | ID филиала |
| date_from | string | Да | Начало периода (YYYY-MM-DD) |
| date_to | string | Да | Конец периода (YYYY-MM-DD) |
| user_ids | string | Нет | ID пользователей через запятую |
| types | string | Нет | ID типов через запятую |
| has_comments | int | Нет | 1 = только с комментариями |

**Пример запроса:**
```
GET /api/resales/calendar/events?company_id=2&date_from=2025-12-01&date_to=2025-12-31&user_ids=101,102&types=6,7
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 101,
      "user_name": "Петров А.С.",
      "department_id": 5,
      "id_company": 2,
      "type": 7,
      "type_id": 4521,
      "type_table": "orgs_calls",
      "org_id": 100,
      "org_name": "ООО \"Технопром\"",
      "is_curator": 1,
      "event_date": "2025-12-25",
      "event_time": "10:30:00",
      "content": "Обсуждение условий поставки на Q1 2026",
      "private": 0,
      "amount": null,
      "status": null,
      "comments_count": 2,
      "created_at": "2025-12-25T10:30:00.000000Z",
      "updated_at": null
    }
  ],
  "meta": {
    "total": 156,
    "filtered": 45
  }
}
```

**Логика фильтрации:**
- Исключать `deleted_at IS NOT NULL`
- Для `private=1` показывать только автору (`user_id = current_user`)
- Публичные заметки (type=15) видны всем в филиале

---

### 2. Получение данных для Heatmap

```
GET /api/resales/calendar/heatmap
```

**Query параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| company_id | int | Да | ID филиала |
| year | int | Да | Год (YYYY) |
| user_ids | string | Нет | ID пользователей через запятую |
| types | string | Нет | ID типов через запятую |

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "2025-12-01": { "count": 5, "types": { "7": 3, "10": 2 } },
    "2025-12-02": { "count": 8, "types": { "1": 2, "7": 4, "6": 2 } },
    "2025-12-03": { "count": 0, "types": {} }
  }
}
```

---

### 3. Получение одного события (для Sidebar)

```
GET /api/resales/calendar/events/{id}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 101,
    "user_name": "Петров А.С.",
    "department_id": 5,
    "id_company": 2,
    "type": 7,
    "type_id": 4521,
    "type_table": "orgs_calls",
    "org_id": 100,
    "org_name": "ООО \"Технопром\"",
    "is_curator": 1,
    "event_date": "2025-12-25",
    "event_time": "10:30:00",
    "content": "Обсуждение условий поставки на Q1 2026",
    "private": 0,
    "amount": null,
    "status": null,
    "comments_count": 2,
    "created_at": "2025-12-25T10:30:00.000000Z",
    "comments": [
      {
        "id": 1,
        "user_id": 102,
        "user_name": "Иванова М.А.",
        "content": "Уточни сроки поставки",
        "created_at": "2025-12-25T11:00:00.000000Z"
      }
    ],
    "source_data": {
      // Данные из исходной таблицы (orgs_calls в данном случае)
      "subscriber": "Дмитрий",
      "post": "Начальник участка",
      "phone": "+7-999-123-45-67",
      "theme": "условия поставки",
      "note": "Полный текст заметки..."
    }
  }
}
```

---

### 4. Комментарии к событию

#### 4.1. Получить комментарии

```
GET /api/resales/calendar/events/{id}/comments
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "user_id": 102,
      "user_name": "Иванова М.А.",
      "id_company": 2,
      "content": "Уточни сроки поставки",
      "created_at": "2025-12-25T11:00:00.000000Z"
    }
  ]
}
```

#### 4.2. Добавить комментарий

```
POST /api/resales/calendar/events/{id}/comments
```

**Request Body:**
```json
{
  "content": "Текст комментария"
}
```

**Ответ (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "event_id": 1,
    "user_id": 101,
    "user_name": "Петров А.С.",
    "id_company": 2,
    "content": "Текст комментария",
    "created_at": "2025-12-25T14:30:00.000000Z"
  }
}
```

**Логика:**
- `user_id`, `user_name`, `id_company` берутся из текущего авторизованного пользователя
- После создания увеличить `calendar_events.comments_count` на 1

#### 4.3. Удалить комментарий

```
DELETE /api/resales/calendar/events/{eventId}/comments/{commentId}
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "message": "Комментарий удалён"
}
```

**Логика:**
- Удалять могут только: автор комментария ИЛИ админ
- Soft delete (`deleted_at`)
- Уменьшить `calendar_events.comments_count` на 1

---

### 5. Персональные заметки (User Notes)

#### 5.1. Получить заметки

```
GET /api/resales/calendar/notes
```

**Query параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| date_from | string | Нет | Начало периода |
| date_to | string | Нет | Конец периода |
| is_private | int | Нет | 0 или 1 |
| org_id | int | Нет | Фильтр по организации |

**Логика фильтрации:**
- Приватные (`is_private=1`) — только свои
- Публичные (`is_private=0`) — все в филиале

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 101,
      "id_company": 2,
      "title": "Напомнить про оплату",
      "content": "Позвонить в ООО Технопром...",
      "is_private": 1,
      "org_id": 100,
      "org_name": "ООО \"Технопром\"",
      "note_date": "2025-12-27",
      "created_at": "2025-12-27T09:00:00.000000Z"
    }
  ]
}
```

#### 5.2. Создать заметку

```
POST /api/resales/calendar/notes
```

**Request Body:**
```json
{
  "title": "Заголовок заметки",
  "content": "Текст заметки",
  "is_private": 1,
  "org_id": 100,
  "note_date": "2025-12-27"
}
```

**Ответ (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "user_id": 101,
    "id_company": 2,
    "title": "Заголовок заметки",
    "content": "Текст заметки",
    "is_private": 1,
    "org_id": 100,
    "note_date": "2025-12-27",
    "created_at": "2025-12-27T10:00:00.000000Z"
  }
}
```

**Логика:**
- `user_id`, `id_company` берутся из текущего пользователя
- **ВАЖНО:** При создании также создать запись в `calendar_events` с:
  - `type`: 14 (приватная) или 15 (публичная)
  - `type_id`: ID созданной заметки
  - `type_table`: 'user_notes'
  - `private`: значение `is_private`
  - `event_date`: значение `note_date`

#### 5.3. Обновить заметку

```
PUT /api/resales/calendar/notes/{id}
```

**Request Body:**
```json
{
  "title": "Новый заголовок",
  "content": "Новый текст",
  "org_id": null,
  "note_date": "2025-12-28"
}
```

**Логика:**
- Редактировать может только автор
- Обновить также связанную запись в `calendar_events`

#### 5.4. Удалить заметку

```
DELETE /api/resales/calendar/notes/{id}
```

**Логика:**
- Удалять может только автор
- Soft delete
- Также soft delete связанной записи в `calendar_events`

---

### 6. Данные для отчётов

```
GET /api/resales/calendar/reports
```

**Query параметры:**

| Параметр | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| company_id | int | Да | ID филиала |
| date_from | string | Да | Начало периода |
| date_to | string | Да | Конец периода |
| department_id | int | Нет | ID отдела |
| user_ids | string | Нет | ID пользователей |
| types | string | Нет | ID типов |

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": {
    "rows": [
      {
        "user_id": 101,
        "user_name": "Петров А.С.",
        "user_full_name": "Петров Александр Сергеевич",
        "department_id": 5,
        "department_name": "Отдел оптовых продаж",
        "type_1": 12,
        "type_2": 8,
        "type_3": 2,
        "type_4": 2,
        "type_5": 1,
        "type_6": 4,
        "type_7": 45,
        "type_8": 1,
        "type_9": 1,
        "type_10": 15,
        "type_11": 2,
        "type_12": 3,
        "type_13": 2,
        "type_15": 2,
        "total": 100
      }
    ],
    "totals": {
      "type_1": 35,
      "type_2": 25,
      "type_7": 144,
      "total": 264
    }
  }
}
```

**SQL-запрос (примерный):**
```sql
SELECT 
    user_id,
    user_name,
    department_id,
    SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) as type_1,
    SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) as type_2,
    -- ... остальные типы
    COUNT(*) as total
FROM calendar_events
WHERE id_company = ?
    AND event_date BETWEEN ? AND ?
    AND deleted_at IS NULL
    AND (private = 0 OR user_id = ?)
GROUP BY user_id, user_name, department_id
```

---

### 7. Справочники

#### 7.1. Список пользователей филиала

```
GET /api/resales/calendar/users?company_id=2
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 101,
      "user_name": "Александр",
      "user_surname": "Петров",
      "user_patronymic": "Сергеевич",
      "user_occupy": "Руководитель отдела продаж",
      "department_id": 5,
      "department_name": "Отдел оптовых продаж",
      "id_company": 2,
      "is_boss": 1
    }
  ]
}
```

#### 7.2. Типы событий

```
GET /api/resales/calendar/event-types
```

**Ответ (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "КП",
      "color": "#8eaaff",
      "title": "Создание коммерческого предложения",
      "real": 1,
      "noreport": 0
    }
  ]
}
```

---

## 🔁 Синхронизация calendar_events

### Observer/Event подход

При создании/обновлении/удалении записей в исходных таблицах нужно синхронизировать `calendar_events`.

**Таблицы для наблюдения:**

| Таблица | Тип события | Триггер |
|---------|-------------|---------|
| bids | 1-5 | created, status changed |
| orgs_meetings | 6 | created, updated, deleted |
| orgs_calls | 7 | created, updated, deleted |
| curator_requests | 8 | created |
| orgs | 9 | curator changed |
| orgs_notes | 10 | created, updated, deleted |
| orgsusers | 11, 12 | created, updated |
| projects | 13 | created, updated, deleted |
| user_notes | 14, 15 | created, updated, deleted |

### Пример Observer для orgs_calls

```php
<?php

namespace App\Observers;

use App\Models\OrgsCall;
use App\Models\CalendarEvent;

class OrgsCallObserver
{
    public function created(OrgsCall $call): void
    {
        $this->syncToCalendar($call);
    }

    public function updated(OrgsCall $call): void
    {
        $this->syncToCalendar($call);
    }

    public function deleted(OrgsCall $call): void
    {
        CalendarEvent::where('type', 7)
            ->where('type_id', $call->id)
            ->update(['deleted_at' => now()]);
    }

    private function syncToCalendar(OrgsCall $call): void
    {
        $user = $call->creator; // relation
        $org = $call->organization; // relation
        
        CalendarEvent::updateOrCreate(
            [
                'type' => 7,
                'type_id' => $call->id,
            ],
            [
                'user_id' => $call->id8staff_list,
                'user_name' => $this->formatUserName($user),
                'department_id' => $user->id_departament ?? null,
                'id_company' => $user->id_company,
                'type_table' => 'orgs_calls',
                'org_id' => $call->id_orgs,
                'org_name' => $org->name ?? null,
                'is_curator' => $this->isCurator($call->id8staff_list, $call->id_orgs),
                'event_date' => $call->date->format('Y-m-d'),
                'event_time' => $call->date->format('H:i:s'),
                'content' => $this->generateContent($call),
                'private' => 0,
            ]
        );
    }

    private function formatUserName($user): string
    {
        return sprintf(
            '%s %s.%s.',
            $user->surname,
            mb_substr($user->name, 0, 1),
            mb_substr($user->secondname, 0, 1)
        );
    }

    private function generateContent(OrgsCall $call): string
    {
        $content = $call->theme ?? '';
        if ($call->note) {
            $content .= ': ' . mb_substr($call->note, 0, 100);
        }
        return $content;
    }

    private function isCurator(int $userId, int $orgId): int
    {
        // Проверить, является ли пользователь куратором организации
        return \App\Models\Org::where('id', $orgId)
            ->where('id8staff_list', $userId)
            ->exists() ? 1 : 0;
    }
}
```

### Artisan команда для начального заполнения

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SyncCalendarEvents extends Command
{
    protected $signature = 'calendar:sync {--from= : Дата начала} {--to= : Дата конца}';
    protected $description = 'Синхронизация событий в calendar_events';

    public function handle()
    {
        $from = $this->option('from') ?? now()->subYear()->format('Y-m-d');
        $to = $this->option('to') ?? now()->format('Y-m-d');

        $this->info("Синхронизация с {$from} по {$to}");

        // Синхронизация каждого типа
        $this->syncCalls($from, $to);
        $this->syncMeetings($from, $to);
        $this->syncNotes($from, $to);
        $this->syncProjects($from, $to);
        $this->syncBids($from, $to);
        // ... и т.д.

        $this->info('Готово!');
    }
}
```

---

## 🔐 Права доступа

### Роли и видимость

| Роль | Видит события | Может комментировать |
|------|---------------|---------------------|
| Обычный сотрудник | Только свои | Только свои |
| Руководитель отдела | Все в своём отделе | Все в своём отделе |
| is_admin / super | Все во всех филиалах | Все |

### Middleware проверки

```php
// Проверка доступа к событию
public function canViewEvent(User $user, CalendarEvent $event): bool
{
    // Приватные — только автор
    if ($event->private && $event->user_id !== $user->id) {
        return false;
    }

    // Админ видит всё
    if ($user->is_admin || $user->super) {
        return true;
    }

    // Проверка филиала
    if ($event->id_company !== $user->id_company) {
        return false;
    }

    // Руководитель видит свой отдел
    if ($user->is_boss) {
        return true;
    }

    // Обычный сотрудник — только свои
    return $event->user_id === $user->id;
}
```

---

## 📝 Чек-лист для бэкендера

### База данных
- [ ] Создать миграцию `calendar_events`
- [ ] Создать миграцию `calendar_event_comments`
- [ ] Создать миграцию `user_notes`
- [ ] Добавить индексы
- [ ] Проверить foreign keys

### Модели
- [ ] CalendarEvent с relations
- [ ] CalendarEventComment
- [ ] UserNote
- [ ] Scopes для фильтрации

### Observers
- [ ] OrgsCallObserver
- [ ] OrgsMeetingObserver
- [ ] OrgsNoteObserver
- [ ] ProjectObserver
- [ ] BidObserver (с учётом статусов)
- [ ] UserNoteObserver
- [ ] OrgsuserObserver

### Controllers
- [ ] CalendarEventController
- [ ] CalendarCommentController
- [ ] UserNoteController
- [ ] ReportController

### Routes
- [ ] Добавить роуты в `routes/api.php`
- [ ] Группировка под `resales/calendar`
- [ ] Middleware auth

### Тестирование
- [ ] Unit tests для observers
- [ ] Feature tests для API
- [ ] Проверка прав доступа

### Команды
- [ ] `calendar:sync` — начальное заполнение
- [ ] Scheduler для периодической синхронизации (опционально)

---

## ❓ Вопросы для уточнения

1. **Структура bids**: какие статусы соответствуют типам 1-5? Нужна маппинг-таблица.

2. **Кураторство**: где хранится информация о кураторе организации? Поле `id8staff_list` в таблице `orgs`?

3. **Права руководителя**: руководитель определяется полем `is_boss` в `staff_list`?

4. **Уведомления**: нужны ли уведомления при новых комментариях?

5. **Soft delete**: использовать ли `SoftDeletes` во всех моделях?

---

**Контакт для вопросов:** [указать контакт]

**Ожидаемый срок:** 2-3 недели после выхода из отпуска
