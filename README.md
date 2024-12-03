# Инструкция по установке

## Создайте .env файл

В корне проекта создать `.env` на основе `env-example`, в котором прописана структура

### Update database.json

Обновить файл `database.json`.

## Install dependencies

```
npm install
```

## DB

### Create databases

```shell
createdb db_name
```

### Run migrations

```shell
npm run migration
```

## Running the server

### Development

```shell
npm run dev
```

### Production

```shell
npm run build

npm start
```

## Run unit tests

```shell
npm test
```

## Linting

```shell
npm run lint
```

Документанция: /api-docs

Для работы необходимо создать пользователя, модель  
Пользователь нужен для авторизации запросов  
Модель: name - название модели (будет использована в запросе), api_token - авторизация, api_url - ссылка api

# Инструменты

Старался не использовать много библиотек, хотя знаю и умею nest и typeorm.
Также использовал модуль http для отправки запросов.
