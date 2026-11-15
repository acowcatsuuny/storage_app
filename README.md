# storage_app
This app can help storage information.


## 版本管理

目前版本顯示在頁面右上角，唯一來源是 `index.html` 的 `<html data-app-version>`。瀏覽器標題、JSON 備份版本與 CSS、JavaScript 的快取版本會自動使用同一版本。每次修改 App 程式都必須更新版本號，並在提交訊息說明改動。修錯或小調整增加修訂號（例如 v1.8.0 → v1.8.1）；新增功能增加次版本號（例如 v1.8.1 → v1.9.0）。不要更動既有 localStorage 鍵名來表示 App 版本。
