from ultralytics import YOLO
import sys
import json
from PIL import Image

# 이미지 crop 함수 정의
def crop_center(image_path, cropped_image_path):
    # 이미지를 불러옵니다.
    img = Image.open(image_path)
    # 이미지의 크기를 얻습니다.
    width, height = img.size
    # crop할 영역 계산
    left = width / 3
    top = height / 3
    right = width * 2 / 3
    bottom = height * 2 / 3
    # 이미지를 crop합니다.
    cropped_img = img.crop((left, top, right, bottom))
    # 결과를 저장합니다.
    cropped_img.save(cropped_image_path)

# 입력 파일 경로 가져오기
model_path = sys.argv[1]
image_path = sys.argv[2]
number = int(sys.argv[3])

# 이미지를 가운데를 기준으로 1/9으로 crop합니다.
cropped_image_path = './data/cropped_image.jpg'
crop_center(image_path, cropped_image_path)

# YOLO 모델을 불러오고 이미지에 적용합니다.
model = YOLO(model_path)
results = model(cropped_image_path)

# 결과 데이터
class_names = results[0].names
probabilities = results[0].probs

# 저장할 변수 초기화
class_name1 = class_name2 = class_name3 = class_name4 = class_name5 = ""
probability1 = probability2 = probability3 = probability4 = probability5 = 0.0

# 클래스 이름과 확률 추출
class_name1 = class_names[0]
probability1 = probabilities.top1conf.item()

class_name2 = class_names[probabilities.top5[1]]
probability2 = probabilities.top5conf[1].item()

class_name3 = class_names[probabilities.top5[2]]
probability3 = probabilities.top5conf[2].item()

class_name4 = class_names[probabilities.top5[3]]
probability4 = probabilities.top5conf[3].item()

class_name5 = class_names[probabilities.top5[4]]
probability5 = probabilities.top5conf[4].item()

# 결과를 JSON 형식으로 저장
results = {
    "class_name1": class_name1,
    "probability1": probability1,
    "class_name2": class_name2,
    "probability2": probability2,
    "class_name3": class_name3,
    "probability3": probability3,
    "class_name4": class_name4,
    "probability4": probability4,
    "class_name5": class_name5,
    "probability5": probability5
}

with open('./data/{number}..json', 'w') as f:
    json.dump(results, f)