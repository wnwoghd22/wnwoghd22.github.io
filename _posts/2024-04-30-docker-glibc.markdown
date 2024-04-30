---
layout: post
title:  "Rust 도커 컨테이너, glibc 문제"
date:   2024-03-26 16:00:00 +0900
categories: devlog daily
use_math: true
---

최근 zero to production: 러스트 백엔드 프로그래밍 책을 보고 있습니다. 5.3.7 파트를 보며 도커 이미지를 최적화하던 중 다음 문제가 발생했습니다.

```
$ docker run

./zero2prod: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.32' not found (required by ./zero2prod)
./zero2prod: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.33' not found (required by ./zero2prod)
./zero2prod: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.34' not found (required by ./zero2prod)
```

도커 이미지는 각각 builder와 runtime 단계로 나뉘어 만들어지며, runtime 단계는 용량 최적화를 위해 원시적인 OS인 debian을 쓰도록 했습니다.

```dockerfile
# Builder stage

# latest stable release
FROM rust:1.77.2 AS builder

WORKDIR /app
RUN apt update && apt install lld clang -y
COPY . .
ENV SQLX_OFFLINE true
RUN cargo build --release

# Runtime stage
FROM debian:bullseye-slim AS runtime
WORKDIR /app
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/zero2prod zero2prod
COPY configuration configuration
ENV APP_ENVIRONMENT production
ENTRYPOINT ["./zero2prod"]
```

그냥 책만 보고 빌드했더니 컨테이너가 시작조차 되지 않습니다. 조금 찾아보니 프로그램이 요구하는 C 라이브러리 버전이 OS의 것과 맞지 않아 문제가 생긴 것이었습니다.

`debian`은 주기적으로 새 버전을 릴리즈하는데, `bullseye`는 glibc 2.31까지 지원하는 반면 `rust` 최신 버전은 glibc 2.32~34를 요구합니다.

해결방법은 단순한데, debian 버전을 올려주면 되었습니다.

```dockerfile
# Runtime stage
FROM debian:bookworm-slim AS runtime
```

zero-to-production 깃허브를 보니 업데이트된 Dockerfile을 확인할 수 있었습니다. 이쪽부터 미리 확인해볼걸 그랬네요.

러스트 백엔드를 설계할 수 있는 적절한 실력을 갖추고 나면 영화관 찾기 서비스를 하나 개발해보려 합니다... 취업 활동은 잘 안 되고(서류 단계에서 몽땅 탈락했습니다) 개발자를 포기하기 전에 하나만이라도 사람들이 쓸만한 프로젝트를 만들어보고 싶네요.