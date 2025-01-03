# this file is used to clean the data from the original data file

import csv

# 定义文件路径
input_file = "cities500.txt"  # 原始 GeoNames 数据
output_file = "formatted_cities.csv"  # 格式化后的 CSV 文件

# 定义需要的列索引（根据 GeoNames 文件结构）
# 0: geonameid, 1: name, 3: alternatenames, 4: latitude, 5: longitude, 8: country code, 14: population, 17: timezone, 18: modification date
required_columns = [0, 1, 3, 4, 5, 8, 14, 17, 18]

# 读取文件并格式化输出
with open(input_file, "r", encoding="utf-8") as infile, open(output_file, "w", encoding="utf-8", newline="") as outfile:
    reader = csv.reader(infile, delimiter="\t")  # GeoNames 文件以制表符分隔
    writer = csv.writer(outfile)

    # 写入表头
    writer.writerow(["geonameid", 
                     "name",
                     "alternatenames",
                     "latitude",
                     "longitude",
                     "country_code",
                     "population",
                     "timezone",
                     "modification_date"])

    for row in reader:
        # 确保行长度足够长，不足的补充为空字符串
        formatted_row = [row[i].strip() if i < len(row) else "" for i in required_columns]

        # 写入到新文件中（包括空字段）
        writer.writerow(formatted_row)