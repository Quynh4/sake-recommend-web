import urllib
import json
from pprint import pprint

import ssl
ssl._create_default_https_context = ssl._create_unverified_context

from tqdm import tqdm

import csv

area = 1 
count = 20

with open('liquor_data.csv', mode='w', encoding='utf-8') as csv_file:
 fieldnames = ['name', 'intl_name', 'brand_name', 'brand_intl_name', 'year_month', 'rank', 
               'score', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6',
               'flavour_tags', 'checkin_count', 'pictures', 'similar_brands', 'id']
 writer = csv.DictWriter(csv_file, fieldnames=fieldnames, delimiter=',', 
                         quotechar='"', quoting=csv.QUOTE_MINIMAL)
 writer.writeheader()
 
 while area <= 47:
     url = 'https://sakenowa.com/api/v2/brands/ranking?areaId={}&count={}'.format(area, count)
     print(url)
     response = urllib.request.urlopen(url)
     text = response.read()
     data = json.loads(text)['ranking']

     for i in tqdm(range(len(data))):
         item = data[i]
         year_month = str(item['yearMonth'])
         score = float(item['score'])
         ranking = int(item['rank'])
         brand_summary = item['brandSummary']
         id_ = int(brand_summary['brand']['id'])
         name = str(brand_summary['brand']['name'])
         pictures = [str(i['url']) for i in brand_summary['pictures']]            
         checkin_count = int(brand_summary['statistics']['checkinCount'])
         similar_brands = [str(item['brand']['name']) for item in brand_summary['similarBrands']]
         
         intl_name = None
         if 'intlName' in brand_summary['brand'].keys():
             intl_name = str(brand_summary['brand']['intlName'])
         
         brand_area_name = None
         brand_area_intl_name = None
         if 'area' in brand_summary['brand']['brewery'].keys():
             brand_area = brand_summary['brand']['brewery']['area']
             brand_area_name = str(brand_area['name'])
             brand_area_intl_name = str(brand_area['intlName'])
             
         f1 = None
         f2 = None
         f3 = None
         f4 = None
         f5 = None
         f6 = None
         if 'simpleFlavorFeature' in brand_summary.keys():
             flavour_feature = brand_summary['simpleFlavorFeature']
             f1 = flavour_feature['f1']
             f2 = flavour_feature['f2']
             f3 = flavour_feature['f3']
             f4 = flavour_feature['f4']
             f5 = flavour_feature['f5']
             f6 = flavour_feature['f6']

         tags = ''
         flavour_tags = brand_summary['flavorTags']
         for tag_item in flavour_tags:
             tags += '|{}'.format(tag_item['tag'])

         writer.writerow({'name': name, 'intl_name': intl_name,
                          'brand_name': brand_area_name, 
                          'brand_intl_name': brand_area_intl_name,
                          'year_month': year_month, 'rank': ranking,
                          'score': score, 'f1': f1, 'f2':f2, 'f3': f3,
                          'f4':f4, 'f5': f5, 'f6': f6, 
                          'flavour_tags': tags, 'checkin_count': checkin_count,
                          'pictures': '|'.join(pictures),
                          'similar_brands': '|'.join(similar_brands),
                          'id': id_})

     area += 1
