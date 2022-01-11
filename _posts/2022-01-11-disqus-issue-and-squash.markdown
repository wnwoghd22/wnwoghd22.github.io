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

{% highlight liquid %}{% raw %}
<!-- _layouts/post.html -->
...

  {%- if site.disqus.shortname -%}
    {%- include disqus_comments.html -%}
  {%- endif -%}

...
{% endraw %}{% endhighlight %}

만약 사이트 변수 중 `disqus.shortname`이 정의되어 있다면, 댓글 기능을 활성화하도록 미리 설정되어 있습니다.

{% highlight liquid %}{% raw %}
<!-- _includes/disqus_comments.html -->
{%- if page.comments != false and jekyll.environment == "production" -%}

  <div id="disqus_thread"></div>
  <script>
    var disqus_config = function () {
      this.page.url = '{{ page.url | absolute_url }}';
      this.page.identifier = '{{ page.url | absolute_url }}';
    };

    (function() {
      var d = document, s = d.createElement('script');

      s.src = 'https://{{ site.disqus.shortname }}.disqus.com/embed.js';

      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    })();
  </script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
{%- endif -%}
{% endraw %}{% endhighlight %}

이게 미리 만들어져 있었다니, 그럼 바로 쓰면 되겠네요!

하지만 아직입니다. shortname을 가져와야 합니다.

![get-started](/assets/images/2022-01-10-disqus-comments/get_started.png)

우선 [DISQUS][disqus] 계정을 만듭시다. 회원가입을 완료하고 <strong>Get Started</strong>를 선택합니다.

![want-install](/assets/images/2022-01-10-disqus-comments/want_install.png)

<strong>install</strong>을 선택합니다.

![shortname](/assets/images/2022-01-10-disqus-comments/shortname.png)

페이지의 정보를 입력합니다. 여기서 `Website Name`은 고유한 이름이 되어야 합니다. 이게 바로 shortname이 될 거니까요. 모두 입력했으면 Create Site를 눌러 post 페이지에 갖다쓸 사이트를 만듭시다.

![subscribe](/assets/images/2022-01-10-disqus-comments/subscribe.png)

...하지만 세상에 공짜가 어딨나요. 플랜을 골라야 합니다. <em>스크롤을 내리면</em> 다행히도 최소한의 기능만 갖춘 무료 플랜이 있습니다. Subscribe Now를 선택합니다.

일단 여기까지 만들면 이제 별도로 만들어진 댓글 페이지를 가져다 쓸 수 있습니다.

그럼 코드를 생성해보죠.
(`_includes`에 `disqus_comments.html`파일이 있는지 미리 확인해봅시다. 이게 있으면 생성된 코드를 삽입할 필요가 없습니다.)

![select-jekyll](/assets/images/2022-01-10-disqus-comments/select_jekyll.png)

우리는 jekyll 페이지를 쓰고 있으니까 찾아서 선택해줍시다.

![installation](/assets/images/2022-01-10-disqus-comments/installation.png)

마크다운 파일에서 댓글 기능 활성화를 위한 변수 선언을 하라고 하네요. 그리고 페이지 어딘가에 댓글 창을 위한 태그를 집어넣으라고 합니다. Universal Embeded Code를 확인해보죠.

![universalcode](/assets/images/2022-01-10-disqus-comments/universalcode.png)

이 코드를 if statement 사이에 집어넣으면 된다고 하네요. 그런데 이거, 자세히 보니까 아까 확인했던 코드랑 비슷한데요? 그렇습니다. jekyll에는 disqus 활용을 위한 준비가 갖춰져 있던 겁니다.

그럼 본격적으로 저 블록을 활성화해봅시다.

일단 `_config.yml`을 수정해주죠.

{% highlight yaml %}{% raw %}
#_config.yml
...

disqus:
  shortname: blog-jay

...
{% endraw %}{% endhighlight %}

`shortname` 에는 본인이 지은 <strong>Website Name</strong>을 넣읍시다. 이렇게 되면 모든 페이지의 기본 변수로 disqus.shortname이 정의됩니다. 그리고 전 모든 페이지가 기본적으로 댓글기능이 활성화되고, 선택적으로 기능을 끄고 싶습니다. `post.html`에 한 줄 추가해 줍니다.
{% highlight liquid %}{% raw %}
<!-- post.html -->
---
layout: default
comments: true
---
{% endraw %}{% endhighlight %}

그리고 `disqus_comments.html`의 몇 부분을 수정해 주어야 합니다.
{% highlight liquid %}{% raw %}
<!-- disqus_comments.html -->
    ...
    //this.page.identifier = '{{ page.url | absolute_url }}';
    this.page.identifier = '{{ page.id }}';
    ...   
    s.src = 'https://{{ site.disqus.shortname }}.disqus.com/embed.js';
    ...
{% endraw %}{% endhighlight %}

일단 shortname이 만들어졌다고 해도, 블로그에 만들어질 모든 포스트는 각각의 댓글들을 가질 겁니다. 그렇다면 그 각각의 포스트는 고유한 이름을 가지고 저장된 댓글을 불러오거나 새로운 댓글을 저장할 수 있어야 합니다. 이를 위해 필요한 변수를 설정해 주어야 하죠. 만약 jeykll에서 미리 만들어둔 파일이 있다면, `page.identifier`가 `page.url`로 설정되어 있을 수 있습니다. 이걸 `page.id`로 바꿔줍니다.

그리고 댓글창 요청을 위한 주소를 만들어 줘야 합니다. `shortname`을 직접 집어넣을 수도 있지만, liquid 포맷에 따라 `_config.yml` 파일만 수정해줘도 알아서 들어가게 되어있네요. 직접 넣고싶다면 고쳐줍시다.

이 상태에서 localhost로 테스트해보려고 하면, 댓글 창이 나오지 않습니다. `jekyll.environment` 변수가 <em>development</em>로 설정되어 있기 때문인데요, 이건 깃허브에 커밋한 후 `.github.io`페이지로 들어가게 되면 `production`으로 설정됩니다. 아니면serve하실 때 `JEKYLL_ENV=production` argument를 추가하여 별도로 설정해 줍니다.

![result](/assets/images/2022-01-10-disqus-comments/result.png)

성공이군요! 이번 포스트는 여기까지 하겠습니다.

[gowebfinal]:https://github.com/thhj153/gowebfinal
[disqus]:https://disqus.com/