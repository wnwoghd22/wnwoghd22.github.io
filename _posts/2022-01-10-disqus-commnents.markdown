---
layout: post
title:  "DISQUS 댓글 기능 활성화"
date:   2022-01-10 14:00:00 +0900
categories: daily
---

포스트 30개를 채우면 페이지네이션 기능을 구현하기로 했는데, 포스트를 쓰면서 문득 허전하다는 생각이 들었습니다. 가만 보니, 댓글 기능이 없군요. 커뮤니티가 활성화되어야 블로그도 재미가 있을텐데요. 그럼 `jekyll` 블로그에 댓글 기능을 만들어봅시다!

그런데 그게, <strong>불가능합니다</strong>.

아니 무슨 뚱딴지같은 소리냐 하시겠지만, 사실이 그런 것을 어쩌겠어요. `jekyll`은 정적 페이지를 생성합니다. 페이지에서 그 어떤 행동을 취하든, 페이지의 내용이 바뀌지 않는다는 거죠. 특히 `GitHub`로 블로그를 호스팅한다면, 우리는 서버 내부에서 작동할 함수들을 정의할 수도 없습니다. 이래서는 서버에는 클라이언트의 목소리가 닿지 않습니다. 좀 더 자세히 알아보죠.

기술 블로그를 드나드는 사람이라면 이런 내용까지 모를 리는 없겠지만, 그래도 기본부터 훑어봅시다. 웹 페이지를 포함하여 모든 자료를 가지고 나눠주는 <strong>서버</strong>와 나눠주는 정보를 가지고 화면을 띄우는 등 행동을 하는 <strong>클라이언트</strong> 각각이 제 기능을 다 하고 있기 때문에 우리는 집에서 웹 서핑을 하고 전자 결제를 할 수도 있습니다. 그리고 이 웹 클라이언트가 서버에 자료를 요청할 때에는 몇 가지 방식이 있습니다.

`GET` : 단순히 페이지 리소스를 요청합니다. `<a>`링크를 이용하면 기본적으로 이 요청방식으로 이루어집니다.

`POST` : 페이지 리소스를 요청하거나 <em>수정할 수 있습니다</em>. 대표적으로는 `<form>`태그로 POST 요청을 할 수 있죠.

웹 페이지에서 링크를 만들거나 요청 버튼을 만들 때는 `GET`방식과 `POST`방식 중 하나를 선택하게 됩니다. 그리고 우리가 원하는 댓글 기능은 대체로 이런 형태로 정의되죠.

{% highlight html %}{% raw %}
<form action="/comment/store" method="POST">     
    <textarea id="comment" name="comment" required></textarea>
    <button type="submit" id="sendMessageButton">SUBMIT</button>
</form>
{% endraw %}{% endhighlight %}

그러면 서버측에서는 요청받은 페이지에서 정보를 처리할 [함수][gowebfinal]를 부릅니다.

{% highlight javascript %}{% raw %}
//storeComment.js

/* 예제의 Comment는 mongoose Schema로 정의되어 있습니다.
   혹시나 전체 소스코드가 궁금하다면 링크의 레포지터리를 참조하세요. */
const Comment = require("../../models/Comment.js");

module.exports = async (req, res) => {

  const { selectedPost } = req.session;
  await Comment.create({
    body: req.body.comment,
    userid: req.session.userId,
    postid: selectedPost._id,
  });

  res.redirect([post_url]);
};

[...]

//index.js

const storeCommentController = require("./storeComment");
app.post("/comment/store", storeCommentController);
{% endraw %}{% endhighlight %}

`AWS`나 `Mongoose` 등으로 서버를 호스팅할 때, 페이지 요청 형태에 따라 이를 처리할 컨트롤러 함수를 만들고, 이 함수의 내부에서 댓글 정보를 저장하는 기능을 구현할 수 있습니다. 위 소스코드에서는 mongoose에 미리 정의된 create라는 DB 기능을 이용했습니다. 그럼 깃허브에서도 이렇게 만들면 되지 않을까요?

<form action="{{page.url}}" method="POST">     
    <textarea id="body" name="body" required></textarea>
    <button type="submit" id="sendMessageButton">SUBMIT</button>
</form>

위의 댓글창에 내용을 입력하고 SUBMIT 버튼을 누르면 `POST`방식으로 댓글을 서버에 보냅니다. 그러면 DB에 댓글이 저장되고, 페이지에는 저장된 댓글을 출력하면 되죠. 짜잔! 그런데, 그게 될까요?

![test-comment](/assets/images/2022-01-10-disqus-comments/test_comment.png)
![method_not_allowed](/assets/images/2022-01-10-disqus-comments/method_not_allowed.png)

우리 개발자들이 너무나 사랑해 마지않는 빨간 글씨가 보이네요! 쩝, 안타깝게도 `jekyll`의 `static page`는 POST를 활용할 수가 없습니다. 대신, 내용이 변하지 않는 페이지라도 다른 댓글 기능을 지원하는 페이지의 링크를 가져다가 부분적인 댓글 창을 띄우는 건 할 수 있습니다. 그리고 그 창 내부에서 `GitHub`가 아닌 <em>별도로 만들어진 서버로 POST 요청을 보낸다면</em>, 댓글을 수정하고 실시간으로 변경하는 것도 가능하죠.

그리고 다행스럽게도, `jekyll`에는 이를 위한 준비가 갖춰져 있습니다.

<hr>
<br/>
<h2>DISQUS 갖다쓰기</h2>

블로그 레이아웃을 뜯어고치면서, `minima`의 미리 만들어둔 레이아웃을 모두 다운받은 바 있습니다. 내용을 한번 확인해볼까요. <em>저는 `minima` 2.5.1 버전을 쓰고 있습니다. 버전 및 다른 빌드 조건이 다를 경우 layouts 안에는 disqus와 관련된 기능들이 미리 만들어져 있지 않을 수도 있습니다.</em> 

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