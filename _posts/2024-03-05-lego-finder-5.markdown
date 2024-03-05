---
layout: post
title:  "Lego BrickFinder 만들기 - 5. TDD"
date:   2024-03-05 16:00:00 +0900
categories: devlog daily
use_math: true
---

어저께 OPIc 치고, 바로 자소서 쓰면서 토이프로젝트도 조금 손을 댔습니다. 사실 이전까지는 코드가 뭔가 잘못되었는지 다 수동으로 돌려보고, postman으로 검증하면서 확인했는데요. 지금이야 프로젝트가 그리 크지 않으니 별 상관 없지만 나중에는 어디가 잘못되었는지 찾는 것조차 쉽지 않을 것을 생각하면 테스트 코드도 잘 만들어둘 필요가 있다고 생각이 됩니다.

스프링으로 개발할 때는 `JUnit`을 썼는데, 파이썬으로 테스트를 작성하기 위해서도 관련 모듈을 쓰면 좋습니다. 대표적으로는 내장 모듈인 `unittest`가 있지만, 공식 페이지에서도 소개하고 있는 서드 파티 `pytest`가 더 많은 기능을 제공하고 또 간단히 테스트를 작성할 수 있으니 이를 적용해보도록 했습니다.

## pytest 설치

매우 쉽습니다.

```
pip install pytest
```

이제 테스트 코드를 작성해주면 됩니다. `test_`로 시작하는 파일과, 그 안의 `test_`로 시작하는 함수들을 테스트 코드로 인식하여 자동으로 모든 대상에 대한 테스트를 수행합니다.

```py
# test_api.py

import pytest

from app import create_app

TEST_CONFIG = {
    'TESTING': True
}


@pytest.fixture(scope='session') # 한 번만 실행
def app():
    app = create_app(TEST_CONFIG)
    return app


@pytest.fixture # 매 테스트 실행 마다 실행
def client(app):
    client = app.test_client()
    return client


def test_main(client):
    response = client.get('/')

    assert response.status_code == 200


def test_sk_model(client):
    # 테스트할 이미지 파일 경로
    test_image_path = 'samples/3001-1.jpg'

    # 이미지 파일 열기
    with open(test_image_path, 'rb') as f:
        image_data = f.read()

    # POST 요청 데이터
    data = {
        'file': (io.BytesIO(image_data), 'test_image.jpg')  # 파일 형식으로 전송
    }

    # POST 요청 보내기
    response = client.post('/predict/sklearn', data=data, content_type='multipart/form-data')

    # 응답 코드 확인
    assert response.status_code == 200

    # 응답 데이터 확인
    result = response.json()
    assert 'prediction' in result  # 예측 결과가 있는지 확인
```

## 애플리케이션 팩토리

테스트 코드를 작성함과 함께 중요한 것이, 테스트용 서버를 생성하는 함수도 필요하다는 점입니다. 보통 Flask 예시 코드는 `app`을 전역으로 생성하기 때문에 코드를 크게 건드리지 않고는 테스트를 위한 서버를 따로 만들지 못합니다.

```py
from flask import Flask

app = Flask(__name__) # 전역 객체

@app.route('/')
def hello():
    pass
```

이런 방식은 댜앙한 상황에 대처하기 힘들다는 점 외에도 순환참조 등의 문제를 일으키기 쉽기 때문에, `Flask`는 공식적으로 **애플리케이션 팩토리**를 쓸 것을 권장합니다. 이름은 거창한데, 핵심은 앱 객체를 필요에 따라 생성하여 쓰도록 하는 것입니다. 더 자세한 내용은 [참고 페이지 링크][ref]를 걸어두겠습니다.

우선 `app.py` 파일의 내용을 `app/__init__.py` 로 옮기겠습니다. Flask가 실행할 앱의 알맹이를 파일에서 모듈로 전환했습니다.

그리고 `__init__.py`의 내용을 바꿔줍니다.

```py
from flask import Flask, request, jsonify
from PIL import Image
from yolo_model.model import predict_yolo
from tensorflow_model.model import predict_tf
from scikit_model.model import predict_sk


def create_app(test_config=None):
    app = Flask(__name__)

    if test_config:
        app.config.update(test_config)


    @app.route('/')
    def hello():
        return 'hello'

    @app.route('/predict', methods=['POST'])
    def predict():
        if request.method == 'POST':
            file = request.files['file']
            img = Image.open(file.stream)
            # result = predict_yolo(img)
            # result = predict_tf(img)
            result = predict_sk(img)

            return jsonify(result)


    @app.route('/predict/sklearn', methods=['POST'])
    def predict_sk():
        if request.method == 'POST':
            file = request.files['file']
            img = Image.open(file.stream)
            result = predict_sk(img)

            return jsonify(result)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', debug=True, port=8000)
```

단순히 전역 객체를 만드는 것에서 이제 함수를 호출하는 방식으로 바뀌었습니다. `create_app` 함수를 정의하고 테스트를 위한 설정 사항이 있는지 확인하도록 합니다. 그리고 필요한 rest api를 함수 안에 정의해줍니다. 여기서 들여쓰기를 하지 않으면 `@app` 어노테이션에서 전역 객체를 찾으려 시도하고, `'app' is not defined` 에러가 납니다.

이제 팩토리가 완성되었으니 테스트 모듈을 실행할 준비가 되었습니다.

## 테스트 실행

테스트 실행도 쉽습니다.

```
$ python -m pytest test_api.py
```

저번 포스팅에서도 설명했는데, `-m` 옵션은 모듈을 직접 실행하라는 뜻입니다. 즉 pytest를 직접 실행하여 그 뒤 인자로 들어오는 `py` 파일을 테스팅합니다.

![result](/assets/images/2024-03-05-lego-finder-5/result.png)

`scikit-learn` 모델로 예측하는 api를 만들고 이를 테스팅했습니다. 뭔가 코드를 잘못 짰나봅니다. 확실히 배포되기를 기다리고 수동으로 리퀘스트를 날리고 서버가 터지길 기다리는 것보다 편하게 테스트할 수 있군요.

[ref]:https://wikidocs.net/81504