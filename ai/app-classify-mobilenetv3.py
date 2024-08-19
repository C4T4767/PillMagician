
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image, ImageOps
import torch.nn.functional as F
import torchvision.models as models
import json
import numpy as np
import sys

# selectedModel.json 파일 열기
model_path = sys.argv[1]
image_path = sys.argv[2]
number = int(sys.argv[3])
seg_path = "../ai/models/deeplab.pth"
device = "cuda" if torch.cuda.is_available() else "cpu"

# 모델을 로드합니다.
checkpoint = torch.load(model_path, map_location=device)
model_state_dict = checkpoint['model_state_dict']
class_names = checkpoint['class_names']

# 모델을 생성하고 상태 사전을 적재합니다.
model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)
# Modify the classifier of MobileNetV3
num_ftrs = model.classifier[0].in_features
model.classifier[0] = nn.Linear(num_ftrs, 1280)  # Change out_features to 1280
model.classifier[3] = nn.Linear(1280, len(class_names))  # Change out_features to the number of classes

# Add dropout
model.classifier.add_module("4", nn.Dropout(p=0.5))  # Add dropout after the classifier
model.load_state_dict(model_state_dict)
model = model.to(device)  # 모델을 CUDA로 이동

# 모델을 평가 모드로 설정합니다.
model.eval()

# segmentation 모델 로드
seg_model = models.segmentation.deeplabv3_resnet101(weights=models.segmentation.DeepLabV3_ResNet101_Weights.DEFAULT)
seg_model.classifier[4] = nn.Conv2d(256, 1, kernel_size=(1, 1))
seg_model.load_state_dict(torch.load(seg_path, map_location=device))
seg_model.eval().to(device)

def preprocess(img):
    # 이미지 크롭
    img = custom_crop(img)
    # 이미지 크기 조정
    img = transforms.Resize((224, 224))(img)
    # PyTorch Tensor로 변환
    img = transforms.ToTensor()(img)
    # 정규화
    img = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])(img)
    return img

def custom_crop(img):
    width, height = img.size
    target_size = (int(width * (1/3)), int(height * (1/3)))
    left = (width - target_size[0]) / 2
    top = (height - target_size[1]) / 2
    right = (width + target_size[0]) / 2
    bottom = (height + target_size[1]) / 2
    return img.crop((left, top, right, bottom))

# 이미지 배경 제거 함수
def remove_background(image_path):
    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor()
    ])

    image = Image.open(image_path).convert("RGB")
    original_size = image.size
    image_resized = transform(image).unsqueeze(0).to(device)  # Ensure image is on the same device

    with torch.no_grad():
        output = seg_model(image_resized)['out']  # Use seg_model instead of model
        output = torch.sigmoid(output).squeeze().cpu().numpy()

    # Threshold the output to create a binary mask
    mask = (output > 0.5).astype(np.uint8)
    mask = Image.fromarray(mask).resize(original_size, Image.NEAREST)

    # Convert mask to three channels
    mask = np.array(mask)
    mask_rgb = np.stack([mask, mask, mask], axis=-1)

    # Apply the mask to the original image
    original_image = np.array(Image.open(image_path).convert("RGB"))
    segmented_image = np.bitwise_and(original_image, mask_rgb * 255)

    # Save the resulting image
    result_image = Image.fromarray(segmented_image)
    return result_image

# 배경 제거된 이미지 생성
extracted_img = remove_background(image_path)

# 배경 제거된 이미지를 전처리
input_tensor = preprocess(extracted_img)
input_batch = input_tensor.unsqueeze(0).to(device)  # Ensure tensor is on the same device

# 예측 수행
with torch.no_grad():
    output = model(input_batch)

# 소프트맥스 함수를 사용하여 확률로 변환
probabilities = F.softmax(output, dim=1)

# 상위 k개 클래스와 해당 확률 추출
k = 5
probabilities, indices = torch.topk(probabilities, k)

# 결과를 JSON 형식으로 저장할 딕셔너리 생성
results = {}
for i in range(k):
    class_label = class_names[indices[0][i].item()]
    probability = round(probabilities[0][i].item(), 6)  # 소수점 아래 6자리까지 표시
    results[f"class_name{i+1}"] = class_label
    results[f"probability{i+1}"] = probability

with open(f'./data/{number}.json', 'w') as f:
    json.dump(results, f)
