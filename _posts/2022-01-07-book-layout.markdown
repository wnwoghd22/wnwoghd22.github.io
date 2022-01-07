---
layout: post
title:  "독서 기록을 해보자!"
date:   2022-01-07 20:00:00 +0900
categories: daily
---

한동안 사이드바 만드는 데에 정신이 팔려서, 다른 건 별로 신경을 쓰지 않고 있었네요.
`pagination` 기능을 구현해 보려고 하던 찰나에 아직 그 기능을 시험해볼 만큼의 게시글이 쌓여있지 않다는 걸 발견해 버렸습니다. 고작 글 4~5개 가지고 몇 페이지 만들어봐야 재미도 없고.

그래서 차라리 <strong>독서 기록을 해보자!</strong>라는 결론에 이르게 되었습니다. 책은 꽤 읽거든요. 이걸로 글을 좀 써넣은 다음에 페이지를 만들어도 늦지는 않겠죠. 평범한 `post` 레이아웃으로 독서 기록을 해도 충분히 멋있겠지만, 그럴듯한 책 소개부터 집어넣어 준다면 더 멋있지 않겠어요?

그럼, `book` 레이아웃을 만들어 봅시다!

우선 `_layouts` 폴더에 `book.html`파일을 만들어 넣겠습니다. (`_layouts` 폴더는 [이전 게시물][sidebar]에서 소개한 바 있습니다.) 흠, 독서 기록은 게시물이죠. A is B 관계가 성립합니다. `book`에 `post`를 상속할 수 있겠네요.

{% highlight html %}{% raw %}
<!-- _layouts/book.html -->
---
layout: post
---

[...]
{% endraw %}{% endhighlight %}
마크다운에서 `book`레이아웃을 지정할 경우 `post` 페이지 내부의 {% raw %}{{ content }}{% endraw %} 는 이제 `book`의 태그들이 우선 삽입됩니다. 제가 만들려고 하는 것은 단지 책의 내용을 소개하는 간단한 테이블 정도니까, 작업은 그리 어렵지 않겠네요.

{% highlight html %}{% raw %}
<!-- _layouts/book.html -->
---
layout: post
---

<table>

<!-- table element -->

</table>
{{ content }}
{% endraw %}{% endhighlight %}

이렇게 별도의 테이블을 만들어 넣죠. 자세한 코드가 궁금하시다면 깃허브에서 파일을 찾아보실 수 있습니다.

![table](/assets/images/2022-01-07-book-layout/table.png)

이만하면 꽤 깔끔하게 책을 소개하면서 글을 시작할 수 있겠네요.

(다르게 보자면, A has B 관계가 될 수도 있습니다. `book` 레이아웃을 별도로 만들 필요 없이, `post` 레이아웃을 쓰면서 글의 맨 위에 `{% raw %}<table>{% endraw %}`만 집어넣으면 되니까요. 하지만 이럴 경우 별도의 테이블 html 파일을 만들어서 `_include` 폴더에 넣고 앞으로 쓰게 될 모든 독서 게시글에 `{% raw %}{%- insert book_table.html -%}{% endraw %}` 문장을 집어넣어야 하니, 그냥 페이지를 상속시키는 것으로 해결했습니다.)

[sidebar]: "https://wnwoghd22.github.io/daily/update/2022/01/03/blog-remodeling.html"
