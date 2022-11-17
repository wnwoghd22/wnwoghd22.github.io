---
layout: post
title:  "백준 이분매칭 - 열혈강호 시리즈 1 ~ 4"
date:   2022-11-17 17:00:00 +0900
categories: algorithm
use_math: true
---

이제 백준 단계별로 풀어보기도 막바지에 다다랐습니다.

![progress](/assets/images/2022-11-17-bipartite/progress.png)

사실 이정도쯤 되면 다루게 되는 문제들은 어지간한 기업 코딩 테스트에서도 출제하지 않는 매니악한 컨셉들을 다루게 되는데요, 이분매칭도 마찬가지입니다. 취업이나 해놓고 글을 쓰면 좋겠지만, 일단은 계속 공부할 수 밖엔 없네요.

이분매칭의 개념이야 정리해놓은 글들이 많으니 참고하시면 될 거고, 이 글에서는 [열혈강호 시리즈][page]를 풀어보려고 합니다. 1~4까지는 이분매칭만 잘 활용해도 풀 수 있는 문제들이니까요.

[열혈강호 그 첫 번째 문제][q1]는 매우 고전적인 이분매칭이라 할 수 있습니다. 각 직원이 할 수 있는 일의 목록이 있고, 되도록 많은 일을 하도록 할당하는 것입니다.

{% highlight cpp %}{% raw %}
#include <iostream>
#include <vector>

const int LEN = 1001;

std::vector<int> a[LEN];
int d[LEN];
bool c[LEN];
int N, M;

bool dfs(int x) { // 이분매칭용 dfs
	for (const int& t : a[x]) {
		if (c[t]) continue; // 현 단계에 새로 할당되었다면 넘어가기
		c[t] = true;  // 현 단계에서 새로 할당되지 않았다면 일단 집어넣습니다
		// 전 단계에서 할당된 적이 없거나 전 단계에서 할당했던 사람이 다른 일을 할 수 있다면
		if (!d[t] || dfs(d[t])) {
			d[t] = x; // 할당합니다
			return true;
		}
	}
	return false;
}

int main() {
	std::cin >> N >> M;
	for (int n, k, i = 1; i <= N; ++i) {
		std::cin >> n;
		while (n--) {
			std::cin >> k;
			a[i].push_back(k);
		}
	}
	int count = 0;
	for (int i = 1; i <= N; ++i) {
		std::fill(c, c + M + 1, false); // 각 단계마다 할당 여부를 초기화합니다
		if (dfs(i)) ++count; // i 번째 사람이 일을 할당받을 수 있다면 개수 1 추가
	}
	std::cout << count;
}
{% endraw %}{% endhighlight %}

이분매칭은 마치 굴러온 돌이 박힌 돌을 빼내고 들어가는 듯이 이루어집니다. 그렇게 모든 사람들에 대해 할당을 완료했다면 실제 할당받은 횟수가 이분매칭의 크기가 됩니다.

이제 응용을 해봅시다.

[열혈강호 2][q2]는 모든 사람들에게 일을 최대 2개까지 시킬 수 있습니다. 어렵게 생각할 것 없이, 각 인원에게 일을 두 번씩 할당해서 되는대로 넣으면 됩니다.

{% highlight cpp %}{% raw %}
	int count = 0;
	for (int i = 0; i < N * 2; ++i) {
		std::fill(c, c + M + 1, false);
		if (dfs(i / 2 + 1)) ++count; // (i / 2 + 1) = 1, 1, 2, 2, 3, 3, ... , N, N
	}
	std::cout << count;
{% endraw %}{% endhighlight %}

[열혈강호 3][q3]은 조금 복잡해집니다. 최대 K명은 2개까지 일을 할 수 있다고 하는데요, 정석적인 풀이라면 최대유량을 활용하는 것이겠지만 이분매칭으로도 풀 수는 있죠. 일단 모든 인원에게 일을 하나씩 할당해본 후, 한 번 더 일을 할당합니다. 대신 이번엔 최대 K번까지 할당하고 그 수가 충족되면 할당을 종료하는 식으로 풀 수 있습니다.

{% highlight cpp %}{% raw %}
	int count = 0;
	for (int i = 1; i <= N; ++i) { // 한 차례 할당을 하고
		std::fill(c, c + M + 1, false);
		if (dfs(i)) ++count;
	}
	for (int i = 1; i <= N && K; ++i) { // 한 번 더 할당을 합니다.
		std::fill(c, c + M + 1, false);
		if (dfs(i)) ++count, --K; // 대신 K번 할당이 완료되면 빠져나갑니다.
	}
	std::cout << count;
{% endraw %}{% endhighlight %}

[열혈강호 4][q4]는 더 복잡해집니다. 벌점 K개를 적당히 조작해서 일을 추가로 시킬 수 있다고 합시다. 정석적인 풀이라면 모든 일을 할 수 있는 와일드 카드를 하나 따로 만들어놓고 K의 용량을 설정해서 흘려보내는 최대 유량 풀이겠지만, 이것도 3번처럼 풀 수 있습니다. 대신 식은 좀 복잡해집니다.

{% highlight cpp %}{% raw %}
	int count = 0;
	for (int i = 1; i <= N; ++i) { // 한 차례 할당을 하고
		std::fill(c, c + M + 1, false);
		if (dfs(i)) ++count;
	}
	for (int i = 1; i <= N && K; ++i) { // 한 번 더 할당을 하는데
		while (K) {
			std::fill(c, c + M + 1, false);
			if (dfs(i)) ++count, --K; // K번까지 또는 더 넣을 수 있을 때까지 넣어봅니다.
			else break;
		}
	}
	std::cout << count;
{% endraw %}{% endhighlight %}

이쯤되면 저게 맞는 식인가 싶지만 실제로 잘 돌아갑니다.

5, 6번은 최소비용 최대유량 문제라서 더 공부를 해봐야 할 것 같네요.

[page]:https://www.acmicpc.net/workbook/view/6533
[q1]:https://www.acmicpc.net/problem/11375
[q2]:https://www.acmicpc.net/problem/11376
[q3]:https://www.acmicpc.net/problem/11377
[q4]:https://www.acmicpc.net/problem/11378