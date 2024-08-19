import sys
from ultralytics import YOLO
import os
import glob
from sklearn.metrics import f1_score, roc_curve, auc
import matplotlib.pyplot as plt
import numpy as np
from multiprocessing import freeze_support
import pandas as pd

os.environ['LD_LIBRARY_PATH'] = '/usr/local/lib/python3.9/site-packages/nvidia/nccl/lib/'

getoptimizer = sys.argv[1]
batch_size = int(sys.argv[2])
epochs = int(sys.argv[3])
model_path = sys.argv[4]
data_dir = sys.argv[5]


print("retrain model:",model_path)
def main():
    model = YOLO(model_path)
    hyperparameters = {
        'degrees' : 30
    }
    model.hyperparameters = hyperparameters
    results = model.train(data=data_dir, optimizer=getoptimizer, batch=batch_size, epochs=epochs, imgsz=224, device=0, dropout=0.5, workers=12)
    print("Training complete!")
    print("ROC Calculating..")
    sys.stdout.flush()  # 버퍼 비우기
    # 실제 레이블과 예측된 확률 저장을 위한 리스트 초기화
    all_probs = []
    all_labels = []
    true_labels = []

    directory = data_dir+'/test'
    jpg_files = glob.glob(os.path.join(directory, '*/*.jpg'))
    png_files = glob.glob(os.path.join(directory, '*/*.png'))
    image_files = jpg_files + png_files

    for image_file in image_files:
        # 이미지 파일 경로에서 실제 레이블을 추출 (폴더명 사용)
        true_label = os.path.basename(os.path.dirname(image_file))
        true_labels.append(true_label)

        # 모델을 사용하여 이미지 예측
        results = model(image_file, conf=0.25, verbose=False)
        predicted_class = results[0].names[results[0].probs.top1]

        # 예측된 클래스의 확률
        predicted_prob = results[0].probs.top1conf.item()
        all_probs.append(predicted_prob)

        # 예측된 클래스를 이진으로 변환하여 실제 레이블 저장
        predicted_label = 1 if predicted_class == true_label else 0
        all_labels.append(predicted_label)

    # FPR과 TPR 계산
    fpr, tpr, _ = roc_curve(all_labels, all_probs)

    # 모든 클래스에 대한 평균 ROC 곡선 계산
    roc_auc_macro = auc(fpr, tpr)

    # ROC 곡선 그리기
    plt.figure(figsize=(10, 8))
    plt.plot(fpr, tpr, label=f'Macro-average ROC curve (area = {roc_auc_macro:0.2f})', color='navy', linestyle=':', linewidth=4)
    plt.plot([0, 1], [0, 1], 'k--', linewidth=2)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    plt.savefig('roc_curve.png')

    # 모델을 사용하여 이미지 예측하는 함수
    def predict_images(model, directory, conf_threshold=0.25, workers=0):
        predicted_classes = []

        for image_file in image_files:
            # 모델을 사용하여 이미지 예측
            results = model(image_file, conf=conf_threshold, workers=1, verbose=False)
            predicted_class = results[0].names[results[0].probs.top1]
            predicted_classes.append(predicted_class)

        return predicted_classes

    # F1 스코어 계산하는 함수
    def compute_f1_score(predictions, true_labels):
        f1 = f1_score(true_labels, predictions, average='macro')
        return f1

    # 모델을 사용하여 이미지 예측
    predicted_classes = predict_images(model, directory, conf_threshold=0.25)

    # F1 스코어 계산
    print("F1 score Calculating..")
    sys.stdout.flush()  # 버퍼 비우기
    f1_score_result = compute_f1_score(predicted_classes, true_labels)

    # 결과 파일 불러오기
    results_df = pd.read_csv('./runs/classify/train/results.csv')

    # 'metrics/accuracy_top1' 열에서 가장 높은 값 찾기
    max_accuracy_top1 = results_df['  metrics/accuracy_top1'].max()

    print("Accuracy:", max_accuracy_top1)
    print("F1 score:", f1_score_result)
    print("Process completed.")
if __name__ == "__main__":
    freeze_support()  # Windows 운영 체제에서 multiprocessing을 사용할 때 필요
    main()
