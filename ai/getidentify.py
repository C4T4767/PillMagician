import requests
import xml.etree.ElementTree as ET
import csv

numOfRows = 300
serviceKey = 'TFOE6ua7j1m6StQ0jFd%2F0cnh4V2qxljaCX46ZgBefX5PZY%2BpogjkVRD%2B0XX4eKr9UAicsA%2BZfY19lI%2BzRmpmCQ%3D%3D'

items_dict = {}  # 중복을 제거하기 위해 딕셔너리 사용

for pageNo in range(1, 86):  # 페이지 번호를 1부터 85까지 반복
    url = f"http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01?numOfRows={numOfRows}&pageNo={pageNo}&serviceKey={serviceKey}"

    print("Requesting page", pageNo)
    
    # 요청 보내기
    response = requests.get(url)

    # 요청 성공 여부 확인
    if response.status_code == 200:
        # XML 응답 데이터 파싱
        root = ET.fromstring(response.content)

        # XML 데이터에서 아이템 추출하여 딕셔너리에 추가
        for item in root.findall('./body/items/item'):
            item_seq = item.find('item_seq').text
            if item_seq not in items_dict:  # 중복되지 않는 경우에만 추가
                item_data = {
                    'item_seq': item_seq,
                    'item_name': item.find('item_name').text,
                    'entp_name': item.find('entp_name').text,
                    'chart': item.find('chart').text,
                    'item_image': item.find('item_image').text,
                    'drug_shape': item.find('drug_shape').text,
                    'color_class1': item.find('color_class1').text,
                    'color_class2': item.find('color_class2').text,
                    'class_name': item.find('class_name').text,
                    'print_front': item.find('print_front').text,
                    'print_back': item.find('print_back').text
                }
                items_dict[item_seq] = item_data
    else:
        print("API 요청에 실패하였습니다. 상태 코드:", response.status_code)

# CSV 파일로 저장
with open('alyak.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=item_data.keys())
    writer.writeheader()
    for item_data in items_dict.values():
        writer.writerow(item_data)
    
print("CSV 파일에 저장되었습니다.")
