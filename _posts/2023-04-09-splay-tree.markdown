---
layout: post
title:  "Splay Tree"
date:   2023-04-09 22:00:00 +0900
categories: datastructure
use_math: true
---

삼성 역량평가 B형 시험 때 써먹을 수 있을까 싶어 스플레이 트리를 공부하고 있는 요즘입니다. 몇 번에 걸쳐 이 자료구조에 대해서는 글을 작성해서, 공부한 내용을 정리할 필요가 있겠군요. 이번 글에서는 개략적인 설명과 활용 예시만 써볼까 합니다.

- - -

스플레이 트리는 본질적으로는 균형 이진 검색 트리의 한 종류입니다. 여느 이진 검색 트리가 그렇듯, 왼쪽 자손 노드의 모든 값들은 부모 노드의 값보다 작고, 오른쪽 자손 노드의 값들은 반대로 큽니다. 현재 값이 찾고자 하는 값보다 크고 작은지에 따라 왼쪽, 오른쪽으로 내려가며 탐색 범위를 반씩 줄여나갈 수 있습니다. 물론 이는 트리의 균형이 잘 잡혀있을 때의 이야기입니다.

이진 검색 트리의 양쪽이 고르게 나뉘었다면-즉 균형이 잘 잡혔다면, 검색에 걸리는 시간은 평균 \\(O(\log N)\\)이 됩니다. 재귀적으로 양쪽 자손의 높이 차가 기껏해야 1 이하가 되면, 균형이 잘 잡혔다고 할 수 있죠. 그런데 그 특성상 이진트리에 삽입되는 숫자의 순서에 따라 이 균형은 너무나 쉽게 무너집니다. 숫자가 커지는 순서 혹은 작아지는 순서로 넣으면 한 쪽으로 꼬리가 긴 이진 검색 트리가 됩니다.

균형 이진 검색 트리는 임의의 삽입, 삭제 시에도 좌우의 균형을 유지하는 이진 트리를 가리킵니다. `AVL Tree`, `red-black tree`, `2-3-4 tree`등 그 종류도 다양합니다. 각각의 트리들은 균형을 맞추기 위한 고유의 알고리즘을 갖고 있으며, 꽤나 복잡한 공식에 의존합니다. `AVL tree`는 특유의 `rotate`로 트리를 회전시켜가며 균형을 유지하고, `red-black tree`는 트리 경로 상 빨간 정점들 간 거리를 유지하는 식으로 말이죠. 이런 메서드는 트리의 높이를 거의 확실하게 \\(\log N\\) 이하로 유지해준다는 장점이 있지만, 이걸 막상 구현해보자면 너무 복잡한 것이 문제입니다.

그런 면에서 `splay tree`는 확실히 장점을 가집니다. 균형을 맞추는 방식이 너무나 단순해서, 시험 시간이 충분히 길다면 시험장에서도 그럭저럭 만들어낼 수 있을 정도로 구현이 쉽습니다. 물론 아주 문제가 없는 건 아닌데, 엄격한 균형을 보장하지 않는다는 거죠... 엥?

스플레이 트리는 그 이름답게 `rotate`와 `splay` 단 두 개의 메서드만 잘 정의하면 완성되는 균형 이진 트리입니다. `rotate`는 부모-자식 간 관계를 돌리는 메서드입니다. `splay`는 밑에서부터 특정 노드를 끄집어올리는 메서드입니다. 이 `splay`는 자식-부모-조부모 노드의 방향에 따라 `zig-zig`, `zig-zag` 그리고 `zig` 스텝으로 나뉩니다. 처음에는 완전히 치우친(skewed) 이진 트리라 하더라도 충분히 많이 splay해주면 균형을 찾아간다고 합니다. 충분히 많이 삽입, 검색, 삭제가 이루어졌을 때, 시간복잡도는 분할상환으로 계산되어 \\(amortized\ O(\log N)\\)이 됩니다. 분할상환 시간복잡도는 나중에 더 깊게 공부해봐야겠군요.

그럼 실제로는 어떻게 쓸 수 있는지 보겠습니다.

- - -

[풀어볼 문제][q]는 AtCoder Beginner Contest에서 가져왔습니다.

AtCoder 왕국은 가격이 \\(A_i\\)인 \\(N\\) 종류의 타코야끼를 팔고 있습니다. 타카하시 군이 1개 이상의 타코야끼를 산다고 할 때, 총 금액이 가장 싼 경우부터 순서대로 \\(K\\)번째인 경우에 얼마를 지불해야 할 지 구하면 됩니다.

만약 \\(A\\)의 범위가 크지 않다면 다이나믹 프로그래밍으로 하면 좋겠는데, 이게 \\(10^9\\)까지입니다. 대신 \\(N\\)이 최대 \\(10\\)이므로 이쪽을 노리는 게 좋겠습니다.

풀이는 단순합니다. \\(0\\)개 사는 경우를 \\(0\\)번째라고 합시다. 그럼 숫자를 큰 순서대로 관리할 수 있는 집합에 넣고, 가장 작은 것을 꺼내서 각 타코야끼의 가격만큼 더한 값을 모두 집합에 넣어줍니다. 이걸 \\(K\\)번 반복하면 됩니다.

숫자를 순서대로 관리하는 집합으로 써먹을 수 있는 구조는 여러가지가 있겠지만, 스플레이 트리를 쓸 수 있죠. \\(K\\) 값도 만만찮게 큰데 나중에 집합의 크기가 무식하게 커지면 어떻게 하나 싶긴 합니다. 하지만 크게 걱정할 것은 없는게, 어느 정도 최소값을 찾다보면 결국 모든 \\(A_i\\) 값들의 최대공약수의 배수들만 나타나게 됩니다. 그마저도 걱정이라면, 집합의 크기가 \\(K\\)가 될 때까지 큰 순서대로 꺼내는 것도 방법입니다.

```cpp
#include <iostream>

typedef long long ll;
const int LEN = 2e5 + 1;
class SplayTree {
    struct Node {
        Node* l;
        Node* r;
        Node* p;
        ll val;
        int size;
        Node(ll val) : l(0), r(0), p(0), val(val), size(1) {}
        ~Node() { if (l) delete l; if (r) delete r; }
        void update() {
            size = 1;
            if (l) size += l->size;
            if (r) size += r->size;
        }
    } *root;
    void rotate(Node* x) {
        Node* p = x->p;
        if (!p) return;
        Node* b = 0;
        if (x == p->l) {
            p->l = b = x->r;
            x->r = p;
        }
        else {
            p->r = b = x->l;
            x->l = p;
        }
        x->p = p->p; // 부모-자식 간 관계를 뒤집습니다.
        p->p = x;
        if (b) b->p = p;
        (x->p ? p == x->p->l ? x->p->l : x->p->r : root) = x;
        p->update();
        x->update();
    }
    void splay(Node* x) {
        while (x->p) { // 노드 x가 루트가 될 때까지 끄집어올립니다.
            Node* p = x->p;
            Node* g = p->p;
            if (g) {
                if ((x == p->l) == (p == g->l)) rotate(p); // zig-zig
                else rotate(x); // zig-zag
            }
            rotate(x); // zig
        }
    }
public:
    SplayTree() : root(0) {}
    ~SplayTree() { if (root) delete root; }
    void insert(ll val) {
        if (!root) {
            root = new Node(val);
            return;
        }
        Node* p = root;
        Node** pp;
        while (1) {
            if (p->val == val) return;
            if (p->val > val) {
                if (!p->l) {
                    pp = &p->l;
                    break;
                }
                p = p->l;
            }
            else {
                if (!p->r) {
                    pp = &p->r;
                    break;
                }
                p = p->r;
            }
        }
        Node* x = new Node(val);
        x->p = p;
        *pp = x;
        splay(x);
    }
    bool find(ll val) {
        if (!root) return false;
        Node* p = root;
        while (1) {
            if (p->val == val) break;
            if (p->val > val) {
                if (!p->l) break;
                p = p->l;
            }
            else {
                if (!p->r) break;
                p = p->r;
            }
        }
        splay(p);
        return p->val == val;
    }
    void pop(ll val) {
        if (!find(val)) return;
        Node* p = root;
        
        if (p->l && p->r) {
            root = p->l; root->p = 0;
            Node* l = root;
            while (l->r) l = l->r;
            l->r = p->r;
            p->r->p = l;
        }
        else if (p->l) root = p->l, root->p = 0;
        else if (p->r) root = p->r, root->p = 0;
        else root = 0;
        p->l = p->r = 0;
        delete p;
    }
    ll get(int i) { // zero-base, i번째 원소의 값을 반환합니다.
        Node* p = root;
        if (!p) return -1;
        while (1) {
            while (p->l && p->l->size > i) p = p->l;
            if (p->l) i -= p->l->size;
            if (!i--) break;
            p = p->r;
        }
        splay(p);
        return p->val;
    }
} sp;
ll N, K, A[10], ans[LEN];

int main() {
    std::cin >> N >> K;
    for (int i = 0; i < N; ++i) std::cin >> A[i];
    sp.insert(0);
    for (int i = 0; i <= K; ++i) {
        ll min = sp.get(0); // 현 시점에 가장 작은 원소를 찾습니다.
        sp.pop(min); // 집합이 너무 커지지 않게 pop
        for (int j = 0; j < N; ++j) {
            sp.insert(min + A[j]); // dijkstra를 돌리듯 최소 비용을 갱신해줍니다.
        }
        ans[i] = min;
    }
    std::cout << ans[K];
}
```

이 풀이도 결국 메모이제이션을 한다는 점에서는 DP 문제로 볼 수 있겠으나, 이를 관리하기 위한 구조를 잘 선택하는 것이 관건이었습니다. 이렇게 `set + BFS` 외에 또 다른 풀이로 `parametric search + DFS`도 존재하는 것 같습니다만, 이번 글은 스플레이 트리를 다루니까 줄이겠습니다.

B형이 따고 싶습니다...

[q]:https://atcoder.jp/contests/abc297/tasks/abc297_e