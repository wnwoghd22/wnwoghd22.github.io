---
layout: post
title: "Confidential Computing과 Cybersecurity"
date:   2022-09-06 14:00:00 +0900
categories: essay daily
---

이번에도 보안과 관련된 [글][article]입니다. 화재가 될 만한 이슈는 쉽게 뉴스거리가 되지만, 정작 중요한 글은 어딘가에 묻혀있을 따름이지요. 이번 주제는 Confidential Computing입니다.

우선 Confidential Computing이 무엇인지 알아보기 전에, 데이터의 유형에 대해 생각해볼 필요가 있습니다. 데이터는 어떤 형태로 우리 주위에 있을까요? 일단 하드디스크나 USB에 저장된 정보가 있겠네요. 아니면 원격 DB에 저장된 것도 있습니다. 이런 것을 미사용 데이터(data at-rest)라 합니다. 그리고 우리 주위의 회선을 왔다갔다 하며 단말과 단말 사이를 이동하는 정보들도 있습니다. 흔히 패킷으로 전송되는 이러한 정보는 data in-transit이라 합니다. 한편, 프로세스에서 처리하고 있는 활성화된 정보도 있습니다. 이것은 사용중인 데이터(data in-use)입니다.

보안은 이 3가지 형태의 데이터를 모종의 방식으로 암호화함으로써 이루어집니다. 이를 End-to-End Encryption(E2EE, 종단간 암호화)라 합니다. 정보가 저장될 때 암호화되고 프로세스에 읽어들일 때 복호화하는 방식으로 저장 데이터를 지킬 수 있습니다.(Encryption at-rest) 원거리 통신에서 패킷을 암호화하고 복호화하는 방식은 오래전부터 표준이었죠.(Encryption in-transit) 한편, 한 단말 내에서도 처리중인 데이터를 암호화하는 방식으로 더욱 철저하게 보안을 유지할 수도 있습니다.(Encryption in-use)

Confidential Computing은 위 3가지 유형의 암호화 중 마지막 세 번째 암호화 기능을 제공하는 것을 말합니다. 실시간으로 사용중인 데이터를 암호화하니까 악의적인 접근이 있더라도 무엇을 어떻게 하는지 전혀 알 수 없게 되겠죠.

이를 가능하게 해주는 것이 일종의 가상 머신입니다. Confidential VM에서 작업이 이루어지므로 클라우드 서비스의 제공자도 VM에서 처리되는 정보를 알 수 없게 하죠. CPU 제작 업체인 AMD는 이러한 CVM의 실행이 가능한 고성능 프로세서를 만드는데, 이를 Secure Encrypted Virtualization(SEV)라고 하는군요. 실시간으로 암호화와 복호화가 이루어지면 어찌됐든 성능 저하가 발생할 것도 같은데, Google이 말하기로는 AMD SEV의 성능 저하는 통상의 0~6% 수준이라고 하니 별 문제는 안 되나 봅니다.

클라우드 서비스(SaaS)의 보안 문제에 대한 해답으로 microsegmentation과 Confidential Computing을 활용하는 것, 말은 쉽고 그럴듯해 보이지만 사실 그렇진 않겠죠.

[article]:https://venturebeat.com/security/is-confidential-computing-the-future-of-cybersecurity-edgeless-systems-is-counting-on-it/