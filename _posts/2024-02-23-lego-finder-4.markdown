---
layout: post
title:  "Lego BrickFinder 만들기 - 4. 서버 프로그래밍"
date:   2024-02-23 20:00:00 +0900
categories: devlog daily
use_math: true
---

딥러닝 모델을 뭘 고를까 고민하다가, 그냥 각 모델이 추론한 결과를 바탕으로 통계를 내자고 생각하고, 바로 서버 개발로 넘어갔습니다. 서버 개발에는 수많은 프레임워크가 있는데, python에도 `Django`, `Flask`등이 있죠. 이 프로젝트에선 `Flask`로 개발해볼 생각입니다.

이 프레임워크는 개발이 무척이나 빠르고 간단하다는 게 장점입니다. 예측을 위한 REST api는 다음 코드면 충분합니다.

```py
# app.py

from flask import Flask, request, jsonify
from PIL import Image
from yolo_model.model import predict_yolo

app = Flask(__name__)

@app.route('/')
def hello():
    return 'hello'

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        file = request.files['file']
        img = Image.open(file.stream)
        result = predict_yolo(img)

        return jsonify(result)

```

우선은 `yolov8` 모델만 적용해보겠습니다. 서브모듈로 분리하였습니다.

```py
# yolo_model

from ultralytics import YOLO

import os

model = YOLO('./yolo_model/trained/weights/best.pt')

def predict_yolo(image):
    results = model(image)

    probs = results[0].probs

    indices = [results[0].names[i] for i in probs.top5]
    confs = probs.top5conf

    print(indices)
    print(confs)

    return list(zip(indices, confs.tolist()))
```

테스트도 해볼까요.

![result](/assets/images/2024-02-23-lego-finder-4/result.png)

가장 확률이 높은 순서대로 5개를 반환하도록 했습니다. 일단 잘 돌아가네요. 이제 다른 딥러닝 모델 추론 결과도 함께 적용할 수 있게 해야 할 겁니다. 각 모델의 정확도 향상을 위한 데이터 수집 및 학습도 계속 해야겠죠. 결정적으로 아직 이 프로그램은 제 컴퓨터에서만 돌아간다는 문제가 있습니다.

서버 배포를 하려고 AWS 같은 솔루션도 생각은 해봤는데, 무직 백수가 함부로 플랜을 선택할 수는 없을 것 같아서, 그냥 **집에 굴러다니는 라즈베리파이로 서버실을 만들어야겠다!** 싶습니다.

다음 포스팅부터는 본격적인 배포 과정이 시작되겠네요.

- 라즈베리파이 세팅
- Docker 설치
- Flask 컨테이너 생성
- CORS 해결 (높은 확률로 만나게 될 듯?)
- 프론트, 앱 개발

유저 확보가 되어야 포트폴리오로써의 가치가 있을 것 같은데... 일단 계속 해봐야 알겠죠.