---
layout: post
title:  "DFS와 BFS"
date:   2022-08-17 12:00:00 +0900
categories: algorithm daily
---

이번에 리뷰해볼 문제는 순회입니다. 그중에서도 [DFS와 BFS][problem]를 동시에 구현하는 걸로 가져왔습니다.

그래프의 순회방식에는 물론 여러가지가 있겠지만, 이 문제에서는 특히 깊이 우선 탐색과 너비 우선 탐색을 구현하는 데에 초점을 두고 있습니다. 예시로 보여드릴 그림들은 트리 구조이지만, 두 순회 방식은 모든 그래프에 대해서도 적용 가능합니다.

![dfs](/assets/images/2022-08-17-dfs-and-bfs/dfs.png)

깊이 우선 탐색(depth-first)은 말 그대로 깊게 탐색하는 방식입니다. 현재 노드에서 출발하여 다음 노드로 바로 넘어가는데, 마지막으로 찾은 노드에서 더이상 다음 노드로 넘어갈 수 없으면 뒤로 돌아간 후 연결되어있는 다른 노드로 넘어가기를 반복합니다.

dfs의 특징으로는 구현 자체는 간단하다는 점이 있겠네요. 먼저 탐색했던 노드로 돌아간다는 점에서는 스택으로 구현해도 되고, 매 노드를 방문할 때마다 동일한 절차를 수행한다는 점에서는 재귀로 구현할 수도 있습니다. 예시의 코드는 재귀로 구현되었습니다.

간단하게 구현되는 게 dfs이지만, 한 가지 단점이 있다면 특정 노드를 찾아가기까지 시간이 꽤 걸릴 수 있다는 겁니다. 시작 노드에서 바로 두 번째로 연결되어있는 노드를 방문해야하는데, 첫 번째 노드에 달린 꼬리가 길다면 하는 수 없이 기다려야 하는 거죠.

![bfs](/assets/images/2022-08-17-dfs-and-bfs/bfs.png)

너비 우선 탐색(breadth-first)은 인접한 노드를 우선하여 넓게 훑는 방식입니다. 주위 노드를 모두 방문하여 더는 방문할 노드가 없다면, 한 층 나아가서 다시 인접 노드를 훑기를 반복합니다.

bfs를 수행하면 인접한 노드를 빠르게 순회할 수 있다는 장점이 있습니다. 특정 노드가 가깝다는 것을 알 때, 평균적으로 dfs보다 빠르게 닿을 수 있겠죠. 물론 두 순회는 전체 그래프를 훑는다는 전제 하에서는 소요 시간이 같습니다.

bfs는 그 특성상 재귀로는 구현하기 곤란합니다. 대신 큐를 이용하면 어렵지 않게 만들 수 있습니다. 인접 노드를 모두 큐에 넣어두었다가, 더는 방문할 노드가 없으면 처음으로 방문했던 노드의 인접 노드를 다시 훑습니다.

아래는 예시 코드입니다.

{% highlight cpp %}{% raw %}
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <cstring>

std::vector<int> graph[100000];
bool visited[100000];
std::queue<int> order; // 순회 순서를 출력하기 위한 큐
int N;

void dfs(int u) {
    if (visited[u]) return;
    
    visited[u] = true, order.push(u + 1);
    for(const int& v : graph[u]) dfs(v); // 재귀적으로 각 노드를 탐색합니다.
}

void bfs(int u) {
    std::queue<int> q;
    
    visited[u] = true, order.push(u + 1);
    q.push(u);
    
    while (!q.empty()) {
        u = q.front(), q.pop(); // 가까운 노드를 먼저 꺼냅니다.
        for (const int& v : graph[u]) {
            if (!visited[v]) {
                visited[v] = true, order.push(v + 1);
                q.push(v);
            }
        }
    }
}


int main() {
    int M, start, u, v;
    std::cin >> N >> M >> start;
    while (M--) {
        std::cin >> u >> v;
        graph[u - 1].push_back(v - 1);
        graph[v - 1].push_back(u - 1);
    }
    for (int v = 0; v < N; ++v) std::sort(graph[v].begin(), graph[v].end());
    
    dfs(start - 1);
    while (!order.empty()) std::cout << order.front() << ' ', order.pop();
    std::cout << std::endl;
    
    memset(visited, 0, sizeof visited); // 방문여부 초기화
    
    bfs(start - 1);
    while (!order.empty()) std::cout << order.front() << ' ', order.pop();
    std::cout << std::endl;
    
    return 0;
}
{% endraw %}{% endhighlight %}

간선 정보를 담는 방식으로는 이차원 배열 대신 벡터를 활용했습니다. 이전 문제들에서 정점의 수가 최대 100,000이었기 때문에 이차원 배열로 그래프를 표현하면 바로 메모리 초과가 발생합니다. sparse한 정보를 담아두고자 한다면 배열은 그닥 좋은 선택이 아니죠. 물론 이번 문제에서는 정점의 수가 최대 1000이므로 이차원 배열로 만들어도 상관은 없지만 vector의 iterator를 활용해 깔끔하게 구현해놓는 게 보기 좋아서 그냥 뒀습니다.

[problem]:https://www.acmicpc.net/problem/1260