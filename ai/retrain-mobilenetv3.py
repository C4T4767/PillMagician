import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
import os
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc
from sklearn.preprocessing import label_binarize
from itertools import cycle
import numpy as np
from sklearn.metrics import f1_score
from multiprocessing import freeze_support
from tqdm import tqdm

getoptimizer = sys.argv[1]
batch_size = int(sys.argv[2])
epochs = int(sys.argv[3])
model_path = sys.argv[4]
data_dir = sys.argv[5]

def main():
    print("Loading images..")
    sys.stdout.flush()  # 버퍼 비우기
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomAffine(degrees=0, scale=(0.8, 1.2)),
            transforms.RandomRotation(degrees=(-30, 30)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'test': transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # Create data loaders
    image_datasets = {x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x]) for x in ['train', 'val','test']}
    dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size=batch_size, shuffle=True, num_workers=12) for x in ['train', 'val','test']}
    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val','test']}

    # 클래스 이름을 데이터셋에서 가져옴
    class_names = image_datasets['train'].classes

    checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
    model_state_dict = checkpoint['model_state_dict']

    # 모델을 생성하고 상태 사전을 적재합니다.
    model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
    # 모델의 classifier 부분을 수정합니다.
    num_ftrs = model.classifier[0].in_features
    model.classifier[0] = nn.Linear(num_ftrs, 1280)  # Change out_features to 1280
    model.classifier[3] = nn.Linear(1280, len(class_names))  # Change out_features to the number of classes

    # Add dropout
    model.classifier.add_module("4", nn.Dropout(p=0.5))  # Add dropout after the classifier
    model.load_state_dict(model_state_dict)

    # Define the loss function and optimizer
    criterion = nn.CrossEntropyLoss()
    if getoptimizer == 'Adam':
        optimizer = optim.Adam(model.parameters(), lr=0.001)
    elif getoptimizer == 'SGD':
        optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

    # Move the model to the GPU if available
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    best_acc = 0.0
    best_model_wts = model.state_dict()

    # Training loop
    for epoch in tqdm(range(epochs)):
        print(f'Epoch {epoch+1}/{epochs}')
        print('-' * 10)
        sys.stdout.flush()  # 버퍼 비우기

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            with tqdm(total=len(dataloaders[phase])) as pbar:
                for inputs, labels in dataloaders[phase]:
                    inputs = inputs.to(device)
                    labels = labels.to(device)

                    optimizer.zero_grad()

                    with torch.set_grad_enabled(phase == 'train'):
                        outputs = model(inputs)
                        _, preds = torch.max(outputs, 1)
                        loss = criterion(outputs, labels)

                        if phase == 'train':
                            loss.backward()
                            optimizer.step()

                    running_loss += loss.item() * inputs.size(0)
                    running_corrects += torch.sum(preds == labels.data)
                    pbar.update(1)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')
            sys.stdout.flush()  # 버퍼 비우기

            if phase == 'val':
                if epoch_acc > best_acc:
                    best_acc = epoch_acc
                    best_model_wts = model.state_dict()
                    best_epoch = epoch

                    torch.save({
                        'model_state_dict': best_model_wts,
                        'class_names': class_names
                    }, f'best.pt')

    print("Training complete!")
    print("ROC Calculating..")
    sys.stdout.flush()  # 버퍼 비우기

    def plot_multiclass_roc(model, dataloader, class_names, device):
        # 모델을 평가 모드로 설정
        model.eval()
        
        # 예측된 확률과 실제 레이블 저장을 위한 리스트 초기화
        all_probs = []
        all_labels = []

        # 모델 예측
        with torch.no_grad():
            for inputs, labels in dataloader['test']:
                inputs = inputs.to(device)
                labels = labels.to(device)
                outputs = model(inputs)
                probs = torch.softmax(outputs, dim=1)
                all_probs.extend(probs.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        # Convert lists to numpy arrays
        all_probs = np.array(all_probs)
        all_labels = np.array(all_labels)

        # 실제 레이블을 이진화하여 준비
        binary_labels = label_binarize(all_labels, classes=np.arange(len(class_names)))

        # 클래스 별로 ROC 곡선 계산 및 시각화
        fpr = dict()
        tpr = dict()
        roc_auc = dict()
        for i in range(len(class_names)):
            fpr[i], tpr[i], _ = roc_curve(binary_labels[:, i], all_probs[:, i])
            roc_auc[i] = auc(fpr[i], tpr[i])

        # 모든 클래스에 대한 평균 ROC 곡선 계산
        all_fpr = np.unique(np.concatenate([fpr[i] for i in range(len(class_names))]))
        mean_tpr = np.zeros_like(all_fpr)
        for i in range(len(class_names)):
            mean_tpr += np.interp(all_fpr, fpr[i], tpr[i])
        mean_tpr /= len(class_names)
        fpr["macro"] = all_fpr
        tpr["macro"] = mean_tpr
        roc_auc["macro"] = auc(fpr["macro"], tpr["macro"])

        # ROC 곡선 그리기
        plt.figure(figsize=(10, 8))
        plt.plot(fpr["macro"], tpr["macro"], label=f'Macro-average ROC curve (area = {roc_auc["macro"]:0.2f})', color='navy', linestyle=':', linewidth=4)
        plt.plot([0, 1], [0, 1], 'k--', linewidth=2)
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver Operating Characteristic (ROC) Curve')
        plt.legend(loc="lower right")
        plt.savefig('roc_curve.png')

    # 모델을 사용하여 다중 클래스 분류 문제에 대한 ROC 곡선 계산 및 시각화
    plot_multiclass_roc(model, dataloaders, class_names, device)

    def calculate_f1_score(model, dataloader, device):
        model.eval()
        all_predictions = []
        all_labels = []

        with torch.no_grad():
            for inputs, labels in dataloader['test']:
                inputs = inputs.to(device)
                labels = labels.to(device)
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                all_predictions.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())

        f1 = f1_score(all_labels, all_predictions, average='macro')
        return f1

    f1 = calculate_f1_score(model, dataloaders, device)
    print("Accuracy:", best_acc.item())
    print("F1 score:", f1)
    print("Process completed.")
    sys.stdout.flush()  # 버퍼 비우기
    
if __name__ == "__main__":
    freeze_support()  # Windows 운영 체제에서 multiprocessing을 사용할 때 필요
    main()
