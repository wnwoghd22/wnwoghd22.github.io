---
layout: post
title:  "코딩테스트 - Show me the Dungeon"
date:   2022-07-03 12:00:00 +0900
categories: ps
---

2022년도 2회차 원티드 쇼미더코드 대회에 참가했습니다. 게임톤으로 포트폴리오는 그럭저럭 만들 수 있겠다 싶은데, 프로그래밍 실력은 어떻게 보여줄까 하다가 마침 좋은 기회가 있었거든요. 물론 결과는 그닥 좋진 않네요. 3문제 중 2개 밖에 풀지 못했으니 어디 써먹을진 좀 애매해졌지만, 복습하는 차원에서 되짚어보겠습니다.

문제 A는 던전을 돌아다니는 용사의 이야기입니다. 탐색 문제의 단골 소재군요. 각 던전을 입장하는 순서는 선택할 수 있고, 던전에서 몬스터와 싸울 때마다 몬스터의 공격력만큼 체력을 소비합니다. 이 때, 지금까지 돌았던 던전에서 소비한 체력을 추가로 소비한다는 게 포인트. 식으로 정리하자면,

k개 던전을 탐색한 후 i번째 던전의 몬스터의 공격력 <em>A</em><sub>i</sub>, 소비하는 체력 A에 대해,

<em>A</em> = (<em>A</em><sub>1</sub> + <em>A</em><sub>2</sub> + ... + <em>A</em><sub>k</sub>) + <em>A</em><sub>i</sub>

던전을 정복하면 사람들을 구출할 수 있습니다. 체력이 0 미만이 되면 탐색은 종료되고 더 이상 사람을 구출할 수가 없습니다. 체력이 남아있는 선에서 탐색을 하여, 던전을 몇 개 돌든 상관없이 구출할 수 있는 사람의 최대치를 구하면 되는 문제입니다.

이런 유형의 문제를 마주하면 일단 생각해볼 수 있는 방식은 <strong>순열</strong>과 <strong>조합</strong>입니다. 이 던전 탐색의 체력 계산 방식은 던전 탐색 순서가 중요해지니, 순열을 이용하는 게 좋겠군요.
`next_permutation`을 이용해서 짜볼까요.

{% highlight cpp %}{% raw %}
#include <iostream>
#include <vector>
#include <algorithm>

class Dungeon {
public:
    Dungeon(int a, int p) : a(a), p(p) {}
    friend bool operator<( const Dungeon& lhs, const Dungeon& rhs ) { return lhs.a < rhs.a; }
    int a, p;
};

int main() {
    std::vector<Dungeon> d;
    int N, K, k, sum;
    std::cin >> N >> K;
    int* A = new int[N];
    int P, p;
    
    for (int a = 0; a < N; ++a) std::cin >> A[a];
    for (int p = 0; p < N; ++p) {
        std::cin >> P;
        d.push_back(Dungeon(A[p], P)); // 각 던전의 공격력과 구출 가능한 사람 수를 담아 저장
    }
    sort(d.begin(), d.end());
    
    P = 0;
    do {
        k = K, sum = 0, p = 0;
        for (const auto& e : d) {
            sum += e.a; k -= sum;
            if (k < 0) break;
            p += e.p;
        }
        P = p > P ? p : P;
    } while (next_permutation(d.begin(), d.end()));
    
    std::cout << P;
    
    return 0;
}
{% endraw %}{% endhighlight %}

이 정도면 논리 자체는 이상할 것이 없어보입니다. 그럼 정답이겠군요?!

물론 그럴 리 없습니다. 시간 초과가 떡하니 찍힐 뿐이죠. 순열을 이용한 완전탐색 방식을 활용할 때에는 문제의
조건을 잘 봐야 합니다. 정렬하고자 하는 대상의 수, 즉 던전의 수는 최대 20개입니다. 이정도면 별로 많아보이지 않는다고 생각할 수도 있지만, 그게 또 그렇지 않습니다.

순열을 만들 때, 첫 번째 원소가 될 수 있는 것은 전체 중 임의의 원소이므로 n 개 경우가 있습니다. 그 다음은 첫 번째로 뽑은 원소를 제외하고 n - 1, 그 다음은 n - 2, ... n개 원소로 순열을 만들 때의 총 경우의 수는 n!입니다. 10! = 3628800, 20! &#8786; 2.43e + 18... 시간복잡도로 팩토리얼이 나온다는 건 그야말로 최악이죠.

물론 문제 특성 상 모든 경우를 고려해야만 합니다. 무작정 소비 체력이 낮은 던전만 골라 탐색하는 그리디 방식으로 돈다고 해서 사람을 많이 구할 수 있는 것도 아닙니다. 그렇다면 고려할 수 있는 대안은 DFS입니다.

깊이우선탐색으로 모든 순열을 구할 수 있습니다. 템플릿은 다음과 같죠.
```
num = [ e0, e1, ... e ] # 순열을 만들 대상
perm_list = [] # 순열을 담을 리스트
flags = [ False, ... ] # 방문 여부를 확인할 변수
max_depth = list.length
perm = [] # 순열을 만들기 위한 임시 리스트

function DFS(depth):
        if depth == max_depth:
            perm_list.add(perm) # 순열이 완성되면 담기
        else:
            for i in range(max_depth):
                if not flags[i]:
                    flags[i] = True # 방문
                    perm[depth] = num[i] # 숫자 담기
                    DFS(depth + 1)
                    perm[depth] = None # 숫자 빼기
                    flags[i] = False # 방문 해제
        # 방문 해제 후 다음 i번째 숫자를 depth번째로 넣고 다시 탐색하기를 반복합니다.
```

순열을 만들어내는 함수를 직접 만들어내면 위의 형태가 됩니다. 직접 메소드를 만들 때의 장점은, 꼭 순열을 끝까지 만들지 않더라도 중간에 빠져나갈 여지를 줄 수 있다는 거죠. 깊이우선탐색을 진행하되, 조건을 충족하지 않으면 다음 경우들은 모두 무시할 수 있다면 시간은 충분히 절약할 수 있을 겁니다.

{% highlight cpp %}{% raw %}
#include <iostream>
#include <vector>
#include <algorithm>

class Dungeon {
public:
    Dungeon(int a, int p) : a(a), p(p) {}
    friend bool operator<( const Dungeon& lhs, const Dungeon& rhs ) { return lhs.a < rhs.a; }
    int a, p;
};

/*
 * 이 풀이방법의 핵심이 되는 함수입니다.
 * 굳이 모든 경우를 고려하지 않고, 중간에 적당히 빠져나갈 수 있도록 해서 시간을 어떻게든 줄일 수 있죠.
 *
 * return value : 특정 탐색 순서에 대해 구출할 수 있는 사람의 수. 체력이 0 미만일 경우 -1을 반환합니다.
 */
int dfs(std::vector<Dungeon> d, std::vector<Dungeon> target, bool* visit, const int K) {
    int result = 0, k = K, sum = 0;
    if (!target.empty()) {
        for (const auto& e : target) {
            sum += e.a; k -= sum; result += e.p;
        }
        if (k < 0) return -1; // 체력이 0 미만이 되면 다음 조건은 더이상 탐색하지 않습니다.
    }
    if (target.size() < d.size()) {
        for (int i = 0; i < d.size(); ++i) {
            if (!visit[i]) {
                visit[i] = true;
                target.push_back(d[i]);
                int next = dfs(d, target, visit, K);
                result = next > result ? next : result;
                target.pop_back();
                visit[i] = false;
            }
        }
    }
	return result;
}

int main() {
    std::vector<Dungeon> d, t;
    int N, K, k, sum, *A, P;
    std::cin >> N >> K;
    A = new int[N];
    
    for (int a = 0; a < N; ++a) std::cin >> A[a];
    for (int p = 0; p < N; ++p) {
        std::cin >> P;
        d.push_back(Dungeon(A[p], P));
    }
    bool* flag = new bool[N];
    for (int i = 0; i < N; ++i) flag[i] = false;
    
    P = dfs(d, t, flag, K);
    
    std::cout << P;
    
    return 0;
}
{% endraw %}{% endhighlight %}

어찌저찌 풀이는 성공이군요. 물론 개선의 여지가 상당한 코드입니다만... 코딩 테스트만 쳤다하면 시간에 쫓기면서 코드가 엉망이 되어버리는 느낌입니다. 아직 공부가 부족해요.