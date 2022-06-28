---
layout: post
title:  "코딩테스트 - 징검다리"
date:   2022-06-23 23:00:00 +0900
categories: algorithm daily
---

프로그래머스 코딩테스트 연습문제 적어도 하루에 2개씩은 풀기로 했지만, 계속 쉬운 문제만 풀어서는 실력이 늘 것 같지가 않았습니다. 그래서 좀 도전적인 문제를 풀어보기로 했죠. 서론이 길어지면 재미 없으니 바로 본론으로 넘어갑시다.

> 출발지점부터 distance만큼 떨어진 곳에 도착지점이 있습니다. 그리고 그사이에는 바위들이 놓여있습니다. 바위 중 몇 개를 제거하려고 합니다. 출발지점부터 도착지점까지의 거리 distance, 바위들이 있는 위치를 담은 배열 rocks, 제거할 바위의 수 n이 매개변수로 주어질 때, 바위를 n개 제거한 뒤 각 지점 사이의 거리의 최솟값 중에 가장 큰 값을 return 하도록 solution 함수를 작성해주세요.

일단 이분탐색으로 분류가 된 문제이긴 하지만, 퍼뜩 떠오른 해결방법은 <strong>탐욕법</strong>이었습니다.

이렇게 생각해봅시다. 돌 사이의 간격 중 가장 짧은 것을 선택하여, 인접한 간격 중 짧은 것과 합쳐나가는 겁니다. 하나씩, 하나씩 합쳐가면서 n번 합친 후 가장 짧은 간격을 반환하면 될 것 같지 않나요?

{% highlight csharp %}{% raw %}
using System;
using System.Collections.Generic;
using System.Linq;

public class Solution {
    public int solution(int distance, int[] rocks, int n) {
        // 징검다리 정렬
        Array.Sort(rocks);

        // 돌 간의 간격을 구해줍니다.
        List<int> intervals = new List<int>();
        intervals.Add(rocks.First());
        for (int i = 1; i < rocks.Length; ++i)
            intervals.Add(rocks[i] - rocks[i - 1]);
        intervals.Add(distance - rocks.Last());
        
        while (n-- > 0) {
            // 최단 간격 및 왼쪽과 오른쪽 간격을 구합니다.
            int min = intervals.Min();
            int idx = intervals.IndexOf(min);
            int left = idx == 0 ? distance + 1 : intervals[idx - 1];
            int right = idx == intervals.Count - 1 ? distance + 1 : intervals[idx + 1];
            
            if (left < right) { // 왼쪽이 짧다면 왼쪽 병합
                intervals.RemoveAt(idx);
                intervals.RemoveAt(idx - 1);
                intervals.Insert(idx - 1, min + left);
            }
            else { // 오른쪽이 짧다면 오른쪽 병합
                intervals.RemoveAt(idx + 1);
                intervals.RemoveAt(idx);
                intervals.Insert(idx, min + right);
            }
        }
        
        return intervals.Min();
    }
}
{% endraw %}{% endhighlight %}

짜잔! 테스트 케이스는 통과했고, 이제 제출만 하면 되겠네요.
하지만 이 방법으로는 100점을 받을 수가 없습니다. 어설픈 탐욕법에는 심각한 맹점이 있죠.

```distance = 6, stones = [1,1,1,1,1], n = 4```

위 경우 정답은 3입니다. 5개 돌들 중 양 옆의 2개씩을 치우면 되죠.
문제는, 위 알고리즘으로는 이게 이렇게 됩니다.

```
intervals = [1,1,1,1,1,1]
while n-- > 0: // n = 4
intervals = [2,1,1,1,1] // n = 3
intervals = [2,2,1,1] // n = 2
intervals = [2,2,2] // n = 1
intervals = [4,2] // n = 0
```

모든 간격이 같다고 할 때, 이 방법으로는 무엇을 먼저 합쳐야 할지 전혀 판단할 수가 없죠.

그렇다면 어떻게 해야 하는 걸까요?

일단 돌 간 간격으로 접근하되, 간격의 최소값을 바로 찾는 것이 아니라, <em>이분탐색</em>으로 접근하는 겁니다.

기본적인 이분탐색의 템플릿은 다음처럼 구성할 수 있죠.

```
l = 최소값, r = 최대값
while l < r:
    mid = (l + r) / 2 #중간값을 찾고
    flag = check_condition(mid) # 중간값에 따른 결과를 확인한 후
    if flag == 0: #만일 현재 값이 조건을 만족한다면
        return mid #mid 반환
    elif flag > 0: #값이 조건보다 크다면
        r = mid - 1 #현재 최대값을 반으로 줄여서 다시 탐색
    else: #값이 조건보다 작다면
        l = mid + 1 #현재 최소값을 반 키워서 다시 탐색
return -1
```

우선 check_condition 부분을 만들어봅시다. 중간값이 유효한지 판단하는 기준은 
<strong>중간값이 주어졌을 때, 치워야 하는 돌의 개수</strong>
입니다. 저는 C# 문법으로 이렇게 구성했죠.

{% highlight csharp %}{% raw %}
int dist = 0; // 돌 간 간격을 더할 변수

foreach (int i in intervals) {
    /*
     * 돌을 치우는 것은 달리 생각하자면 앞뒤 간격을 더하는 것으로 바꿔 생각할 수 있습니다.
     * 누적 간격을 중간값과 비교하면 됩니다.
     */
    if ((dist += i) >= mid) // 간격을 누적하고 중간값보다 같거나 길다면
        dist = 0; // 간격 초기화
    else // 누적된 간격이 중간값보다 짧다면
        ++count; // 다음 돌을 치우고 count + 1 해줍니다.
}

bool flag = count <= n; // 치운 돌의 개수가 n보다 같거나 적은지 확인합니다.
{% endraw %}{% endhighlight %}

문제에서는 정확히 n개 치웠을 때의 최단거리를 구하라고 하지만, 위 condition check의 특성상 치우는 돌의 개수가 적어질수록 최단거리 또한 짧아집니다. 돌을 덜 치우고서도 같은 최단거리를 반환한다면 문제풀이에는 영향이 없죠.

이 문제는 일반적인 이중탐색 템플릿에서 약간의 변형이 필요합니다. mid 값을 그대로 뱉어낸다면 문제의 의도와는 다르게 <em>최대값인</em> 최소 간격은 구해지지 않습니다. 조건에 맞는 최소 간격을 구하되, 최대값인 최소 간격을 담아두는 과정이 필요해지죠. 또한 이분탐색 자체는 모든 자연수에 대해 최소값을 구하는 문제이므로 조건식은 타겟을 찾기보다는 값이 더 작아질 수 있는지에 초점을 둡니다.

```
l = 최소값, r = 최대값
min = 0 #최대값을 담을 변수
while l < r:
    mid = (l + r) / 2 #중간값을 찾고
    flag = check_condition(mid) # 중간값에 따른 결과를 확인한 후
    if flag: #만일 현재 값이 조건을 만족한다면
        min = max(mid, min) #현재 중간값이 최대인지 확인합니다.
        l = mid + 1 #현재 최소값을 반 키워서 다시 탐색
    else: #현재 값이 조건을 만족하지 못한다면
        r = mid - 1 #현재 최대값을 반으로 줄여서 다시 탐색
return min
```

위 과정을 토대로 완성된 코드는 다음과 같습니다.

{% highlight csharp %}{% raw %}
using System;
using System.Collections.Generic;
using System.Linq;

public class Solution {
    public int solution(int distance, int[] rocks, int n) {
        // 징검다리 정렬
        Array.Sort(rocks);

        // 돌 간의 간격을 구해줍니다.
        List<int> intervals = new List<int>();
        intervals.Add(rocks.First());
        for (int i = 1; i < rocks.Length; ++i)
            intervals.Add(rocks[i] - rocks[i - 1]);
        intervals.Add(distance - rocks.Last());
        
        // while 문 안에서 쓰일 변수를 미리 선언해줍니다.
        int left = 0; int right = distance;
        int mid, count, dist;
        int min = 0; // 최대값을 담을 변수
        
        while(left <= right) { 
            mid = (left + right) / 2; // 중간값을 찾고
            count = 0; dist = 0;
            
            foreach (int i in intervals) {
                if ((dist += i) >= mid) dist = 0;
                else ++count;
            } // 중간값에 따른 결과를 확인한 후
            
            if (count <= n) { // 만일 현재 값이 조건을 만족한다면
                min = Math.Max(min, mid); // 현재 중간값이 최대인지 확인합니다.
                left = mid + 1; // 현재 최소값을 반 키워서 다시 탐색
            }
            else // 현재 값이 조건을 만족하지 못한다면
                right = mid - 1; // 현재 최대값을 반으로 줄여서 다시 탐색
        }
        return min;
    }
}
{% endraw %}{% endhighlight %}

막상 완성하고 보면 서른 줄 정도의 코드지만(파이썬이라면 더 짧겠죠) 이걸 구성하기까지의 과정이 어려운 거라고 봅니다. 또한 제출된 코드도 고칠 여지가 상당히 많이 남아있어 보입니다. 더 열심히 공부해야겠습니다.