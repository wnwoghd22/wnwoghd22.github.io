---
layout: post
title:  "공 포장하기"
date:   2022-08-21 16:00:00 +0900
categories: algorithm
---

이번에 리뷰해볼 문제는 [공 포장하기][problem]입니다.

문제 자체가 어려운 건 아닙니다. 다만 접근 방식을 대충 생각했다가는 무수히 많은 반례에 부딪혀 제대로 된 답을 구할 수 없어지죠. 문제는 간단합니다. 공 R, G, B를 최대 3개까지 담기는 상자에 나누어 담습니다. 상자 안에는 모두 같은 색, 또는 모두 다른 색으로만 넣어야 합니다. R, G, B의 개수가 주어졌을 때 필요한 상자의 최소 개수를 구하면 됩니다.

우선은 그리디로 접근해볼 수 있겠네요. 3개씩 같은 색으로 주워담다가, 남은 공은 절절히 나누어 담을 수 있겠습니다. 3개씩 나누어 담는 과정은 다음과 같습니다.

{% highlight cpp %}{% raw %}
int result = 0;
int R, G, B; // 입력을 받았다고 가정

result = R / 3 + G / 3 + B / 3; // 3개씩 나누어 담습니다.
R %= 3, G /= 3, B %= 3; // 나머지
{% endraw %}{% endhighlight %}

문제는 여기서부터입니다. 어떻게 나누어담아야 상자의 최소 개수가 나올까요?

"가장 큰 수만큼 상자를 쓰면 되겠네요"

예를 들면 남은 수가 1,1,2라고 합시다. 그렇다면 (R,G,B),(B) 또는 (R,G),(B,B)로 담을 수 있을 것 같습니다. 그럼 2개면 되겠네요. 위 방식대로 작성된 코드는 다음과 같습니다.

{% highlight cpp %}{% raw %}
#include <iostream>
#include <algorithm>

int main() {
    int R, G, B, result = 0;
    std::cin >> R >> G >> B;

    result += R / 3 + G / 3 + B / 3;
    R %= 3, G %= 3, B %= 3;

    result += std::max({R, G, B});
    std::cout << result;
}
{% endraw %}{% endhighlight %}

그리고 이 방식은 제대로 제출되지 않습니다. 뭐가 문제인 걸까요?

남은 개수가 0,0,2라면 어떻게 될까요? (B,B)로 하나의 상자에 모두 담을 수 있습니다. (1,1,3)이라도 마찬가지입니다. 가장 많은 개수는 답이 될 수 없죠.

결국 귀찮은 길을 조금 돌아갈 수밖에 없습니다. R,G,B를 적절히 상자에 나누어 담을 수 있을 때까지 나누어 담다가, 같은 색깔만 남으면 한 상자에 마저 담으면 됩니다. 그리고 그것이 최소 개수가 되죠.

정답이 될 수 있는 코드는 다음과 같습니다.

{% highlight cpp %}{% raw %}
#include <iostream>
#include <algorithm>

int main() {
    int R, G, B, result = 0;
    std::cin >> R >> G >> B;
    
    result += R / 3, R %= 3;
    result += G / 3, G %= 3;
    result += B / 3, B %= 3;
    
    while (R && G && B) result++, R--, G--, B--; // 3개를 넣을 수 있다면
    while (R && G) result++, R--, G--;
    while (G && B) result++, G--, B--;
    while (R && B) result++, R--, B--; // 2개를 넣을 수 있다면
    
    result += !(!R) + !(!G) + !(!B); // 같은 색끼리 마저 넣기
    
    std::cout << result;
}
{% endraw %}{% endhighlight %}

이걸로 문제 풀이는 완성입니다.

하지만 정녕 이게 최선일까요? 문제가 그리 복잡해보이지 않는 반면 풀이는 다소 긴 느낌이 드는데요. 한번 테이블을 만들어봅시다. X는 남은 공의 개수를 오름차순으로 정리한 입력입니다. sum은 X로 주어진 모든 공의 개수를 더한 값입니다. N은 필요한 상자의 개수입니다.

<table>
    <th>X</th><th>sum</th><th>sum/3</th><th>R==G==B?</th><th>N</th>
	<tr><td>0,0,0</td><td>0</td><td>0</td><td>Y</td><td>0</td></tr>
	<tr><td>0,0,1</td><td>1</td><td>0</td><td>N</td><td>1</td></tr>
	<tr><td>0,0,2</td><td>2</td><td>0</td><td>N</td><td>1</td></tr>
	<tr><td>0,1,1</td><td>2</td><td>0</td><td>N</td><td>1</td></tr>
	<tr><td>0,1,2</td><td>3</td><td>1</td><td>N</td><td>2</td></tr>
	<tr><td>0,2,2</td><td>4</td><td>1</td><td>N</td><td>2</td></tr>
	<tr><td>1,1,1</td><td>3</td><td>1</td><td>Y</td><td>1</td></tr>
	<tr><td>1,1,2</td><td>4</td><td>1</td><td>N</td><td>2</td></tr>
	<tr><td>1,2,2</td><td>5</td><td>1</td><td>N</td><td>2</td></tr>
	<tr><td>2,2,2</td><td>6</td><td>2</td><td>Y</td><td>2</td></tr>
</table>

모든 경우의 수가 많지 않아서 한눈에 보기 좋게 정리가 되네요. 여기서 주목해야 할 부분은 sum / 3과 R==G==B, 그리고 N입니다. 뭔가 보이지 않나요?

그렇습니다. N = sum / 3 + !(R==G==B)가 되는 겁니다!

정리해봅시다. R, G, B가 주어졌을 때, 필요한 상자의 최소 개수는 공들의 총합을 3으로 나눈 후, 나머지가 모두 같은 경우가 아니라면 1을 더해주면 되는 겁니다.

{% highlight cpp %}{% raw %}
#include <iostream>

int main() {
    int R, G, B;
    std::cin >> R >> G >> B;
    std::cout << (R + G + B) / 3 + !(R % 3 == G % 3 && G % 3 == B % 3);
}
{% endraw %}{% endhighlight %}

매우 단순해졌군요!

내친김에 좀 더 줄여볼까요? 여기서부턴 예능의 영역이므로 굳이 주의깊게 읽으실 필요는 없고, "아, 그냥 이런 게 되는구나"하시면서 보시면 됩니다.

C언어는 main 함수에 대해서는 반환형을 명시하지 않아도 컴파일을 해줍니다. 물론 경고를 뱉어내지만요.

{% highlight c %}{% raw %}
main() {
{% endraw %}{% endhighlight %}

또한 int형 매개변수를 넘겨받아 쓸 수도 있습니다. 그리고 매개변수의 자료형은 명시하지 않아도 컴파일을 해줍니다. 물론 경고를 뱉어냅니다.

{% highlight c %}{% raw %}
main(R,G,B) {
{% endraw %}{% endhighlight %}

그리고는 한 줄에 모두 써줍시다.

{% highlight c %}{% raw %}
main(R,G,B){scanf("%d%d%d",&R,&G,&B);printf("%d",(R+G+B)/3+!(R%3==G%3&&G%3==B%3));}
{% endraw %}{% endhighlight %}

![result](/assets/images/2022-08-21-short-coding/result.png)

코드를 적절히 줄이는 것은 퍼포먼스의 개선에도 도움이 됩니다. 하지만 숏코딩을 하겠답시고 읽기 어려운 수준으로 줄일 필요는 없으니 재미로만 합시다.

[problem]:https://www.acmicpc.net/problem/12981