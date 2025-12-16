# ШПАРГАЛКА: Antd Form для TORG_PAGE

## Быстрый старт

```jsx
// 1. Создаём форму в родителе
const [mainForm] = Form.useForm();

// 2. Загружаем данные
mainForm.setFieldsValue({ name: 'ООО Рога', contacts: [...] });

// 3. Получаем данные для сохранения
const values = mainForm.getFieldsValue(true);

// 4. Проверяем, есть ли изменения
const hasChanges = mainForm.isFieldsTouched();
```

## Form.List — динамические массивы

```jsx
<Form.List name="contacts">
  {(fields, { add, remove }) => (
    <>
      {fields.map(({ key, name, ...restField }) => (
        <div key={key}>
          <Form.Item {...restField} name={[name, 'lastname']}>
            <Input />
          </Form.Item>
          <Button onClick={() => remove(name)}>Удалить</Button>
        </div>
      ))}
      <Button onClick={() => add({ id: `new_${Date.now()}`, command: 'create' })}>
        Добавить
      </Button>
    </>
  )}
</Form.List>
```

## Вложенные списки (телефоны внутри контакта)

```jsx
<Form.List name="contacts">
  {(contactFields) => (
    contactFields.map(({ name: contactIndex }) => (
      <Form.List name={[contactIndex, 'phones']}>
        {(phoneFields, { add, remove }) => (
          // Телефоны этого контакта
        )}
      </Form.List>
    ))
  )}
</Form.List>
```

## Пометка элемента как изменённого

```jsx
// При любом onChange
const handleChange = (fieldPath, index) => {
  const item = form.getFieldValue([...fieldPath, index]);
  
  // Не трогаем новые элементы - у них уже command: 'create'
  if (!String(item.id).startsWith('new_')) {
    form.setFieldValue([...fieldPath, index, 'command'], 'update');
  }
  form.setFieldValue([...fieldPath, index, '_modified'], true);
};
```

## Удаление элемента

```jsx
const handleRemove = (fieldPath, index, removeFn) => {
  const item = form.getFieldValue([...fieldPath, index]);
  
  if (String(item.id).startsWith('new_')) {
    // Новый элемент - просто удаляем из формы
    removeFn(index);
  } else {
    // Существующий - помечаем как удалённый
    form.setFieldValue([...fieldPath, index, 'deleted'], 1);
    form.setFieldValue([...fieldPath, index, 'command'], 'delete');
    form.setFieldValue([...fieldPath, index, '_modified'], true);
  }
};
```

## Фильтрация удалённых при рендере

```jsx
{fields.map(({ key, name }) => {
  const item = form.getFieldValue(['contacts', name]);
  if (item?.deleted === 1) return null;  // Скрываем удалённые
  
  return <ContactItem key={key} name={name} />;
})}
```

## Сборка данных для отправки

```jsx
const getModifiedItems = (items) => {
  return (items || [])
    .filter(item => item._modified || item.command)  // Только изменённые
    .map(({ _modified, _original, ...rest }) => rest);  // Убираем служебные поля
};

const payload = {
  main: hasMainChanges ? { ...mainFields } : null,
  contacts: getModifiedItems(values.contacts),
  org_phones: getModifiedItems(values.phones),
  // ...
};
```

## Частые ошибки

### ❌ Неправильно
```jsx
// Мутация массива напрямую
const contacts = form.getFieldValue('contacts');
contacts.push(newContact);  // НЕТ!
```

### ✅ Правильно
```jsx
// Через setFieldValue
const contacts = form.getFieldValue('contacts') || [];
form.setFieldValue('contacts', [...contacts, newContact]);
```

### ❌ Неправильно
```jsx
// Забыли restField
<Form.Item name={[name, 'phone']}>
```

### ✅ Правильно
```jsx
// restField содержит fieldKey и другие нужные props
<Form.Item {...restField} name={[name, 'phone']}>
```

## Отслеживание значений в реальном времени

```jsx
// Для отладки или условного рендера
const contactsCount = Form.useWatch('contacts', form)?.length || 0;

// Или конкретное поле
const orgName = Form.useWatch('name', form);
```

## Select с автозаполнением

```jsx
<Form.Item name="organizationId">
  <Select
    showSearch
    filterOption={false}  // Отключаем локальную фильтрацию
    onSearch={handleSearch}  // Запрос на сервер
    loading={loading}
    options={options}
  />
</Form.Item>
```

## Чеклист перед сохранением

1. ✅ Все новые элементы имеют `command: 'create'`
2. ✅ Изменённые элементы имеют `command: 'update'`
3. ✅ Удалённые элементы имеют `command: 'delete'` и `deleted: 1`
4. ✅ Все изменённые элементы имеют `_modified: true`
5. ✅ При отправке фильтруем только `_modified === true`
