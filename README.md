# PillMagician

이 프로젝트는 AI 이미지 분류 기술을 활용한 알약 판별 및 복용 케어 서비스 개발을 목표로 했습니다. 이 프로젝트에서 저는 **알약 데이터 수집**, **이미지 분류 모델 학습**, **알약 데이터 전처리**, **관리자 웹 서버 구현**을 담당했습니다.

## 역할 및 담당 업무

- **알약 데이터 수집**
    - 알약 이미지 및 관련 정보를 수집하여 AI 모델 학습에 활용했습니다.
    - **관련 파일 위치**: `ai/aidata/` (용량 문제로 인해 극히 일부의 데이터만 포함되었습니다.)

- **이미지 분류 모델 학습**
    - ResNet101, MobileNet V3을 학습하여 알약 이미지 분류 모델을 개발했습니다.
    - **관련 파일 위치**: `ai/`

- **관리자 Web서버 구현**
    - Node.js, Express, MariaDB를 사용하여 사용자, 알약, AI 모델 관리 및 AI 모델 학습을 위한 웹사이트를 구현했습니다.
    - **관련 파일 위치**: `backend/routes/ai` , `backend/routes/log`, `backend/routes/data`

## 사용한 기술

- **프로그래밍 언어**: Python, JavaScript
- **프레임워크**: Node.js, Express
- **데이터베이스**: MariaDB
- **AI 관련 도구**: PyTorch, DeepLab V3, ResNet101, MobileNet V3
