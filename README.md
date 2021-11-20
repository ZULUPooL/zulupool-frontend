# ZulupoolFrontend

## Installation

### Установить NodeJS 16
https://github.com/nodesource/distributions/blob/master/README.md#deb

### Получить исходный код

```bash
git clone https://github.com/EternityTula/zulupool-frontend
cd zulupool-frontend
```

### Загрузка зависимостей

```bash
npm i
```

### Сборка

задать адрес сайта в параметре --base-href в package.json.

Для сборки в темных тонах:

```bash
npm run prod
```

### Скопировать скомпилированный код

```bash
cp -r dist/zulupool-frontend/* target_path
```

### Отладка

```bash
npm run start

```
