---
layout: post
title:  "블로그 새단장"
date:   2022-01-03 23:30:00 +0900
categories: daily update
---

블로그도 시작했겠다, 이제 슬슬 글을 써보려고 하니 블로그가 너무 심심한 것 같네요.

`minima` theme은 미니멀리즘을 추구하는 저에게 충분하다고 생각은 했지만,
하다못해 side bar 정도는 있는 게 좋지 않을까 합니다. 앞으로 얼마나 많은 글을 써갈지 알 수 없으니
미리미리 블로그 시스템을 구축해 두는 게 좋겠죠?

꼴에 4학년 막바지에 웹 프로그래밍 수업 하나를 들어둔 게 있어서, `ejs`를 이용한 정적 페이지 구축을 어떻게 하는지는 대강 머리 속에 그림이 그려지긴 합니다. `jekyll`의 구조를 보니 조금만 공부해보면 이런저런 요소를 추가해 넣을 수 있을 것 같네요.

{% highlight ruby %}{% raw %}
<!-- ejs -->
<% ... script ... %>

<!-- liquid -->
{% ... script ... %}
{% endraw %}{% endhighlight %}

그런데 `jekyll`을 통해 생성된 directory의 tree를 아무리 살펴봐도, `index.html` 파일이 없네요!
분명 Github 블로그를 시작하려면 `index.html`이 필요할텐데요. 잘 찾아보니, `index.markedown`이 있습니다.
확장자는 다르지만, `index`니까 뭔가 상관이 있는 걸까요?

`jekyll`은 이러한 `markdown` 파일을 찾으면 적절한 `html` 파일로 변환해줍니다.
블로그 디렉터리에서 변환을 명령하면, `jekyll`은 `_site` 디렉터리에 로컬 호스팅을 위한 모든 필요한 파일을 생성해 줍니다.

{% highlight ruby %}
jekyll serve
{% endhighlight %}

![_site](/assets/images/2022-01-03-remodeling-blog/dir_site.png)
`_site` 디렉터리 안을 살펴보면 `index.html` 뿐 아니라 포스트 페이지의 html까지 모두 생성되어 있는 것을 알 수 있습니다. 이것들은 서버에서 hosting할 때에만 필요하고, 블로그 주인은 markdown 파일만 올려두면 되니 사실상 _site 안의 파일들은 로컬 환경에서 Git에 커밋하기 전 확인하는 정도로 쓰이게 됩니다.
_site는 `.gitignore`에 추가해서 쓸데없이 커밋되는 일이 없도록 해줍시다.

그럼 `index.markdown` 파일을 볼까요?

{% highlight ruby %}{% raw %}
---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---
{% endraw %}{% endhighlight %}

위 아래의 `---` 두 줄은 `markdown(md)` 파일을 시작하겠다는 표시입니다. 줄 사이에 필요한 정보들을 넣어주면 됩니다. 참고로 저 두 줄로 파일을 시작하지 않으면 `md` 파일이 적절히 변환되지 않습니다.

#으로 시작하는 줄은 주석이고, 결국 홈페이지는 마지막 한 줄이 변환을 위한 열쇠가 되겠네요.
어떻게 저 한 줄로 깔끔한 레이아웃이 완성될까요?

jekyll을 설치하면서 테마를 사용하기로 했다면, 초기 테마 파일들은 이미 별도의 경로 상에 설치되어 있습니다.
경로를 확인하기 위해서는 다음 명령어를 입력합니다.

{% highlight ruby %}
bundle show [theme_name]
{% endhighlight %}

저는 미니멀리즘을 사랑하니까 `minima`를 쓴다고 했죠?

{% highlight ruby %}
D:\wnwoghd22.github.io>bundle show minima
C:/Ruby30-x64/lib/ruby/gems/3.0.0/gems/minima-2.5.1
{% endhighlight %}

파일 경로를 알아냈다면, 안에 있는 `layouts`를 현재 작업 중인 디렉터리로 가져와 봅시다.
(window cmd 상에서 파일이나 디렉터리를 복사하려면 copy 명령어를 쓰면 됩니다.)

{% highlight ruby %}
copy C:\Ruby30-x64\lib\ruby\gems\3.0.0\gems\minima-2.5.1\_layouts\home.html .\_layouts
{% endhighlight %}

![home](/assets/images/2022-01-03-remodeling-blog/home_html.png)

layout 파일을 가져오는데 성공했습니다.
바로 저 html 파일이 `index.markdown`을 대체한 홈페이지의 정체입니다.
그리고 현재 작업중인 디렉터리로 복사한 `home.html`을 적절히 수정해주면, 입맛에 맞게 레이아웃을 수정하는 것도 가능해집니다. 필요한 건 다 찾았군요!

하지만 side bar를 레이아웃에 넣는 건 다소 길고 복잡한 일이 될 것 같으니, 이번엔 간단한 조작만 해보죠.

제 `YouTube` 채널명은 `Jay`입니다. 이름 가운데 글자가 "재"인데, 외국 친구들이 저를 편하게 부른다는 게 그만 영어 이름이 Jay가 되어버렸죠. 그런데 이게 너무 흔한 이름인지라, `_config.yml`에서 `youtube_username` 을 추가하니 영 엉뚱한 채널로 링크가 걸려버립니다. 채널명 말고, 채널의 id를 대신 넣을 수 없을까요?

홈페이지 하단링크는 `footer.html` 안에 있고, 또 그 안에서도 `social.html` 안에 있습니다.
이 파일을 적절히 수정해 줍니다.

![social](/assets/images/2022-01-03-remodeling-blog/social_html.png)

youtube_username 대신, channel id를 받는 변수를 추가해주었습니다.
그럼 _config.yml에 정보를 추가해 줍시다.

![config](/assets/images/2022-01-03-remodeling-blog/config_yml.png)

이제 채널명 대신 id를 기반으로 링크를 타고 갈 수 있게 되었습니다.

다음에 만들어 볼 것은 포스트를 카테고리 별로 적절히 분류한 리스트와 사이드바가 되겠군요.