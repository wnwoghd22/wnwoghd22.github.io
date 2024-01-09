---
layout: post
title:  "안드 개발 생존기"
date:   2024-01-09 10:10:10 +0900
categories: daily
---

아침에 메일 한 통을 받았습니다.

구글 개발자 계정이 폐쇄될 수도 있으니 두 달 안에 앱을 업데이트하라는 독촉장이었습니다... 한창 웹 개발 한다고 이쪽은 거의 건들지도 않고 있었고, 메일함에는 제발 버전 업데이트 좀 하라는 안내장이 수북하게 쌓여있었습니다.

타겟 SDK도 올릴까 싶어 겸사겸사 레포를 받았습니다.

![no_key](/assets/images/2024-01-09-android-developer/no_key.png)

*아 맞다 키*

1년 전부터 관심 밖이었던 프로젝트에 업로드 키가 어딨는지는 당연히 기억날 리가 없습니다. 비어있는 입력란을 보고 순간 등줄기로 소름이 돋고 식은땀이 줄줄 납니다. 하아 젠장

![help_me](/assets/images/2024-01-09-android-developer/help_me.png)

업로드 키를 분실했어도 서명 키와는 상관 없는 일이고, 업로드 키를 재발급 받는 방법이 있었네요. 절차가 좀 복잡하긴 하지만 어쨌든 해봅니다.

![keytool](/assets/images/2024-01-09-android-developer/keytool.png)

이제 업로드 키 변경 신청을 했으니 앱을 업데이트해야...

![wrong_code](/assets/images/2024-01-09-android-developer/wrong_code.png)

*아*

버전 코드 올리는 걸 깜빡했네

![version_code](/assets/images/2024-01-09-android-developer/version_code.png)

딸-깍

이젠 되겠

![what_the](/assets/images/2024-01-09-android-developer/what_the.png)

*아오*

이건 처음 보는 건데...

![save_me](/assets/images/2024-01-09-android-developer/save_me.png)

찾아보니 SDK 12부터 추가해줘야 하는 게 있었네요.

![android_export](/assets/images/2024-01-09-android-developer/android_export.png)

자... 이제 다 고쳤으니 업로드를

![result](/assets/images/2024-01-09-android-developer/result.png)

*아아악*