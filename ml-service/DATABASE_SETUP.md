# 🔧 ML Service - Database Integration Setup

## ✅ Đã hoàn thành

ML Service giờ đã được cập nhật để:
1. **Load data từ PostgreSQL** thay vì CSV file
2. **Sử dụng product ID thực** thay vì dataframe index
3. **Trả về recommendations với ID đúng** từ database

## 📋 Các thay đổi

### 1. Files mới:
- `db_loader.py` - Module load data từ PostgreSQL
- `.env` - Configuration file cho database credentials
- `test_direct.py` - Test script

### 2. Files đã sửa:
- `model.py` - Cập nhật để sử dụng product ID thay vì index
- `app.py` - Thêm error logging chi tiết

### 3. Dependencies mới:
```bash
pip install psycopg2-binary python-dotenv
```

## ⚙️ Cấu hình

### Bước 1: Cập nhật file `.env`

Mở file `ml-service/.env` và cập nhật thông tin database của bạn:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=winedb
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE  # ⚠️ Thay đổi password này!
```

### Bước 2: Kiểm tra kết nối database

```bash
cd ml-service
python -c "from db_loader import load_data_from_db; df = load_data_from_db(); print(f'Loaded {len(df)} products')"
```

Nếu thành công, bạn sẽ thấy:
```
Loaded XXX products from database
```

Nếu lỗi, service sẽ tự động fallback về CSV file.

### Bước 3: Restart ML Service

```bash
# Stop service hiện tại (Ctrl+C)
# Start lại
cd ml-service
.\venv\Scripts\Activate.ps1
uvicorn app:app --reload --port 8000
```

## 🧪 Test

### Test với product ID thực:

```bash
# Test health
curl http://127.0.0.1:8000/health

# Test recommendations với ID từ database
curl http://127.0.0.1:8000/recommend/31938
```

### Kiểm tra log:

Khi gọi API, bạn sẽ thấy log trong terminal:
```
Loading data from database...
Loaded 795 products. ID range: 2 - 109860
Received recommendation request for id: 31938
Product ID 31938 found at index 456
Successfully generated 5 recommendations
```

## 🔍 Cách hoạt động

### Trước đây (CSV):
```
User request: /recommend/31938
↓
Model tìm row index 31938 trong CSV (❌ out of bounds vì chỉ có 795 rows)
```

### Bây giờ (Database):
```
User request: /recommend/31938
↓
Model query database: SELECT * FROM products WHERE id = 31938
↓
Lấy được product ở row index 456
↓
Tìm 5 sản phẩm tương tự dựa trên flavor profile
↓
Trả về recommendations với ID thực từ database
```

## ⚠️ Lưu ý quan trọng

1. **Password database**: Đảm bảo password trong `.env` đúng
2. **Database schema**: Table `products` phải có các cột:
   - `id`, `name`, `intl_name`
   - `brand_name`, `brand_intl_name`
   - `f1`, `f2`, `f3`, `f4`, `f5`, `f6` (flavor profiles)
   - `score`, `checkin_count`, `rank`
   - `flavour_tags`, `pictures`, `similar_brands`
   - `year_month`

3. **Fallback**: Nếu không kết nối được database, service tự động dùng CSV file

## 🐛 Troubleshooting

### Lỗi: "password authentication failed"
→ Cập nhật `DB_PASSWORD` trong file `.env`

### Lỗi: "Product with ID XXX not found"
→ ID không tồn tại trong database. Kiểm tra:
```sql
SELECT id FROM products WHERE id = XXX;
```

### Lỗi: "single positional indexer is out-of-bounds"
→ Đã fix! Service giờ dùng ID thay vì index

### Recommendations trả về ID không tồn tại
→ Đã fix! Service giờ load data từ database nên ID sẽ khớp

## ✨ Kết quả

Giờ bạn có thể:
- ✅ Gọi `/recommend/{id}` với bất kỳ product ID nào trong database
- ✅ Nhận được recommendations với ID đúng
- ✅ Click vào recommended products sẽ navigate đến trang chi tiết đúng
- ✅ Data luôn sync với database

---

**Nếu vẫn gặp vấn đề, hãy:**
1. Kiểm tra log trong terminal của uvicorn
2. Kiểm tra password trong `.env`
3. Test kết nối database bằng lệnh ở Bước 2
