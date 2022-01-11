---
layout: post
title:  "DISQUS 이슈 해결 & Git Squash"
date:   2022-01-11 14:00:00 +0900
categories: daily
---

어제 DISQUS를 가져다 쓰기로 해놓고는, 로컬 환경에서만 시험해보고 실제 블로그로 들어가 봤을 때에는 로딩이 되지 않는 것을 확인했습니다. 대체 뭐가 문제인지, DISQUS에서 맵핑도 해보고 페이지를 새로 만들어보기도 했습니다. 만, 결국 문제는 DISQUS 쪽이 아니라 내 페이지 쪽 문제인 것 같아 먼 길을 돌아와야 했습니다.

가장 고전적인 방식으로 디버깅을 해봤죠.

{% highlight liquid %}{% raw %}
<!-- _includes/disqus_comments.html -->
{{ page.url | absolute_url }}
{{ page.id }}
{{ site.disqus.shortname }}

{%- if page.comments != false and jekyll.environment == "production" -%}
...
{% endraw %}{% endhighlight %}

댓글 창을 띄우는 데 필요한 모든 변수를 화면에 띄워서 확인해 보는 겁니다! 로컬 환경과 실제 서버에서 로딩된 페이지의 내용에는 분명히 차이가 있으니까 이런 문제가 발생했을 테지요.

![test](/assets/images/2022-01-11-disqus-issue-and-squash/test.png)

문제의 원인을 찾은 것 같네요. `page.url`이 완전한 절대경로를 반환하지 않습니다. DISQUS가 요구하는 주소값이 아니었던 겁니다. 제가 원하는 반환값은 `https://wnwoghd22.github.io/[page.url]`인데, 왜 이런 값이 나온 걸까요?

![test](/assets/images/2022-01-11-disqus-issue-and-squash/filter.png)

문제의 `absolute_url` 필터를 자세히 알아보면 그 원인이 분명합니다. 이 필터는 미리 정의된 `url`을 주어진 `page.url` 앞에 붙여주는 녀석입니다. 그리고 `url`은 localhost에서는 environment가 <em>development</em>로 설정되어 있으므로 `_config.yml`에 정의된 값이 아닌, `[host]:[port]`로 바뀌게 됩니다. 그래서 로컬 환경에서는 의도치 않게 절대 경로를 반환한 반면, 실제 호스팅된 페이지에서는 불완전한 경로가 튀어나온 것이죠.

해결방법은 무척이나 간단합니다. `_config.yml`에서 `url`을 써주면 됩니다.

{% highlight yaml %}{% raw %}
#_config.yml
...


baseurl: "" # the subpath of your site, e.g. /blog
url: "https://wnwoghd22.github.io"

...
{% endraw %}{% endhighlight %}

내용을 수정한 후에 커밋합니다.

![solve](/assets/images/2022-01-11-disqus-issue-and-squash/solve.png)

성공이네요! 이제 제대로 댓글 기능을 쓸 수 있게 되었습니다.

하지만 고전적인 디버깅 방식을 쓰느라 사소한 변경을 조금씩 커밋하다보니 결과적으로는 config 파일에 한 줄 추가한 것이 5번의 history로 남아버렸습니다. 이럴 때 쓸 만한 것이 git의 <strong>squash</strong>입니다.

<hr>
<br/>
<h2>Git Squash</h2>

![example](/assets/images/2022-01-11-disqus-issue-and-squash/squash_example.png)

다섯번의 커밋을 물론 그대로 둬도 결과는 달라지지 않겠지만, 협업 환경에서라면 이건 꽤 보기 불편해질 겁니다. 괜히 history를 복잡하게 만들죠. 그럼 한번 실제로 해봅시다.

![three-commits](/assets/images/2022-01-11-disqus-issue-and-squash/three_commits.png)

게시글 페이지 기능을 만들면서 사소한 변경들을 3번에 나눠 커밋한 기록이 있습니다. 이걸 합치면...

![squashing](/assets/images/2022-01-11-disqus-issue-and-squash/squashing.png)

![squash-result](/assets/images/2022-01-11-disqus-issue-and-squash/squash_result.png)

3개의 커밋 내용이 합쳐지고, 그 후의 커밋들도 업데이트됩니다. 좀 더 보기좋게 정리가 되었네요. `Git`은 쓰면 쓸수록 새로운 도구네요... 제대로 된 개발자가 되려면 멀었나 봅니다.