import os
import sys
import urllib.request
import time  # 시간 지연을 위한 모듈 추가

def download_xml_data(item_seq, file_path):
    base_url = "https://nedrug.mfds.go.kr/pbp/cmn/html/drb/"
    urls = {
        "EE": f"{base_url}{item_seq}/EE",
        "UD": f"{base_url}{item_seq}/UD",
        "NB": f"{base_url}{item_seq}/NB"
    }
    
    item_path = os.path.join(file_path, str(item_seq))
    os.makedirs(item_path, exist_ok=True)
    
    for key, url in urls.items():
        time.sleep(0.01)
        filename = os.path.join(item_path, f"{key}.html")
        urllib.request.urlretrieve(url, filename)
        print(f"Downloaded {filename}")

if __name__ == "__main__":
    # item_seq를 명령행 인자로 받아옵니다.
    item_seq = sys.argv[1]
    
    # file_path는 두 번째 명령행 인자로 받아옵니다.
    file_path = sys.argv[2]
    
    # download_xml_data 함수를 호출하여 데이터를 다운로드합니다.
    download_xml_data(item_seq, file_path)