# model.py
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors

# ===== 1. Load & clean dataset =====
df = None  # Will be loaded from database

def clean_data(df):
    df = df.copy()
    numeric_cols = ['score', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'checkin_count']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    text_cols = ['brand_name', 'flavour_tags', 'name']
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].fillna('')
    return df

def load_data():
    """Load data from database"""
    global df
    if df is None:
        try:
            from db_loader import load_data_from_db
            print("Loading data from database...")
            df = load_data_from_db()
            df = clean_data(df)
            # Create a mapping from ID to index for fast lookup
            df['_index'] = df.index
            print(f"Loaded {len(df)} products. ID range: {df['id'].min()} - {df['id'].max()}")
        except Exception as e:
            print(f"Error loading from database: {e}")
            print("Falling back to CSV...")
            df = pd.read_csv("data/liquors.csv")
            df = clean_data(df)
            df['_index'] = df.index
    return df

# ===== 2. TẤT CẢ function ML của bạn =====
# Duplicate imports and the second `clean_data` definition were removed.
# The dataset was already read and cleaned above into `df`, so reuse it.
df_initial = df

# Hàm gaussian filter để tính độ tương đồng
def gaussian_filter(value_ref, value_current, sigma):
    """Tính độ tương đồng dựa trên phân phối Gaussian"""
    if pd.isnull(value_ref) or pd.isnull(value_current):
        return 1
    if sigma == 0:
        return 1 if value_ref == value_current else 0
    return np.exp(-((value_ref - value_current) ** 2) / (2 * sigma ** 2))


# Function return variables selected from entry_id
def entry_variables(df, id_entry):
    """Trích xuất các đặc trưng từ một liquor cụ thể"""
    col_labels = []
    
    # Lấy brand_name
    if pd.notnull(df['brand_name'].iloc[id_entry]) and df['brand_name'].iloc[id_entry] != '':
        col_labels.append(df['brand_name'].iloc[id_entry])
    
    # Lấy các flavour_tags
    if pd.notnull(df['flavour_tags'].iloc[id_entry]) and df['flavour_tags'].iloc[id_entry] != '':
        tags = df['flavour_tags'].iloc[id_entry]
        # Tách tags bằng | và loại bỏ khoảng trắng
        for tag in tags.split('|'):
            tag = tag.strip()
            if tag:  # Chỉ thêm nếu tag không rỗng
                col_labels.append(tag)
    
    return col_labels


# Function to add variables to dataframe
def add_variables(df, REF_VAR):
    """Chuyển đổi dữ liệu thành ma trận binary (one-hot encoding)"""
    df = df.copy()
    
    # Tạo các cột mới với giá trị 0
    for s in REF_VAR:
        df[s] = 0
    
    columns = ['brand_name', 'flavour_tags']
    
    for index, row in df.iterrows():
        for category in columns:
            data = row[category]
            if pd.isnull(data) or data == '': 
                continue
            
            if category == 'brand_name':
                if data in REF_VAR:
                    df.at[index, data] = 1
            else:
                # Xử lý flavour_tags
                for tag in str(data).split('|'):
                    tag = tag.strip()
                    if tag and tag in REF_VAR:
                        df.at[index, tag] = 1
    
    return df


# Function create N liquors similar with liquor given by user
def recommend(df, id_entry, N_liquors):
    """Tìm N liquors tương tự nhất sử dụng KNN"""
    df_copy = df.copy()
    variables = entry_variables(df_copy, id_entry)
    
    # Nếu không có đặc trưng nào, trả về các liquor ngẫu nhiên
    if len(variables) == 0:
        print("Warning: No valid features found. Returning random samples.")
        indices = np.random.choice(len(df), min(N_liquors, len(df)), replace=False)
        return indices
    
    df_new = add_variables(df_copy, variables)
    
    # Lấy ma trận đặc trưng
    X = df_new[variables].values.astype(float)
    
    # Kiểm tra NaN
    if np.isnan(X).any():
        X = np.nan_to_num(X, nan=0.0)
    
    # Tạo model KNN
    nbrs = NearestNeighbors(n_neighbors=min(N_liquors, len(df)), 
                           algorithm='auto', 
                           metric='euclidean').fit(X)
    
    # Tìm neighbors cho liquor được chọn
    x_test = df_new.iloc[id_entry][variables].values.astype(float)
    x_test = np.nan_to_num(x_test, nan=0.0)
    x_test = x_test.reshape(1, -1)
    
    distances, indices = nbrs.kneighbors(x_test)
    
    return indices[0][:min(15, len(indices[0]))]


# Function give a mark to a liquor
def new_critere_selection(brand_main, max_checkin, score, 
                         f1, f2, f3, f4, f5, f6,
                         brand, checkin_count, 
                         max_f1, max_f2, max_f3, max_f4, max_f5, max_f6):
    """Tính điểm ưu tiên cho liquor dựa trên nhiều tiêu chí"""
    
    # Facture cho độ phổ biến (checkin_count)
    sigma = max(max_checkin * 1.0, 1)
    facture_1 = gaussian_filter(float(max_checkin), float(checkin_count), sigma)
    
    # Facture cho các hương vị
    sigma_flavour = 0.6
    facture_2 = gaussian_filter(float(max_f1), float(f1), sigma_flavour)
    facture_3 = gaussian_filter(float(max_f2), float(f2), sigma_flavour)
    facture_4 = gaussian_filter(float(max_f3), float(f3), sigma_flavour)
    facture_5 = gaussian_filter(float(max_f4), float(f4), sigma_flavour)
    facture_6 = gaussian_filter(float(max_f5), float(f5), sigma_flavour)
    facture_7 = gaussian_filter(float(max_f6), float(f6), sigma_flavour)
    
    # Tính tổng điểm
    note = (facture_1 + 
            (facture_2 + facture_3 + facture_4 + facture_5 + facture_6 + facture_7) * 7 +
            score * 0.5)  # Thêm score vào công thức
    
    return note


# Function extract parameters from liquor list
def new_extract_parameters(df, list_liquors, N_liquors):
    """Trích xuất thông tin và sắp xếp kết quả"""
    list_parameters = []
    max_checkin = -1
    
    for index in list_liquors:
        row = df.iloc[index]
        params = [
            row['brand_name'],
            row['score'],
            row['f1'], row['f2'], row['f3'],
            row['f4'], row['f5'], row['f6'],
            row['name'],
            row['checkin_count'],
            index
        ]
        list_parameters.append(params)
        max_checkin = max(max_checkin, int(row['checkin_count']))
    
    # Lấy giá trị tham chiếu từ liquor đầu tiên (liquor gốc)
    brand_main = list_parameters[0][0]
    max_f1 = list_parameters[0][2]
    max_f2 = list_parameters[0][3]
    max_f3 = list_parameters[0][4]
    max_f4 = list_parameters[0][5]
    max_f5 = list_parameters[0][6]
    max_f6 = list_parameters[0][7]
    
    # Sắp xếp theo điểm
    list_parameters.sort(
        key=lambda x: new_critere_selection(
            brand_main, max_checkin, x[1], x[2], x[3], x[4], x[5], x[6], x[7],
            x[0], x[9], max_f1, max_f2, max_f3, max_f4, max_f5, max_f6
        ), 
        reverse=True
    )
    
    return list_parameters


# Function returns sorted list of similarities
def add_to_selection(liquor_selection, list_parameters, N_liquors):
    """Loại bỏ trùng lặp và giới hạn kết quả top 5"""
    liquor_list = liquor_selection[:]
    icount = len(liquor_list)
    
    for i in range(min(len(list_parameters), N_liquors)):
        already_in_list = False
        
        # Kiểm tra trùng lặp theo tên
        for s in liquor_selection:
            if s[8] == list_parameters[i][8]:  # So sánh tên
                already_in_list = True
                break
        
        if already_in_list:
            continue
        
        icount += 1
        if icount <= 5:
            liquor_list.append(list_parameters[i])
    
    return liquor_list


# Function to find top 5 most similar products
def find_similarities(df, id_entry, N_liquors=20, del_sequel=True, verbose=False):
    """Hàm chính để tìm top 5 liquors tương tự"""
    if verbose:
        print(90*'-')
        print('QUERY: liquors similar to id={} -> "{}"'.format(
            id_entry, df.iloc[id_entry]['brand_name']))
        print(f"Name: {df.iloc[id_entry]['name']}")
        print(90*'-')
    
    # Tìm liquors tương tự
    list_liquors = recommend(df, id_entry, N_liquors)
    
    if verbose:
        print(f"Found {len(list_liquors)} similar liquors")
    
    # Trích xuất thông tin và sắp xếp
    list_parameters = new_extract_parameters(df, list_liquors, N_liquors)
    
    # Lọc và lấy top 5
    liquor_selection = []
    liquor_selection = add_to_selection(liquor_selection, list_parameters, N_liquors)
    
    # Hiển thị kết quả
    selection_results = []
    if verbose:
        print(f"\n{'='*90}")
        print("TOP 5 SIMILAR LIQUORS:")
        print(f"{'='*90}")
    
    for i, s in enumerate(liquor_selection):
        # Get full product info from dataframe
        product_idx = int(s[10])  # index in dataframe
        product_row = df.iloc[product_idx]
        
        # Safely get values from product_row
        def safe_get(key, default=None):
            try:
                val = product_row.get(key, default)
                if pd.notnull(val):
                    # Convert numpy/pandas types to Python native types
                    if isinstance(val, (np.integer, np.int64)):
                        return int(val)
                    elif isinstance(val, (np.floating, np.float64)):
                        return float(val)
                    elif isinstance(val, str):
                        return str(val)
                    else:
                        return val
                return default
            except:
                return default
        
        # Safely split string fields
        def safe_split(key):
            try:
                val = safe_get(key, '')
                if val and isinstance(val, str):
                    return [x.strip() for x in val.split('|') if x.strip()]
                return []
            except:
                return []
        
        result = {
            'rank': int(i + 1),
            'id': int(safe_get('id', 0)) if safe_get('id') is not None else None,
            'brand': str(s[0]) if s[0] else None,
            'brand_intl_name': safe_get('brand_intl_name'),
            'name': str(s[8]) if s[8] else None,
            'intl_name': safe_get('intl_name'),
            # Ensure native Python types for JSON serialization
            'score': float(round(float(s[1]), 2)) if s[1] is not None else None,
            'checkin_count': int(s[9]) if s[9] is not None else None,
            'flavors': {
                'f1': float(round(float(s[2]), 3)) if s[2] is not None else None,
                'f2': float(round(float(s[3]), 3)) if s[3] is not None else None,
                'f3': float(round(float(s[4]), 3)) if s[4] is not None else None,
                'f4': float(round(float(s[5]), 3)) if s[5] is not None else None,
                'f5': float(round(float(s[6]), 3)) if s[6] is not None else None,
                'f6': float(round(float(s[7]), 3)) if s[7] is not None else None
            },
            'flavour_tags': safe_split('flavour_tags'),
            'pictures': safe_split('pictures'),
            'similar_brands': safe_split('similar_brands'),
            'year_month': safe_get('year_month'),
        }
        selection_results.append(result)
        
        if verbose:
            print(f"\n{i+1}. {s[8]} ({s[0]})")
            print(f"   Score: {s[1]:.2f} | Check-ins: {s[9]}")
            print(f"   Flavors: f1={s[2]:.3f}, f2={s[3]:.3f}, f3={s[4]:.3f}, f4={s[5]:.3f}, f5={s[6]:.3f}, f6={s[7]:.3f}")
    
    return selection_results


# ===== 3. API function dùng cho FastAPI =====
def recommend_by_id(product_id):
    """
    Get recommendations for a product by its ID (not index)
    
    Args:
        product_id: The actual product ID from database
        
    Returns:
        List of recommended products
    """
    df_local = load_data()
    
    # Convert product ID to dataframe index
    product_rows = df_local[df_local['id'] == product_id]
    
    if len(product_rows) == 0:
        raise ValueError(f"Product with ID {product_id} not found in dataset")
    
    # Get the dataframe index (row position) for this product ID
    product_index = product_rows.index[0]
    
    print(f"Product ID {product_id} found at index {product_index}")
    
    # Use the index for similarity search
    return find_similarities(df_local, product_index)

