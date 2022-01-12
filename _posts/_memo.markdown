---
layout: post
title:  "untitled"
date:   2022-01-08 20:00:00 +0900
categories: Pensee
---

코딩을 시작한 건 고등학교를 졸업하면서부터였습니다. 대학에서 부전공으로 컴퓨터를 선택하면서, 컴파일러나 운영체제를 건드려보기도 하는 등 프로그래밍에 대한 초석은 다져놨는데, 졸업할 때가 다 되고보니 포트폴리오가 너무 빈약한 듯 합니다.

기술 블로그를 만들게 된 것도 솔직히 말하자면, 결코 순수한 목적에서라고는 말하지 못하겠군요.



흠, 사이드 바를 recursive하게 만들 수 있을까?
- category | last 라면 최종 사이드 버튼만 만들고,
- ! category | last 라면 일단 버튼을 만든 후 밑에 접히는 리스트를 하나 더 만드는 식으로.

isOnGround 가장 좋은 해결방법.
https://github.com/Unity-Technologies/PhysicsExamples2D/blob/52ac7bff053365e39333c4eada4cd89c937cfd38/Assets/Scripts/SceneSpecific/Miscellaneous/SimpleGroundedController.cs#L17
